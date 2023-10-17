import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import request from "supertest";
import { User } from "../../src/entity/User";
import { isJwt } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("POST /auth/login", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return 200 status code", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            await request(app).post("/auth/register").send(userData);

            const loginInfo = {
                email: "zahid@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/login").send(loginInfo);

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it("should return a valid json response", async () => {
            // Arrange
            const userData = {
                email: "zahid@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/login").send(userData);
            expect((response.headers as Record<string, string>)["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should return a 400 if email and password is invalid", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            await request(app).post("/auth/register").send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const loginInfo = {
                email: "zahid@gmail1.com",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/login").send(loginInfo);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users[0].password).not.toBe(loginInfo.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("should return user id ", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            await request(app).post("/auth/register").send(userData);

            const loginInfo = {
                email: "zahid@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/login").send(loginInfo);
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(response.body).toHaveProperty("id");
            expect((response.body as Record<string, string>).id).toBe(users[0].id);
        });

        it("should return the access token and refresh token in a cookie ", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            await request(app).post("/auth/register").send(userData);

            const loginInfo = {
                email: "zahid@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/login").send(loginInfo);

            interface Headers {
                ["set-cookie"]: string[];
            }

            // Assert
            let accessToken = null;
            let refreshToken = null;
            const cookies = (response.headers as Headers)["set-cookie"] || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it("should store the refresh token in the database", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            await request(app).post("/auth/register").send(userData);

            const loginInfo = {
                email: "zahid@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/login").send(loginInfo);

            // Assert
            const refreshTokenRepo = connection.getRepository(RefreshToken);
            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();
            expect(tokens).toHaveLength(2);
        });
    });

    describe("Fields are missing", () => {
        it("should return a 400 status code if email is missing", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            await request(app).post("/auth/register").send(userData);

            const loginInfo = {
                email: "",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/login").send(loginInfo);

            expect(response.statusCode).toBe(400);
        });

        it("should return a 400 status code if password is missing", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            await request(app).post("/auth/register").send(userData);

            const loginInfo = {
                email: "zahid@gmail.com",
                password: "",
            };
            // Act
            const response = await request(app).post("/auth/login").send(loginInfo);

            expect(response.statusCode).toBe(400);
        });
    });
});
