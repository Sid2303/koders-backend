import request from "supertest";
import app from "../app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

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
});

describe("POST /api/register", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.user.username).toBe("testuser");
  });

  it("should not register with missing fields", async () => {
    const res = await request(app).post("/api/register").send({
      email: "test@example.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should not register with invalid email", async () => {
    const res = await request(app).post("/api/register").send({
      username: "testuser",
      email: "notanemail",
      password: "password123",
    });

    expect(res.statusCode).toBe(400);
  });

  it("should not register with password shorter than 6 characters", async () => {
    const res = await request(app).post("/api/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "abc",
    });

    expect(res.statusCode).toBe(400);
  });

  it("should not register duplicate email", async () => {
    await request(app).post("/api/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/register").send({
      username: "anotheruser",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already/i);
  });
});

describe("POST /api/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });
  });

  it("should login with correct credentials", async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should not login with wrong password", async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
  });

  it("should not login with non-existent email", async () => {
    const res = await request(app).post("/api/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(401);
  });
});
