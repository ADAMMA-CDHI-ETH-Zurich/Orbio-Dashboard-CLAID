# Scheduler

This flask app acts like a daemon executing jobs every X minutes. Its main purpose\\
is to update our SQL database with the latest information from the user's biometrics\\
data fetched from their smart watches. The reason for this is that the fetching metrics\\
of the data using the SQL database is much faster, with improvements from 15s to 1s.

## How to run

Inside the scheduler folder, install everything needed first:

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt --no-cache-dir
```

Before running the app, always activate the virtual environment before running:

```bash
flask run
```
