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
from app import db
from app.models.acceleration import AccelerationMetric
from sqlalchemy import text



pathToData = os.path.join("app", "data", "DDB")


class AccelerationService:
    @staticmethod
    def query_acceleration_data(user_id: str, from_time: int, to_time: int, offset: int = 0):
        if from_time is None or to_time is None or to_time < from_time:
            return pd.DataFrame() # Return an empty DataFrame if the input is invalid
        # Perform a raw SQL query for high performance
        query = text("""
        SELECT user_id,
            unix_timestamp,
            acceleration_x,
            acceleration_y,
            acceleration_z,
            vector_magnitude
        FROM acceleration_metrics
        WHERE user_id = :user_id
        AND unix_timestamp BETWEEN :from_time AND :to_time;
        """)

        # Use db.session.execute to run the query
        result = db.session.execute(query, {'user_id': user_id, 'from_time': from_time, 'to_time': to_time})

        # Convert the result directly into a DataFrame
        df = pd.DataFrame(result.fetchall(), columns=result.keys())

        if df.empty:
            return df

        # Adapt the time zone offset
        df['unix_timestamp'] = df['unix_timestamp'] + offset

        # Perform necessary type conversions directly in pandas
        df['time'] = pd.to_datetime(df['unix_timestamp'], unit='s')
        df = df.drop(columns=['unix_timestamp'])
        df = df.sort_values(by='time')
        df['user_id'] = df['user_id'].astype(str)
        df['acceleration_x'] = df['acceleration_x'].astype('int32')
        df['acceleration_y'] = df['acceleration_y'].astype('int32')
        df['acceleration_z'] = df['acceleration_z'].astype('int32')
        df['vector_magnitude'] = df['vector_magnitude'].astype('int32')
        
        return df
    
    @staticmethod
    def get_acceleration_graph_xyz(user_id: str, from_time: int, to_time: int, offset: int):
        print("Getting acceleration data for user", user_id, "from", from_time, "to", to_time)

        # Query the database for the acceleration data
        df = AccelerationService.query_acceleration_data(user_id, from_time, to_time, offset)

        if df.empty:
            return jsonify({"error": "No data available for the given timeframe"}, 404)
        
        print("Data loaded")
        
        # Resample the data
        df = AccelerationService.resample_df(df)

        # Plot the data
        matplotlib.use('Agg')
        fig, ax = plt.subplots(figsize=(12, 6))
        ax.plot(df['time'].to_numpy(), df['acceleration_x'].to_numpy(), label='X')
        ax.plot(df['time'].to_numpy(), df['acceleration_y'].to_numpy(), label='Y')
        ax.plot(df['time'].to_numpy(), df['acceleration_z'].to_numpy(), label='Z')
        ax.xaxis.set_major_locator(mdates.AutoDateLocator(maxticks=24))
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%d.%m. %H:%M'))
        plt.xticks(rotation=45)
        plt.xlabel("Time")
        plt.ylabel("Acceleration")
        plt.legend()
        plt.grid()
        plt.tight_layout()
        


        # Encode the plot to base64 without saving it to a file
        img_buffer = BytesIO()
        plt.savefig(img_buffer, format='png')
        plt.close()
        img_buffer.seek(0)
        encoded_string = base64.b64encode(img_buffer.read()).decode('utf-8')

        # Get statistics about the data for the alt text

        start_time = df['time'].min().strftime('%Y-%m-%d %H:%M:%S')
        end_time = df['time'].max().strftime('%Y-%m-%d %H:%M:%S')

        # X and Outliers
        min_value_x = int(df['acceleration_x'].min())
        max_value_x = int(df['acceleration_x'].max())
        mean_value_x = int(df['acceleration_x'].mean())
        median_value_x = int(df['acceleration_x'].median())
        quantiles_x = df['acceleration_x'].quantile([0.25, 0.75]).to_dict()
        trend_x = np.polyfit(df['time'].map(datetime.toordinal), df['acceleration_x'], 1)
        
        IQR_x = quantiles_x[0.75] - quantiles_x[0.25]
        lower_bound_x = quantiles_x[0.25] - 1.5 * IQR_x
        upper_bound_x = quantiles_x[0.75] + 1.5 * IQR_x
        outliers_x = df[(df['acceleration_x'] < lower_bound_x) | (df['acceleration_x'] > upper_bound_x)]
        outlier_examples_x = outliers_x.sample(min(5, len(outliers_x))).to_dict(orient='records')
        outlier_examples_x = sorted(outlier_examples_x, key=lambda x: x['time'])
        outlier_descriptions_x = []
        for outlier in outlier_examples_x:
            outlier_descriptions_x.append(f"Outlier at {outlier['time']} with value {outlier['acceleration_x']}")

        # Y and Outliers
        min_value_y = int(df['acceleration_y'].min())
        max_value_y = int(df['acceleration_y'].max())
        mean_value_y = int(df['acceleration_y'].mean())
        median_value_y = int(df['acceleration_y'].median())
        quantiles_y = df['acceleration_y'].quantile([0.25, 0.75]).to_dict()
        trend_y = np.polyfit(df['time'].map(datetime.toordinal), df['acceleration_y'], 1)

        IQR_y = quantiles_y[0.75] - quantiles_y[0.25]
        lower_bound_y = quantiles_y[0.25] - 1.5 * IQR_y
        upper_bound_y = quantiles_y[0.75] + 1.5 * IQR_y
        outliers_y = df[(df['acceleration_y'] < lower_bound_y) | (df['acceleration_y'] > upper_bound_y)]
        outlier_examples_y = outliers_y.sample(min(5, len(outliers_y))).to_dict(orient='records')
        outlier_examples_y = sorted(outlier_examples_y, key=lambda x: x['time'])
        outlier_descriptions_y = []
        for outlier in outlier_examples_y:
            outlier_descriptions_y.append(f"Outlier at {outlier['time']} with value {outlier['acceleration_y']}")

        # Z and Outliers
        min_value_z = int(df['acceleration_z'].min())
        max_value_z = int(df['acceleration_z'].max())
        mean_value_z = int(df['acceleration_z'].mean())
        median_value_z = int(df['acceleration_z'].median())
        quantiles_z = df['acceleration_z'].quantile([0.25, 0.75]).to_dict()
        trend_z = np.polyfit(df['time'].map(datetime.toordinal), df['acceleration_z'], 1)

        IQR_z = quantiles_z[0.75] - quantiles_z[0.25]
        lower_bound_z = quantiles_z[0.25] - 1.5 * IQR_z
        upper_bound_z = quantiles_z[0.75] + 1.5 * IQR_z
        outliers_z = df[(df['acceleration_z'] < lower_bound_z) | (df['acceleration_z'] > upper_bound_z)]
        outlier_examples_z = outliers_z.sample(min(5, len(outliers_z))).to_dict(orient='records')
        outlier_examples_z = sorted(outlier_examples_z, key=lambda x: x['time'])
        outlier_descriptions_z = []
        for outlier in outlier_examples_z:
            outlier_descriptions_z.append(f"Outlier at {outlier['time']} with value {outlier['acceleration_z']}")

        # Alt text generation
        alt = (
            f"Graph showing acceleration in x, y, and z axes of the watch from {start_time} to {end_time}. "
            f"The minimum acceleration in the x-axis is {min_value_x}, the maximum is {max_value_x}, "
            f"the mean value is {mean_value_x}, and the median value is {median_value_x}. "
            f"The 25th percentile for the x axis acceleration is {quantiles_x[0.25]} and the 75th percentile is {quantiles_x[0.75]}. "
            f"The trend line equation for the x-axis acceleration is y = {trend_x[0]:.2f}x {'+' if trend_x[1] >= 0 else '-'} {abs(trend_x[1]):.2f}."
            f"There are {len(outliers_x)} outliers detected in the x-axis acceleration. "
            f"Examples of outliers: {'; '.join(outlier_descriptions_x)}. "
            f"The minimum acceleration in the y-axis is {min_value_y}, the maximum is {max_value_y}, "
            f"the mean value is {mean_value_y}, and the median value is {median_value_y}. "
            f"The 25th percentile for the y axis acceleration is {quantiles_y[0.25]} and the 75th percentile is {quantiles_y[0.75]}. "
            f"The trend line equation for the y-axis acceleration is y = {trend_y[0]:.2f}x {'+' if trend_y[1] >= 0 else '-'} {abs(trend_y[1]):.2f}."
            f"There are {len(outliers_y)} outliers detected in the y-axis acceleration. "
            f"Examples of outliers: {'; '.join(outlier_descriptions_y)}. "
            f"The minimum acceleration in the z-axis is {min_value_z}, the maximum is {max_value_z}, "
            f"the mean value is {mean_value_z}, and the median value is {median_value_z}. "
            f"The 25th percentile for the z axis acceleration is {quantiles_z[0.25]} and the 75th percentile is {quantiles_z[0.75]}. "
            f"The trend line equation for the z-axis acceleration is y = {trend_z[0]:.2f}x {'+' if trend_z[1] >= 0 else '-'} {abs(trend_z[1]):.2f}."
            f"There are {len(outliers_z)} outliers detected in the z-axis acceleration. "
            f"Examples of outliers: {'; '.join(outlier_descriptions_z)}."
        )

        # Return the base64 encoded image in a JSON response together with the statistics for potential display in a frontend
        return jsonify(
            {
            "title": "XYZ Acceleration Data from " + datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m.") + " to " + datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m."), 
            "image": encoded_string, 
            "alt": alt, 
            "start_time": datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m."),
            "end_time": datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m."),
            "mean_x": mean_value_x,
            "std_x": df['acceleration_x'].std(),
            "median_x": median_value_x,
            "min_x": min_value_x,
            "max_x": max_value_x,
            "mean_y": mean_value_y,
            "std_y": df['acceleration_y'].std(),
            "median_y": median_value_y,
            "min_y": min_value_y,
            "max_y": max_value_y,
            "mean_z": mean_value_z,
            "std_z": df['acceleration_z'].std(),
            "median_z": median_value_z,
            "min_z": min_value_z,
            "max_z": max_value_z
            }
        )
    
    @staticmethod
    def get_acceleration_graph_vector(user_id: str, from_time: int, to_time: int, offset: int):
        print("Getting acceleration data for user", user_id, "from", from_time, "to", to_time)
        print("Current timestamp:", datetime.now().timestamp())
        
        # Query the database for the acceleration data
        df = AccelerationService.query_acceleration_data(user_id, from_time, to_time, offset)

        # Check if the dataframe is empty after querying
        if df.empty:
            return jsonify({"error": "No data available for the given timeframe"}, 404)
        
        print("Data loaded")
        
        # Resample the data
        df = AccelerationService.resample_df(df)

        # Plot the data
        matplotlib.use('Agg')
        fig, ax = plt.subplots(figsize=(12, 6))
        ax.plot(df["time"].to_numpy(), df["vector_magnitude"].to_numpy())
        ax.xaxis.set_major_locator(mdates.AutoDateLocator(maxticks=24))
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%d.%m. %H:%M'))
        plt.xticks(rotation=45)
        plt.xlabel("Time")
        plt.ylabel("Vector Magnitude")
        plt.grid()
        plt.tight_layout()

        # Get statistics about the data for the alt text
        min_value = int(df["vector_magnitude"].min())
        max_value = int(df["vector_magnitude"].max())
        start_time = df["time"].min().strftime("%Y-%m-%d %H:%M:%S")
        end_time = df["time"].max().strftime("%Y-%m-%d %H:%M:%S")
        mean_value = int(df["vector_magnitude"].mean())
        median_value = int(df["vector_magnitude"].median())
        quantiles = df["vector_magnitude"].quantile([0.25, 0.75]).to_dict()
        trend = np.polyfit(df["time"].map(datetime.toordinal), df["vector_magnitude"], 1)

        # Detect outliers using the IQR method
        Q1 = quantiles[0.25]
        Q3 = quantiles[0.75]
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        outliers = df[(df["vector_magnitude"] < lower_bound) | (df["vector_magnitude"] > upper_bound)]

        # Get up to 5 random examples of outliers for the alt text
        outlier_examples = outliers.sample(min(5, len(outliers))).to_dict(
            orient="records"
        )
        outlier_examples = sorted(outlier_examples, key=lambda x: x["time"])

        # Generate descriptions for the outliers
        outlier_descriptions = []
        for outlier in outlier_examples:
            outlier_descriptions.append(
                f"Outlier at {outlier['time']} with value {outlier['vector_magnitude']}"
            )

        # Create the alt text
        alt = (
            f"Graph showing vector magnitude as proxy for acceleration from {start_time} to {end_time}. "
            f"The minimum vector magnitude is {min_value}, the maximum vector magnitude is {max_value}, "
            f"the mean value is {mean_value}, and the median value is {median_value}. "
            f"The 25th percentile is {quantiles[0.25]} and the 75th percentile is {quantiles[0.75]}. "
            f"The standard deviation is {df['vector_magnitude'].std()}."
            f"The trend line equation is y = {trend[0]:.2f}x {'+' if trend[1] >= 0 else '-'} {abs(trend[1]):.2f}."
            f" There are {len(outliers)} outliers detected. "
            f"Examples of outliers: {'; '.join(outlier_descriptions)}"
        )

        # Encode the plot to base64 without saving it to a file
        img_buffer = BytesIO()
        plt.savefig(img_buffer, format="png")
        plt.close()
        img_buffer.seek(0)
        encoded_string = base64.b64encode(img_buffer.read()).decode("utf-8")

        # Return the base64 encoded image in a JSON response together with the statistics for potential display in a frontend
        return jsonify(
            {   
            "title": "Acceleration Data from " + datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m.") + " to " + datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m."), 
            "image": encoded_string, 
            "alt": alt, 
            "mean": mean_value,
            "std": df['vector_magnitude'].std(),
            "median": median_value,
            "min": min_value,
            "max": max_value,
            "start_time": datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m."),
            "end_time": datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S").strftime("%H:%M %d.%m."),
             }
        )


    @staticmethod
    def download_data(user_id: str, from_time: int, to_time: int):
        print("Getting acceleration data for user", user_id, "from", from_time, "to", to_time)
        
        # Query the database for the acceleration data
        df = AccelerationService.query_acceleration_data(user_id, from_time, to_time)
        
        print("Data loaded")

        if df.empty:
            return jsonify({"error": "No data available for the given timeframe"}, 404)
        
        # Drop the 'user_id' column
        df = df.drop(columns=['user_id'])

        # Convert the DataFrame to CSV
        csv_data = df.to_csv(index=False)

        # Create a response with the CSV data as a file
        response = jsonify({"message": "Data download successful"})
        response.headers["Content-Disposition"] = f"attachment; filename=acceleration_data_{df['time'].min()}_{df['time'].max()}.csv"
        response.headers["Content-Type"] = "text/csv"
        response.data = csv_data

        return response
    
    @staticmethod
    def resample_df(df, freq='1min'):
        """
        Resample the data to a resolution based on the timeframe of the data.
        """
        # Determine the sample frequency based on the timeframe
        timeframe_seconds = (df['time'].max() - df['time'].min()).total_seconds()
        if timeframe_seconds <= 3600:  # 1 hour
            sample_freq = '1min'  # 1 minute
        elif timeframe_seconds <= 86400:  # 1 day
            sample_freq = '10min'  # 10 minutes
        elif timeframe_seconds <= 604800:  # 1 week
            sample_freq = '1h'  # 1 hour
        else:
            sample_freq = '4h'  # 4 hours

        df['index'] = df['time'].copy()
        df.set_index('index', inplace=True)
        df = df.resample(sample_freq).agg({
            'user_id': 'first',
            'acceleration_x': 'mean',
            'acceleration_y': 'mean', 
            'acceleration_z': 'mean',
            'vector_magnitude': 'mean',
            'time': 'mean'  
        })
        return df.reset_index()
    
    @staticmethod
    def get_last_updated(user_id: str, from_time: int, to_time: int) -> int:
        # Query the database for the last updated timestamp of the Acceleration data for a given user and timeframe
        last_record = (
            db.session.query(db.func.max(AccelerationMetric.unix_timestamp))
            .filter(
                AccelerationMetric.user_id == user_id,
                AccelerationMetric.unix_timestamp.between(from_time, to_time)
            )
            .scalar()
        )


        if not last_record:
            return None
        return last_record
