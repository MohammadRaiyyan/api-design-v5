import request from "supertest";
import app from "../src/server.ts";
import { clearDatabase, createTestUser } from "./setup/dbHelper.ts";
const sampleUser = {
    username: "testuser",
    email: "testuser@gmail.com",
    password: "Test@1234",
};
describe("Authentication tests", () => {
    beforeEach(async () => {
        await clearDatabase();
    })
    describe("POST /api/auth/register: User Registration", async () => {
        it("should register a new user successfully", async () => {

            const response = await request(app).post("/api/auth/register").send(sampleUser).expect(201);
            expect(response.body.data).toHaveProperty("user");
            expect(response.body.data).toHaveProperty("token");
            expect(response.body.data).not.toHaveProperty("password");
        });
    })
    describe("POST /api/auth/login: User Login", async () => {
        it("should login an existing user successfully", async () => {
            // First, register the user
            const { user, password } = await createTestUser();
            // Then, attempt to login
            const response = await request(app).post("/api/auth/login").send({
                email: user.email,
                password: password,
            }).expect(200);
            expect(response.body.data).toHaveProperty("user");
            expect(response.body.data).toHaveProperty("token");
            expect(response.body.data).not.toHaveProperty("password");
        })
    })
})