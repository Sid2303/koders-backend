import request from "supertest";
import app from "../app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

let token;
let adminToken;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test_secret";
  process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
  token = null;
  adminToken = null;
});

const registerAndLogin = async (username, email, role = "user") => {
  await request(app).post("/api/register").send({
    username,
    email,
    password: "password123",
    role,
  });
  const res = await request(app).post("/api/login").send({
    email,
    password: "password123",
  });
  return res.body.token;
};

describe("POST /api/tasks", () => {
  it("should create a task when authenticated", async () => {
    token = await registerAndLogin("user1", "user1@example.com");

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Task", priority: "high" });

    expect(res.statusCode).toBe(201);
    expect(res.body.task.title).toBe("Test Task");
  });

  it("should not create a task without a title", async () => {
    token = await registerAndLogin("user1", "user1@example.com");

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ priority: "low" });

    expect(res.statusCode).toBe(400);
  });

  it("should not create a task without auth", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Unauthorized Task" });

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/tasks", () => {
  it("should return tasks for authenticated user", async () => {
    token = await registerAndLogin("user1", "user1@example.com");

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Task" });

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });

  it("should not return tasks without auth", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.statusCode).toBe(401);
  });
});

describe("PUT /api/tasks/:id", () => {
  it("should update a task", async () => {
    token = await registerAndLogin("user1", "user1@example.com");

    const create = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Old Title" });

    const taskId = create.body.task._id;

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New Title", status: "in-progress" });

    expect(res.statusCode).toBe(200);
    expect(res.body.task.title).toBe("New Title");
    expect(res.body.task.status).toBe("in-progress");
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("should soft delete a task when admin or manager", async () => {
    adminToken = await registerAndLogin("admin1", "admin@example.com", "admin");

    const create = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Task to delete" });

    const taskId = create.body.task._id;

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.task.deleted).toBe(true);
  });

  it("should not allow a regular user to delete a task", async () => {
    token = await registerAndLogin("user1", "user1@example.com");

    const create = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task" });

    const taskId = create.body.task._id;

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });
});
