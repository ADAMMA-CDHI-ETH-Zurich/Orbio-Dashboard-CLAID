# Flask Backend App

Flask backend that exposes all the endpoints that implement the business logic
of the app.

## How to run

Inside the backend folder, install everything needed first (Linux or MacOs):

```bash
# Install
sudo apt install python3.10-venv

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt --no-cache-dir
```

Before running the app, always activate the virtual environment. Then execute:

```bash
flask run
```

IMPORTANT NOTE: if running the backend with this method, it probably won't
connect to the database as the environment variables are NOT SET. So, you can
either create a .env file defining them or run the backend with docker compose.
The environment variables needed are inside docker-compose.yml file. You may
have to change the one that contains @database to @localhost.

## Documentation

Once the backend is running, you can consult the endpoints exposed here:
http://localhost:8080/api/docs/

## Development

When you modify or create a new table or model in sqlalchemy, you will have to run:

```bash
flask db migrate -m "<description of changes done>"
```

After this, you can either apply the changes to the database manually with:

```bash
flask db upgrade
```

Or just run the application, and it apply them for you:

```bash
flask run
```

### Installing dependencies

Always activate the virtual environment before doing anything:

```bash
source venv/bin/activate
```

To install a dependency:

```bash
pip install <dependency>
```

After installing a new dependency, you have to save it to the dependencies of the\
project with:

```bash
pip freeze > requirements.txt
```
