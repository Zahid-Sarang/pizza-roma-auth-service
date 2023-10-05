import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
    describe("Given all fields", () => {
        it("should return the 201 status code", async () => {
            // Arrange
            const userData = {
                firstName: "Zahid",
                lastName: "Sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            // Assert
            expect(response.statusCode).toBe(201);
        });
    });
    describe("Fields are missing", () => {});
});
