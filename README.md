# Orbio - A Digital Biomarker Website

[[_TOC_]]

## Team Members
1. Nikita Zubairov
2. Helena Kaikkonen
3. Benjamin Biberstein
4. Jianing Xu

## Project Description 
Our project, titled Orbio, is a web interface that uses the CLAID Middleware to display sensor data from smartwatches, such as heart rate or acceleration. We worked with points of contact from [ADAMMA Lab](https://adamma.ethz.ch/), a research group at ETH Zurich focused on biomarker research. Our project currently implements a "Principle Investigator (PI) View" where PIs can create research studies and view participant data and a "User View" where users can view their own data and join studies.

The application is deployed on the ADAMMA servers, here http://claid-dashboard.ethz.ch.

To check it out, you can use our demo users:
Participant: "Benjamin@orbio.com" with password "test" 
PI: "Nikita@orbio.com" with password "test"

### Users
- Principal Investigators (PIs) who want to conduct a research study involving biometrics data from smartwatches.
- Users that have a smartwatch and want to visualize their watch's data and/or participate in a research study.
Note that one email can make a separate PI and User account.

### Tasks
The dashboard has two tasks:
- The first task is to visualize the data from the smartwatch.
- The second task is to participate in a research study.

- - -
## Folder Structure

``` bash
├── README.md
├── docker-compose.yml
├── backend
│   ├── app
│   │   ├── __init__.py  # Main application
│   │   ├── ...
│   │   ├── models  # Models for the SQL database
│   │   │   └── ...
│   │   ├── routes  # Routes for the API
│   │   │   └── ...
│   │   ├── schemas  # Pydantic schemas for input/output validation of the API
│   │   │   └── ...
│   │   ├── services  # Services for the API
│   │   │   └── ...
│   │   └── utils  # Utility functions
│   │       └── ...
│   ├── migrations
│   │   ├── ...
│   │   └── versions  # SQL database migration scripts
│   │       └── ...
│   ├── run.py  # Entry point for the backend
│   └── ...
├── frontend
│   ├── public
│   │   ├── Orbio_Pairing_Galaxy_Watch_Android_Studio.pdf  # instructional pdf for new users
│   │   └── ...
│   ├── src
│   │   ├── Pages  # contains main page layouts that utilize further components from the src/components folder
│   │   │   ├── pi
│   │   │   │   ├── PI.tsx  # main routing page for all PI subpages
│   │   │   │   └── ...
│   │   │   ├── user
│   │   │   │   ├── User.tsx  # main routing page for all User subpages
│   │   │   │   ├── UserDoctors.tsx  # not in use
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── components
│   │   │   ├── ...
│   │   │   └── ui  # Components from Chakra UI
│   │   │       └── ...
│   │   ├── provider
│   │   │   └── authProvider.tsx  # tracks token, user id (e.g., pi or user), and name in local storage
│   │   ├── router
│   │   │   └── ...
│   │   ├── routes
│   │   │   └── ...
│   │   ├── types
│   │   │   └── ...
│   │   ├── utils
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── nginx # Handles SSL encryption to enable HTTPS while connecting to the front- and backend internally via the Docker Network on HTTP
│   └── ...
└── scheduler  # Scheduler that fetches watch data files from the database and inserts it into the database
    ├── app
    │   ├── __init__.py  # Main application
    │   └── jobs.py  # Jobs for the scheduler
    ├── run.py  # Entry point for the scheduler
    └── ...
```

Furthermore, there are environment variables that can be personalized. For now,
they have a default value. The files to change are the `docker-compose.yml` in the environment section of each service, and the `.env` files in the backend folder. Also, the backend flask app can be configured in the `.flaskenv` file.

## Requirements

To run this project, you need to have the following installed on your machine:
- Docker
- Docker Compose
- Python 3.9+ (includes pip, Python Package Manager)
- Node.js 18+ (includes npm, Node Package Manager)

## How to Run locally

### With Docker Compose (recommended)
To run the project with docker compose, you have to first:
- clone the repository;
- open a terminal instance and, using the command ```cd``` move to the folder where the project has been downloaded;
- If you want to see data in the web dashboard, ensure that you provide mock data under "scheduler/app/data/DDB". The data there should be in the same format as CLAID transmitted data from the sensors (each user should have an own folder titled with their user_id, which store seperate folders for each day containing the data in the CLAID transmitted binary format).

Then, you can run the project with docker compose, using the following command:
```bash
docker compose up -d
```

When it is done, you can access the frontend at http://localhost:3000 and the backend at http://localhost:8080.

NOTE: prefer the docker compose method as it is easier to run and already runs the frontend, the backend, the database the scheduler and the ngnix engine, and contains all the necessary environment variables.

### Without Docker Compose (not recommended)
To run the project without docker compose, you have to:
- clone the repository;
- open a terminal instance and using the command ```cd``` move to the folder where the project has been downloaded;


To run the frontend
- Enter the frontend folder called "frontend"
- Execute the following commands to start the front end ```npm install``` and ```npm start```
If all the steps have been successfully executed a new browser window with the project loaded will open automatically.

To run the database (using docker compose)
- Execute the command ```docker compose up -d database```

To run the backend
- Open the backend folder called "backend"
- To start the backend first you need to create a virtual environment using venv
    ```python3 -m venv venv```
  - to activate the virtual environment run the command ```source venv/bin/activate```
  - install the requirements using the command ```pip install -r requirements.txt```
  - to start the backend use the command ```flask run``` command directly on your terminal

To run the scheduler
- Open the scheduler folder called "scheduler"
- If you want to see data in the web dashboard, ensure that you provide mock data under "scheduler/app/data/DDB". The data there should be in the same format as CLAID transmitted data from the sensors (each user should have an own folder titled with their user_id, which store seperate folders for each day containing the data in the CLAID transmitted binary format).
- To start the scheduler first you need to create a virtual environment using venv
    ```python3 -m venv venv```
  - to activate the virtual environment run the command ```source venv/bin/activate```
  - install the requirements using the command ```pip install -r requirements.txt```
  - to start the scheduler use the command ```flask run``` command directly on your terminal

You can access the frontend at http://localhost:3000 and the backend at http://localhost:8080.

NOTE: It is important to run the database first, as the backend will not connect to the database if it is not running. Use cases related to biometrics data will not work in local without mock data because the project with production-ready metrics recollection will be deployed on a cloud server. User, principal investigator and study management features will work.

## How to Run on a server

### With Docker Compose
To run the project with docker compose, you have to first:
- clone the repository on the server;
- open a terminal instance and using the command ```cd``` move to the folder where the project has been downloaded;
- remove the current "docker-compose.yml"
- rename the "server docker-compose.yml" to "docker-compose.yml"
- make sure to change the path to the SSL certificates in the docker-compose file from "/etc/ssl/letsencrypt/ecc" to the path on your machine. The Folder should contain a valid pair of "claid-dashboard.ethz.ch.crt" and "claid-dashboard.ethz.ch.key".
- make sure to change the path to the Biomarker data in the docker-compose file from "../SyncedData" to the path on your machine. The path should lead to a Folder containing another Folder called "DDB", where the CLAID transmitted data from the sensors should arrive (handled by the CLAID Application - each user should have an own folder titled with their user_id, which store seperate folders for each day containing the data in the CLAID transmitted binary format).

Then, you can run the project with docker compose, using the following command:
```bash
docker compose up -d
```

When it is done, you can access the frontend at http://localhost:443 under HTTPS.

NOTE: Ensure that you have permissions to access and expose the 80 and 443 ports before running the application. The general architecture then is that the ngnix server accepts the requests to 443 (80 is re-routed to 443) and distributes them to the front- and backend. The backend recieves all requests with a path starting with /api and the frontend recieves the others via the internal docker network.

## Contribution
Special Thanks to Patrick Langer and Dr. Filipe Da Conceição Barata from the [ADAMMA Lab](https://adamma.ethz.ch/) for their continuous support in developing this web dashboard. The web dashboard originated from a project for the "Fundamentals of Web Engineering" course from the [IVIA lab](https://ivia.ch/).
