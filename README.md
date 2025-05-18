
# To Do List Application

A modern real-time task management system built using Angular 18, Node.js + express, microservices, gRPC, MongoDB, and NgRx. Designed with clean architecture, scalable backend and real-time syncing.

---

##  Tech Stack

| Layer                   | Stack                                  |
|-------------------------|----------------------------------------|
| Frontend                | Angular 18, RxJS, NgRx                 |
| Backend API             | Node.js + Express (REST)               |
| Inter-Service           | gRPC                                   |
| Auth & Users            | MongoDB via `auth-service` , JWT       |
| Tasks Storage           | MongoDB via `db-service`               |
| services communication  | gRPC,                                  |
| DevOps Ready            | Docker,                                |
---

##  Features

-  User authentication (login/register)
-  JWT-based session with role support
-  Only one user can lock/edit a task at a time
-  gRPC inter-service communication
-  "Locked by: First Last names" shown in UI
-  Load tasks with paginated mode (Implemented on the server sid or all at once
-  Dynamically fetch users who locked tasks
-  Syncronized data with web socket to server.

---

Local Setup Instructions

### 1. Prerequisites

Make sure you have:
- clone this repository to your own computer
- [Node.js] (v22.15)
- [Docker & Docker Compose] (optional to run the server with docker)
- [MongoDB] local one or run an image in docker desktop, Mongo should work with replica

---

### 2. Start MongoDB (Replica Set for local)


A. create data folder where ever you want
B. run from cmd: mongod --dbpath "<path_to_folder_you_have_created>" --replSet rs0        ---> please see that mongod should be defined in path property of system environment varibales 
C. run from another cmd: & "<path to mongosh.exe>" -> this should open mongo shell
D. run inside this shell:  rs.initiate(), now you can run rs.status() to check it. "show dbs" will show all the connected dbs to this mongo conection 

### 3 start services in the backend
Installed dependencies (npm install) in each backend service folder:

* logger service
* auth-service
* db-service
* sync-service
* task-service

### 4 start client
npm install to install dependencies 
npm start to run the application









