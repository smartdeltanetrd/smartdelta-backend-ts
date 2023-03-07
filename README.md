
# SmartDelta Backend API

This repository contains backend API for SmartDelta Application
#### Version: 0.0.1

#### Main technologies used:

`NodeJS` `ExpressJS` `MongoDB` `Grafana`

Prerequisites
-------------
- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)
- [Grafana](https://grafana.com/)
- **Optional** : [Postman](https://www.postman.com/)


#### Getting Started.
Create an .env file by reference .env.example:
```
1.) Run Mongo DB Service and create a new Database. If you want to use default setting, create a database named "SmartDeltaApi" and skip step 2

2.) Edit Database credentials on .env file if you want to use other than default settings,(MONGO_DB_CONNECTION_STRING)

3.) Edit PORT in .env file if you want to use other than PORT 3001. We strongly recommended to NOT USE PORT 3000 (Usually Grafana Uses PORT 3000)

4.) Start Grafana Service

3.) Run that following commands:
    $ npm install                  - Installs all node modules

4.) Run that command to start API server
    $ npm run dev                  - Uses Nodemon on Development Mode

```

## API Usage

This Section will be updated as new endpoints are added.

#### Upload new Attachment

```http
  POST /attachment/upload
```
This endpoint uploads a new CSV file.

| Body Parameter | Type     | Description                | Returns |
| :-------- | :------- | :------------------------- | :------- |
| `file` | `file/csv` | **Requested**. CSV file to analyze. | Attachment meta


  ```http
  POST /attachment/analyze
```
This endpoint uploads a new CSV file.

| Body Parameter | Type     | Description                | Returns
| :-------- | :------- | :------------------------- | :-------------------------
| `file` | `file/csv` | **Requested**. CSV file to analyze. | Array of JSONs


## Authors


  
![Logo](https://docs.kariyer.net/job/jobtemplate/000/000/241/avatar/24111520220128041051054.jpeg)
> Orion Innovation - 2021