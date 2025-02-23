from flask import send_file
import os
import json


def generate_config(battery: bool, acceleration: bool, heartrate: bool, oxygen: bool):
    config = {
        "hosts": [
            {
                "hostname": "Server",
                "server_config": {
                    "host_server_address": "claid-dashboard.ethz.ch:1337", # Server Address: change this to your CLAIDs server address
                },
                "modules": [
                    {
                        "type": "DataReceiverModule",
                        "id": "DataReceiver",
                        "input_channels": {
                            "FromDataSyncModuleChannel": "DataSyncToDataReceiver"
                        },
                        "output_channels": {
                            "ToDataSyncModuleChannel": "DataReceiverToDataSync"
                        },
                        "properties": {"storagePath": "SyncedData/DDB"},
                    }
                ],
            },
            {
                "hostname": "Smartwatch",
                "connect_to": {"host": "Server"},
                "modules": [  # Every User has a DataSyncModule to sync data to the server
                    {
                        "type": "DataSyncModule",
                        "id": "DataSyncer",
                        "input_channels": {
                            "FromDataReceiverModuleChannel": "DataReceiverToDataSync"
                        },
                        "output_channels": {
                            "ToDataReceiverModuleChannel": "DataSyncToDataReceiver"
                        },
                        "properties": {
                            "filePath": "%media_dir/files",
                            "syncingSchedule": {"periodic": [{"period_minutes": 10}]}, # By default, the data is synced every 10 minutes
                            "deleteFileAfterSync": "true", # To ensure that the application can run without running out of space, the data is deleted after it is synced
                            "requiresConnectionToRemoteServer": "true",
                        },
                    }
                ],
            },
        ]
    }
    # Add Collector Modules depending on the query parameters
    if battery:
        config["hosts"][1]["modules"].append(
            {
                "type": "BatteryCollector",
                "id": "BatteryCollector",
                "properties": {
                    "samplingSchedule": {"periodic": [{"period_minutes": 10}]} # By default, the battery is sampled every 10 minutes
                },
                "output_channels": {"BatteryData": "BatteryChannel"},
            }
        )
    if oxygen:
        config["hosts"][1]["modules"].append(
            {
                "type": "GalaxyWatchCollector",
                "id": "GalaxyWatchCollector",
                "output_channels": {
                    "AccelerationData": "AccelerationChannel",
                    "HeartRateData": "HeartrateChannel",
                    "OxygenSaturationData": "OxygenChannel",
                },
                "properties": {
                    "enableAccelerometer": acceleration,
                    "enableHeartRate": heartrate,
                    "oxygenSaturationMeasurementSchedule": {
                        "periodic": [{"period_minutes": 60}] # By default, the oxygen saturation is sampled every 60 minutes
                    },
                },
            }
        )

    if (acceleration or heartrate) and not oxygen: # Seperation because Oxygen is measured on a schedule, while Acceleration and Heartrate are sampled continuously (with true/false)
        config["hosts"][1]["modules"].append(
            {
                "type": "GalaxyWatchCollector",
                "id": "GalaxyWatchCollector",
                "output_channels": {
                    "AccelerationData": "AccelerationChannel",
                    "HeartRateData": "HeartrateChannel",
                },
                "properties": {
                    "enableAccelerometer": acceleration,
                    "enableHeartRate": heartrate,
                },
            }
        )

    # Add DataSaver Modules

    if battery:
        config["hosts"][1]["modules"].append(
            {
                "type": "DataSaverModule",
                "id": "Battery_DataSaver",
                "properties": {
                    "storagePath": "%media_dir/files",
                    "fileNameFormat": "%d.%m.%y/battery_data_%H-%M.json",
                    "fileType": "json",
                    "overrideExistingFiles": False,
                },
                "input_channels": {"DataChannel": "BatteryChannel"},
            }
        )

    if acceleration:
        config["hosts"][1]["modules"].append(
            {
                "type": "DataSaverModule",
                "id": "Acceleration_DataSaver",
                "properties": {
                    "storagePath": "%media_dir/files",
                    "fileNameFormat": "%d.%m.%y/acceleration_data_%d.%m.%y_%H-%10M.binary",
                    "fileType": "batch_binary",
                    "overrideExistingFiles": False,
                },
                "input_channels": {"DataChannel": "AccelerationChannel"},
            }
        )

    if heartrate:
        config["hosts"][1]["modules"].append(
            {
                "type": "DataSaverModule",
                "id": "Hearthrate_DataSaver",
                "properties": {
                    "storagePath": "%media_dir/files",
                    "fileNameFormat": "%d.%m.%y/heart_rate_data_%d.%m.%y_%H-%10M.binary",
                    "fileType": "batch_binary",
                    "overrideExistingFiles": False,
                },
                "input_channels": {"DataChannel": "HeartrateChannel"},
            }
        )

    if oxygen:
        config["hosts"][1]["modules"].append(
            {
                "type": "DataSaverModule",
                "id": "Oxygen_DataSaver",
                "properties": {
                    "storagePath": "%media_dir/files",
                    "fileNameFormat": "%d.%m.%y/oxygen_data_%d.%m.%y_%H.binary",
                    "fileType": "batch_binary",
                    "overrideExistingFiles": False,
                },
                "input_channels": {"DataChannel": "OxygenChannel"},
            }
        )

    # Save the config to a temporary file and send it as a response
    tmp_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "temp")
    os.makedirs(tmp_dir, exist_ok=True)
    file_path = os.path.join(tmp_dir, "config.json")

    with open(file_path, "w") as file:
        json.dump(config, file)
    return send_file(
        file_path,
        as_attachment=True,
        download_name="config.json",
        mimetype="application/json",
    )


def generate_MyApplication(user_id): # Generate MyApplication.java file to send to the user
    myApplication = f"""
    package adamma.c4dhi.galaxy_watch_claid;

    import android.app.Application;
    import adamma.c4dhi.claid_android.Configuration.CLAIDPersistanceConfig;
    import adamma.c4dhi.claid_android.Configuration.CLAIDSpecialPermissionsConfig;
    import adamma.c4dhi.claid_platform_impl.CLAID;
    import adamma.c4dhi.claid_platform_impl.PersistentModuleFactory;
    import adamma.c4dhi.claid_android.collectors.battery.BatteryCollector;

    public class MyApplication extends Application {{
        @Override
        public void onCreate() {{
            super.onCreate();
            CLAID.startInBackground(
                getApplicationContext(),
                "assets://claid_config.json",
                "Smartwatch",
                "{user_id}",
                "user",
                CLAIDSpecialPermissionsConfig.regularConfig(),
                CLAIDPersistanceConfig.maximumPersistance()
            );
        }}
    }}
    """
    # Save the config to a temporary file and send it as a response
    tmp_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "temp")
    os.makedirs(tmp_dir, exist_ok=True)
    file_path = os.path.join(tmp_dir, "MyApplication.java")
    with open(file_path, "w") as file:
        file.write(myApplication)

    return send_file(
        file_path,
        as_attachment=True,
        download_name="MyApplication.java",
        mimetype="application/java",
    )

def get_project(): # Return the CLAIDWearOSApp.zip file to the user to import into Android Studio and setup the data collection
    dir = os.path.join(os.path.dirname(os.path.dirname(__file__)),"CLAIDWearOSApp", "CLAIDWearOSApp.zip")
    return send_file(
        dir,
        as_attachment=True,
        download_name="CLAIDWearOSApp.zip",
        mimetype="application/zip"
    )
