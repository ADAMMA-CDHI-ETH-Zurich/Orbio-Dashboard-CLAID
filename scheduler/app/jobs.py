import os
import pandas as pd
import numpy as np
from claid.data_collection.load.load_sensor_data import (
    load_acceleration_data,
    load_heartrate_data,
)
from sqlalchemy import create_engine
import logging
from typing import Set, List

# Define constants
pathToData = os.path.join("app", "data", "DDB")
ACCELERATION_METRICS_TABLE = "acceleration_metrics"
HEARTRATE_METRICS_TABLE = "heartrate_metrics"
processed_files_log = "logs/processed_files.log"

# Mock our test user_id mapping
user_name_to_user_id = {
    "Benjamin": "36840eee-1bd4-400b-9dee-17c6e7decd6e",
    "Jianing": "8c950773-fda2-4cea-825a-732d40d2f818",
    "Nikita": "e3e43b87-175b-43a3-a0bc-2c3d0e15a350",
    "Helena": "ee392c77-74a3-4521-9abc-0355548e62f3",
}

logging.basicConfig(level=logging.INFO)


# Helper Functions
def get_processed_files() -> Set[str]:
    """Load the set of already processed files."""
    try:
        if os.path.exists(processed_files_log):
            with open(processed_files_log, "r") as file:
                return set(line.strip() for line in file)
    except Exception as e:
        logging.error(f"Error reading processed files log: {e}")
    return set()


def mark_files_as_processed(files: List[str]):
    """Mark files as processed."""
    try:
        with open(processed_files_log, "a") as file:
            for file_path in files:
                file.write(f"{file_path}\n")
    except Exception as e:
        logging.error(f"Error marking files as processed: {e}")

def mark_file_as_processed(file_path: str):
    """Mark file as processed."""
    try:
        with open(processed_files_log, "a") as file:
            file.write(f"{file_path}\n")
    except Exception as e:
        logging.error(f"Error marking file as processed: {e}")

def append_dataframe_to_table(
    df: pd.DataFrame, table_name: str, connection, chunksize: int = 2100
):
    """Append a DataFrame to the given SQL table"""
    try:
        df.to_sql(
            table_name,
            con=connection,
            if_exists="append",
            index=False,
            chunksize=chunksize,
        )
    except Exception as e:
        logging.error(f"An error occurred while appending data: {e}")


def process_folder_sequential(
    folder_name: str,
    file_prefix: str,
    load_function,
    bin_function,
    table_name: str,
    processed_files: Set[str],
    connection
):
    """Process files in a folder sequentially and append to the database."""
    folder_path = os.path.join(pathToData, folder_name)
    if not os.path.isdir(folder_path):
        return

    logging.info(f"Processing {file_prefix} data for User: {folder_name}")
    # If the user id is one of our dev test users mock the user_id accordingly
    user_id = user_name_to_user_id.get(folder_name, folder_name)

    # Collect the relevant files that haven't been processed yet into a list
    files_to_process = [
        os.path.join(root, file)
        for root, _, files in os.walk(folder_path)
        for file in files
        if file.startswith(file_prefix)
        and file.endswith(".binary")
        and file not in processed_files
    ]

    # Check if there are files to process
    if not files_to_process:
        logging.info(f"No {file_prefix} files to process for User: {folder_name}")
        return

    has_processed_files = False
    for file_path in files_to_process:
        if file_path in processed_files:
            continue
        # Process each file
        has_processed_files = True
        data = load_function(file_path)
        df = bin_function(data)


        # For efficiency reasons reduce the 25hz data to 1hz
        # Step 1: Convert the timestamp from milliseconds to seconds
        df['unix_timestamp'] = df['unix_timestamp_in_ms'] // 1000

        # Step 2: Drop the milliseconds column
        df.drop(columns=['unix_timestamp_in_ms'], inplace=True)

        # Step 3: Group by the second-level timestamp
        reduced_df = df.groupby('unix_timestamp').mean(numeric_only=True).reset_index()

        # Calculate vector magnitude for acceleration data
        if file_prefix == "acceleration_data":
            reduced_df["vector_magnitude"] = np.sqrt(
                reduced_df["acceleration_x"] ** 2
                + reduced_df["acceleration_y"] ** 2
                + reduced_df["acceleration_z"] ** 2
            )
        # Add user_id column
        reduced_df["user_id"] = user_id

        try:
            append_dataframe_to_table(reduced_df, table_name, connection)
            mark_file_as_processed(file_path)
        except Exception as e:
            logging.error(f"Error processing files for {folder_name}: {e}")

    if not has_processed_files:
        logging.info(f"No new {file_prefix} files to process for User: {folder_name}")
        return

    logging.info(f"Completed processing {file_prefix} files for User: {folder_name}")


