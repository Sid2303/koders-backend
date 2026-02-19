# Koders Backend

This is the backend for my Koders project. It's a task management app.

Made with Node.js, Express and MongoDB.

Live link: https://koders-backend.onrender.com

---

## How to run it

First clone the repo and install packages:

```bash
git clone https://github.com/Sid2303/koders-backend.git
cd koders-backend
npm install
```

Then create a `.env` file and add these:

```
PORT=5000
MONGO_URI=your mongodb connection string here
JWT_SECRET=some random secret string
JWT_REFRESH_SECRET=another random secret string
```

Then run:

```bash
npm run dev
```

It will start at http://localhost:5000

---

## With Docker

```bash
docker-compose up --build
```

---

## API routes

### Auth

- `POST /api/register` - create account
- `POST /api/login` - login
- `POST /api/refresh-token` - get new token when old one expires
- `POST /api/logout` - logout

### Tasks

- `GET /api/tasks` - get all tasks (you can filter with ?status= ?priority= ?sortBy= etc)
- `POST /api/tasks` - create a task
- `PUT /api/tasks/:id` - update a task
- `DELETE /api/tasks/:id` - delete a task (only admin or manager)

### Users

- `GET /api/users` - get all users
- `GET /api/users/:id` - get one user
- `PUT /api/users/:id` - update user
- `DELETE /api/users/:id` - delete user, only admin can do this

### Profile

- `PUT /api/update-profile` - update your username or email
- `POST /api/change-password` - change password
- `GET /api/user-name/:id` - get username by id

---

## Roles

There are 3 roles: user, manager, admin

- normal users can only see their own tasks
- managers and admins can see all tasks
- only managers and admins can delete tasks
- only admins can delete users

---

## Tests

```bash
npm test
```

---

## Tech used

- Node.js + Express
- MongoDB + Mongoose
- JWT for auth
- bcryptjs for passwords
- Socket.IO for real-time updates
- Jest for testing
- Docker for deployment
