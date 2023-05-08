
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
| `file` | `file/csv` | **Requested**. CSV file to analyze. | Object

#### Response Body From 
```javascript
{
  "owner" : "string",
  "path" : "string",
  "nodes" Array<Object>,
  "directions" : Array<Object>
}
```

---
---
---

#### Get Attachment Meta
  ```http
  GET /attachment/read
```
This endpoint gets attachment's information.

| Body Parameter | Type     | Description                | Returns
| :-------- | :------- | :------------------------- | :-------------------------
| `name` | `string` | **Requested**. Name of the attachment . | Object

#### Response Body From 
```javascript
{
  "owner" : "string",
  "path" : "string",
  "nodes" Array<Object>,
  "directions" : Array<Object>
}
```

---
---
---

#### Generate CSV
  ```http
  GET /attachment/generate-csv
```
This endpoint generates CSV file for Machine Learning Model

| Body Parameter | Type     | Description                | Returns
| :-------- | :------- | :------------------------- | :-------------------------
| `name` | `string` | **Requested**. Name of the attachment . | CSV File

#### Response Body From 
```javascript
Headers in CSV file

destination_id,
edge_id,
messageRealm,
serviceAction,
messageParams.subscriber,
messageParams.calledMessageQueue,
messageParams.type,
messageParams.messageID,
messageParams.correlationID,
messageParams.transactionID,
messageParams.originatingMS,
messageParams.terminatingMS,
serviceData.httpParams.statusCode,
message_id_length,
correlation_id_length,
transaction_id_length
```

---
---
---

## Authors


  
![Logo](https://docs.kariyer.net/job/jobtemplate/000/000/241/avatar/24111520220128041051054.jpeg)
> Orion Innovation - 2021