# Update Functions
def update_acceleration_data(processed_files: Set[str], connection):
    """Update acceleration data."""
    try:
        logging.info("Updating acceleration data")
        for folder_name in os.listdir(pathToData):
            try:
                process_folder_sequential(
                    folder_name,
                    file_prefix="acceleration_data",
                    load_function=load_acceleration_data,
                    bin_function=bin_acceleration_data_to_df,
                    table_name=ACCELERATION_METRICS_TABLE,
                    processed_files=processed_files,
                    connection=connection,
                )
            except Exception as e:
                logging.error(f"Error processing acceleration data for folder {folder_name}: {e}")
        logging.info("Acceleration data update complete.")
    except Exception as e:
        logging.error(f"Error in update_acceleration_data: {e}")


def update_heartrate_data(processed_files: Set[str], connection):
    """Update heartrate data."""
    try:
        logging.info("Updating heartrate data")
        for folder_name in os.listdir(pathToData):
            try:
                process_folder_sequential(
                    folder_name,
                    file_prefix="heart_rate_data",
                    load_function=load_heartrate_data,
                    bin_function=bin_heartrate_data_to_df,
                    table_name=HEARTRATE_METRICS_TABLE,
                    processed_files=processed_files,
                    connection=connection,
                )
            except Exception as e:
                logging.error(f"Error processing heartrate data for folder {folder_name}: {e}")
        logging.info("Heartrate data update complete.")
    except Exception as e:
        logging.error(f"Error in update_heartrate_data: {e}")


def update_DB():
    """Main entry point to update the database."""
    try:
        logging.info("Starting database update")
        processed_files = get_processed_files()

        # Initialize SQL engine and connection
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            logging.error("DATABASE_URL environment variable is not set.")
            return

        logging.info("Connecting to SQL DB")
        try:
            engine = create_engine(db_url)
            connection = engine.connect()
        except Exception as e:
            logging.error(f"Error connecting to database: {e}")
            return

        try:
            update_acceleration_data(processed_files, connection)
            update_heartrate_data(processed_files, connection)
        finally:
            connection.close()
            logging.info("SQL connection closed.")

        logging.info("Database update complete.")
    except Exception as e:
        logging.error(f"Error in update_DB: {e}")


# Data Binning Functions
def bin_acceleration_data_to_df(data) -> pd.DataFrame:
    """Convert binary acceleration data to a DataFrame."""
    try:
        return pd.DataFrame(
            [
                {
                    "acceleration_x": sample.acceleration_x,
                    "acceleration_y": sample.acceleration_y,
                    "acceleration_z": sample.acceleration_z,
                    "unix_timestamp_in_ms": sample.unix_timestamp_in_ms,
                }
                for sample in data.samples
            ]
        )
    except Exception as e:
        logging.error(f"Error binning acceleration data: {e}")
        return pd.DataFrame()


def bin_heartrate_data_to_df(data) -> pd.DataFrame:
    """Convert binary heartrate data to a DataFrame."""
    try:
        return pd.DataFrame(
            [
                {
                    "unix_timestamp_in_ms": int(sample.unix_timestamp_in_ms),
                    "heartrate": int(sample.hr),
                    "status": sample.status,
                }
                for sample in data.samples
            ]
        )
    except Exception as e:
        logging.error(f"Error binning heartrate data: {e}")
        return pd.DataFrame()
