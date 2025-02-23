from flask import jsonify
import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib
from datetime import datetime
import base64
from io import BytesIO
from claid.data_collection.load.load_sensor_data import *
from datetime import datetime
from app import db
from app.models.heartrate import HeartrateMetric
from sqlalchemy import text



pathToData = os.path.join("app", "data", "DDB")


class HeartrateService:
    @staticmethod
    def query_heartrate_data(user_id: str, from_time: datetime, to_time: datetime, offset: int = 0):
        if from_time is None or to_time is None or to_time < from_time:
            return pd.DataFrame()
        query = text("""
            SELECT 
                user_id,
                unix_timestamp,
                heartrate,
                status
            FROM heartrate_metrics
            WHERE user_id = :user_id
            AND unix_timestamp BETWEEN :from_time AND :to_time;
        """)

        # Execute the query with parameters
        result = db.session.execute(query, {'user_id': user_id, 'from_time': from_time, 'to_time': to_time})

        # Convert the result directly into a DataFrame
        df = pd.DataFrame(result.fetchall(), columns=result.keys())

        # Adapt time zone offset
        df['unix_timestamp'] = df['unix_timestamp'] + offset

        # Perform necessary type conversions directly in pandas
        df['time'] = pd.to_datetime(df['unix_timestamp'], unit='s')
        df = df.drop(columns=['unix_timestamp'])
        df = df.sort_values(by='time')
        df['status'] = df['status'].astype('int32')  # Optimized for memory usage
        df['heartrate'] = df['heartrate'].astype('int32')
        df['user_id'] = df['user_id'].astype('str')

        return df

    @staticmethod
    def get_heartrate_graph(user_id: str, from_time: int, to_time: int, offset: int):
        # Query the data from the database
        df = HeartrateService.query_heartrate_data(user_id, from_time, to_time, offset)        

        # Check if the dataframe is empty after filtering
        if df.empty:
            return jsonify({"error": "No data available for the given timeframe"}, 404)

        # Plot the data
        # Plot the data with different lines for different statuses
        matplotlib.use('Agg')
        fig, ax = plt.subplots(figsize=(12, 6))  # Set the figure size to 2:1 ratio

        # Define status labels and colors
        status_labels = {
            0: 'Ok',
            1: 'Other_ppg_sensor_running',
            2: 'No_data',
            3: 'PPG_signal_too_weak',
            4: 'Measurement_unreliable',
            5: 'Off_body',
            6: 'Initializing',
            7: 'HR_status_unknown'
        }

        # Plot only status 0 with the specified color
        status_df = df[df['status'] == 0]
        ax.plot(status_df['time'].to_numpy(), status_df['heartrate'].to_numpy(), color="red", zorder=1, label='Heartrate')

        # Highlight intervals with status 5 that last longer than a minute to reduce measuring errors
        off_body_intervals = []
        current_interval = []
        for i, row in df.iterrows():
            if row['status'] == 5:
                current_interval.append(row['time'])
            else:
                if len(current_interval) >= 60:
                    off_body_intervals.append(current_interval)
                current_interval = []

        # Add the last interval if it exists and has at least 60 points
        if len(current_interval) >= 60:
            off_body_intervals.append(current_interval)
        
        # Merge intervals that are less than a minute apart to reduce measuring errors
        merged_intervals = []
        for interval in off_body_intervals:
            if not merged_intervals:
                merged_intervals.append(interval)
            else:
                last_interval = merged_intervals[-1]
                if (interval[0] - last_interval[-1]).total_seconds() < 60:
                    merged_intervals[-1] = last_interval + interval
                else:
                    merged_intervals.append(interval)

        off_body_intervals = merged_intervals

        for interval in off_body_intervals:
            ax.axvspan(interval[0], interval[-1], color='lightblue', alpha=1, label='Off Body')

        ax.xaxis.set_major_locator(mdates.AutoDateLocator(maxticks=24))
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%d.%m. %H:%M'))
        plt.xticks(rotation=45)
        plt.xlabel('Time')
        plt.ylabel('Heartrate')
        plt.grid()
        plt.tight_layout()

        # Add legend
        handles, labels = ax.get_legend_handles_labels()
        by_label = dict(zip(labels, handles))
        ax.legend(by_label.values(), by_label.keys())

        # Encode the plot to base64 without saving it to a file
        img_buffer = BytesIO()
        plt.savefig(img_buffer, format='png')
        plt.close()
        img_buffer.seek(0)
        encoded_string = base64.b64encode(img_buffer.read()).decode('utf-8')

        # Get statistics about the data for the alt text
        start_time = df['time'].min().strftime('%Y-%m-%d %H:%M:%S')
        end_time = df['time'].max().strftime('%Y-%m-%d %H:%M:%S')

        # Filter the dataframe to include only status 0
        df_status_0 = df[df['status'] == 0]

        # Get the statistics for the heartrate data
        min_value = int(df_status_0['heartrate'].min())
        max_value = int(df_status_0['heartrate'].max())
        mean_value = int(df_status_0['heartrate'].mean())
        median_value = int(df_status_0['heartrate'].median())
        quantiles = df_status_0['heartrate'].quantile([0.25, 0.75])
        trend = np.polyfit(df_status_0.index, df_status_0['heartrate'], 1)

        # Get the outliers
        IQR = quantiles[0.75] - quantiles[0.25]
        lower_bound = quantiles[0.25] - 1.5 * IQR
        upper_bound = quantiles[0.75] + 1.5 * IQR
        outliers = df_status_0[(df_status_0['heartrate'] < lower_bound) | (df_status_0['heartrate'] > upper_bound)]
        outlier_examples = outliers.sample(min(5, len(outliers)))
        outlier_descriptions = []
        for _, row in outlier_examples.iterrows():
            outlier_descriptions.append(f"{row['time'].strftime('%Y-%m-%d %H:%M:%S')}: {row['heartrate']}")

        # Alt text
        alt = (
            f"Graph showing the heartrate from {start_time} to {end_time}. "
            f"The minimum heartrate is {min_value}, the maximum heartrate is {max_value}, "
            f"the mean heartrate is {mean_value}, and the median heartrate is {median_value}. "
            f"The 25th percentile is {quantiles[0.25]} and the 75th percentile is {quantiles[0.75]}. "
            f"The standard deviation is {df['heartrate'].std()}."
            f"The trend line equation is y = {trend[0]:.2f}x {'+' if trend[1] >= 0 else '-'} {abs(trend[1]):.2f}."
            f"There are {len(outliers)} outliers detected. "
            f"Examples of heartrate outliers: {'; '.join(outlier_descriptions)}. "
            f"Intervals where the watch was not worn for at least a minute: "
            f"{'; '.join([f'''{interval[0].strftime('%m-%d %H:%M:%S')} to {interval[-1].strftime('%m-%d %H:%M:%S')}''' for interval in off_body_intervals])}."
        )

        # Return the base64 encoded image in a JSON response
        return jsonify(
            {
                "title": "Heartrate graph from " + datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m.") + " to " + datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m."),
                "alt": alt,
                "image": encoded_string,
                "mean": mean_value,
                "std": df['heartrate'].std(),
                "median": median_value,
                "min": min_value,
                "max": max_value,
                "start_time": datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m."),
                "end_time": datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m.")
            }
        )

    @staticmethod
    def download_data(user_id: str, from_time: int, to_time: int):  
        print("Getting heartrate data for user", user_id, "from", from_time, "to", to_time)

        # Query the data from the database
        df = HeartrateService.query_heartrate_data(user_id, from_time, to_time)        

        # Check if the dataframe is empty after filtering
        if df.empty:
            return jsonify({"error": "No data available for the given timeframe"}, 404)

        print("Data loaded")

        # Drop the 'user_id' column
        df = df.drop(columns=['user_id'])

        # Convert the DataFrame to CSV
        csv_data = df.to_csv(index=False)

        # Create a response with the CSV data as a file
        response = jsonify({"message": "Data download successful"})
        response.headers["Content-Disposition"] = f"attachment; filename=heartrate_data_{df['time'].min()}_{df['time'].max()}.csv"
        response.headers["Content-Type"] = "text/csv"
        response.data = csv_data

        return response


    @staticmethod
    def get_last_updated(user_id: str, from_time: int, to_time: int) -> int:
        last_record = (
            db.session.query(HeartrateMetric.unix_timestamp)
            .filter(
                HeartrateMetric.user_id == user_id,
                HeartrateMetric.unix_timestamp >= from_time,
                HeartrateMetric.unix_timestamp <= to_time,
            )
            .order_by(HeartrateMetric.unix_timestamp.desc())
            .first()
        )

        if not last_record:
            return None
        return last_record.unix_timestamp
