const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const databasePath = path.join(__dirname, "Epimax.db");

const app = express();

app.use(express.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0", // OpenAPI version
    info: {
      title: "Epimax Node JS Assignment",
      version: "1.0.0",
      description: "API documentation for Epimax Node JS Assignment",
    },
    servers: [
      {
        url: "http://localhost:3000/", // Base URL for the server
      },
    ],
  },
  apis: ["./app.js"], // Paths to the API files
};

const swaggerSpecific = swaggerJsDoc(swaggerOptions);

// Mount Swagger UI middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecific));

let database = null;

//intializemyserver for the assignment

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//middleware function for authentication

function authenticateToken(request, response, next) {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
}

// Define a route handler for the root URL ("/")
app.get("/", (request, response) => {
  response.send("Welcome to Epimax Node JS Assignment");
});


//Creating a User if he/she doesn't exists

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: This endpoint is used to create a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User created successfully
 *       '400':
 *         description: User already exists or invalid request body
 *       '500':
 *         description: Internal server error
 */

app.post("/users/", async (request, response) => {
  try {
    const { username, password } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const selectUserQuery = `SELECT * FROM Users WHERE username ="${username}";`;
    const dbUser = await database.get(selectUserQuery);
    if (dbUser === undefined) {
      const createUserQuery = `
          INSERT INTO
              Users (username, password_hash)
          VALUES
              (
                  '${username}',
                  '${hashedPassword}'
              );`;
      const dbResponse = await database.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      response.send(`Created new user with ${newUserId}`);
    } else {
      response.status(400).send("User already exists");
    }
  } catch (error) {
    console.error("Error creating user:", error.message);
    response.status(500).send("Internal Server Error"); // Informative error message
  }
});

//If user exits then logIn credentials

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in with username and password
 *     description: This endpoint is used to log in a user with their username and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jwtToken:
 *                   type: string
 *       '400':
 *         description: Invalid username or password
 *       '500':
 *         description: Internal server error
 */

app.post("/login/", async (request, response) => {
  try {
    const { username, password } = request.body;
    const userQuery = `select * from Users where username="${username}";`;
    const userDb = await database.get(userQuery);
    console.log(userDb);
    if (userDb === undefined) {
      response.status(400).send("Invalid user");
    } else {
      const isPasswordValid = await bcrypt.compare(
        password,
        userDb.password_hash
      );
      if (isPasswordValid) {
        const payload = {
          username: username,
        };
        const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
        response.send({ jwtToken });
        console.log(jwtToken);
      } else {
        response.status(400).send("Invalid password");
      }
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    response.status(500).send("Internal Server Error"); // Informative error message
  }
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     description: This endpoint is used to create a new task.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               assignee_id:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Task created successfully
 *       '500':
 *         description: Internal server error
 */
//posting a task
app.post("/tasks/", authenticateToken, async (request, response) => {
  try {
    const { title, description, status, assignee_id } = request.body;

    const taskQuery = `
      INSERT INTO Tasks(title, description, status, assignee_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `;

    await database.run(taskQuery, [title, description, status, assignee_id]);
    response.send("Task Added Successfully");
  } catch (error) {
    console.error("Error adding task:", error.message);
    response.status(500).send("Internal Server Error");
  }
});

//getting all the tasks

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Retrieve all tasks
 *     description: This endpoint is used to retrieve all tasks.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of tasks retrieved successfully
 *       '500':
 *         description: Internal server error
 */

app.get("/tasks/", authenticateToken, async (request, response) => {
  const allTasksQuery = `select * from Tasks;`;
  const allTasksQueryResponse = await database.all(allTasksQuery);
  response.send(allTasksQueryResponse);
});

//getting a particular task

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Retrieve a specific task by ID
 *     description: This endpoint is used to retrieve a specific task by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Task retrieved successfully
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Internal server error
 */

app.get("/tasks/:taskId", authenticateToken, async (request, response) => {
  const { taskId } = request.params;
  const taskQuery = `select * from Tasks where id=${taskId};`;
  const taskQueryResponse = await database.get(taskQuery);
  response.send(taskQueryResponse);
});

//update a particular task

/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Update a specific task by ID
 *     description: This endpoint is used to update a specific task by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               assignee_id:
 *                 type: integer
 *               created_at:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Task updated successfully
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Internal server error
 */

app.put("/tasks/:taskId", authenticateToken, async (request, response) => {
  const { taskId } = request.params;
  try {
    const {
      title,
      description,
      status,
      assignee_id,
      created_at,
    } = request.body;

    const taskQuery = `
      UPDATE Tasks
      SET
      title = ?,
      description = ?,
      status = ?,
      assignee_id = ?,
      created_at = ?,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;

    await database.run(taskQuery, [
      title,
      description,
      status,
      assignee_id,
      created_at,
      taskId,
    ]);
    response.send("Task Updated Successfully");
  } catch (error) {
    console.error("Error updating task:", error.message);
    response.status(500).send("Internal Server Error");
  }
});

//delete the task

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete a specific task by ID
 *     description: This endpoint is used to delete a specific task by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task to delete
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Task deleted successfully
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Internal server error
 */

app.delete("/tasks/:taskId", authenticateToken, async (request, response) => {
  const { taskId } = request.params;
  const taskQuery = `delete  from Tasks where id=${taskId};`;
  const taskQueryResponse = await database.run(taskQuery);
  response.send("Deleted Successfully");
});

module.exports = app;
