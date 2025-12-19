🧩 Trello Clone – Backend

A Node.js + Express + MongoDB backend for a Trello-like task management application.
This API supports user authentication, teams, projects, tasks, tags, and reports with JWT-based authorization.

```
🚀 Features
🔐 Authentication

User Signup & Login

Password hashing using bcrypt

JWT-based authentication

Protected routes using middleware
```
```
👤 Users

Fetch all users

Get logged-in user details (/auth/me)

📋 Tasks

Create, read, update, delete tasks

Search tasks by name

Filter tasks by:

Project

Team

Owner

Status

Tags

Populate related data (project, team, owners, tags)

👥 Teams

Create teams

Fetch all teams

Fetch unique owners working in a team

📁 Projects

Create projects

Fetch all projects

🏷️ Tags

Create tags

Fetch all tags

📊 Reports

Tasks completed in the last week

Total pending work (in days)

Closed tasks grouped by:

Team

Owner

Project
```
```
🛠️ Tech Stack

Node.js

Express.js

MongoDB

Mongoose

JWT (jsonwebtoken)

bcrypt

dotenv

CORS

```
```
📂 Project Structure

Trello_Clone_Backend/
│
├── db/
│   └── db.connect.js
│
├── models/
│   ├── User.model.js
│   ├── Task.model.js
│   ├── Team.model.js
│   ├── Project.model.js
│   └── Tag.model.js
│
├── .env
├── index.js
├── package.json
└── README.md

```

```
⚙️ Environment Variables

Create a .env file in the root directory:

JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string


```

```
▶️ Getting Started

1️⃣ Clone the repository

git clone https://github.com/Srushtik942/Trello_Clone_Backend.git
cd Trello_Clone_Backend

```

```
2️⃣ Install dependencies

npm install

```

```
3️⃣ Start the server

npm start

```

```

📋 Task APIs
Method	Endpoint	Description
POST	/tasks	Create a new task
GET	/tasks	Fetch all tasks (with filters)
PUT	/tasks/:id	Update a task
DELETE	/tasks/:id	Delete a task
GET	/tasks/search?name=	Search tasks
GET	/tasks/search/:id	Get task details

```

```

👥 Team APIs
Method	Endpoint	Description
POST	/team	Create team
GET	/team	Fetch all teams
GET	/teams/:teamId/owners	Get owners by team

```

```

📊 Report APIs
Endpoint	Description
/report/last-week	Tasks completed in last 7 days
/report/pending	Total pending work
/report/closed-tasks?groupBy=team	Closed tasks grouped

```