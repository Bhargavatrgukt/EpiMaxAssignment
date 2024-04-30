# EpiMax Backend Assignment

The columns of the tables are given below,

**Users Table**

| Columns       | Type    |
| ------------- | ------- |
| id            | INTEGER |
| username      | TEXT    |
| password_hash | INTEGER |

**Tasks Table**

| Columns     | Type     |
| ----------- | -------- |
| id          | INTEGER  |
| title       | TEXT     |
| description | TEXT     |
| status      | TEXT     |
| assignee_id | INTEGER  |
| created_at  | DATETIME |
| updated_at  | DATETIME |

I used this api calls

POST http://localhost:3000/users/
Content-Type: application/json

{
"username": "Admin",
"password": "Epimax"
}

######

POST http://localhost:3000/login/
Content-Type: application/json

{
"username": "Admin",
"password": "Epimax"
}

###

GET http://localhost:3000/tasks/
Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFkbWluIiwiaWF0IjoxNzE0NDc3MzUyfQ.lGEYJlbIzmnldJv9nGXC_xe8XxCOs4msKeJcqBY9yLM

####

GET http://localhost:3000/tasks/2/
Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFkbWluIiwiaWF0IjoxNzE0NDc3MzUyfQ.lGEYJlbIzmnldJv9nGXC_xe8XxCOs4msKeJcqBY9yLM

####

POST http://localhost:3000/tasks/
Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFkbWluIiwiaWF0IjoxNzE0NDc3MzUyfQ.lGEYJlbIzmnldJv9nGXC_xe8XxCOs4msKeJcqBY9yLM
Content-Type: application/json

{
"title": "Time Managament",
"description": "Time management is the process of consciously planning and controlling time spent on specific tasks to increase how efficient you are. You may be familiar with setting deadlines, writing to-do lists, and giving yourself small rewards for accomplishing certain activities.",
"status": "pending",
"assignee_id": 3
}

####

PUT http://localhost:3000/tasks/2/
Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFkbWluIiwiaWF0IjoxNzE0NDc3MzUyfQ.lGEYJlbIzmnldJv9nGXC_xe8XxCOs4msKeJcqBY9yLM

{
"title": "Time Managament",
"description": "Time management is the process of consciously planning and controlling time spent on specific tasks to increase how efficient you are. You may be familiar with setting deadlines, writing to-do lists, and giving yourself small rewards for accomplishing certain activities.",
"status": "pending",
"assignee_id": 3,
"created_at":"2024-04-30 11:30:20"
}

#####

DELETE http://localhost:3000/tasks/2/
Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFkbWluIiwiaWF0IjoxNzE0NDc3MzUyfQ.lGEYJlbIzmnldJv9nGXC_xe8XxCOs4msKeJcqBY9yLM
