import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { User } from "../../src/entity/User";
import { isJwt } from "../utils";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

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
            const response = await request(app).post("/auth/register").send(userData);
            // Assert
            expect(response.statusCode).toBe(201);
        });

        it("should return valid json", async () => {
            // Arrange
            const userData = {
                firstName: "Zahid",
                lastName: "Sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/register").send(userData);
            // Assert
            expect((response.headers as Record<string, string>)["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should persist the user in the database", async () => {
            // Arrange
            const userData = {
                firstName: "Zahid",
                lastName: "Sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Asert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toEqual(userData.firstName);
            expect(users[0].lastName).toEqual(userData.lastName);
            expect(users[0].email).toEqual(userData.email);
        });

        // test for getting created user id
        it("should return id of created user", async () => {
            // Arrange
            const userData = {
                firstName: "Zahid",
                lastName: "Sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Asert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect((response.body as Record<string, string>).id).toBe(users[0].id);
        });

        it("should assign a customer role", async () => {
            // Arrange
            const userData = {
                firstName: "Zahid",
                lastName: "Sarang",
                email: "zahid@gmail.com",
                password: "password",
                role: Roles.CUSTOMER,
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Asert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it("should store hased password in database", async () => {
            const userData = {
                firstName: "Zahid",
                lastName: "Sarang",
                email: "zahid@gmail.com",
                password: "password",
                role: Roles.CUSTOMER,
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("should return 400 if email is already in exists", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            // Act
            const response = await request(app).post("/auth/register").send(userData);

            const users = await userRepository.find();
            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });

        it("should return the access token and refresh token inside a cookie", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };

            // Act
            const response = await request(app).post("/auth/register").send(userData);
            interface Headers {
                ["set-cookie"]: string[];
            }

            //Assert
            let accessToken = null;
            let refreshToken = null;
            const cookie = (response.headers as Headers)["set-cookie"] || [];
            cookie.forEach((cookie) => {
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

            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            const refreshTokenRepo = connection.getRepository(RefreshToken);
            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();
            expect(tokens).toHaveLength(1);
        });
    });

    describe("Fields are missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if firstName is missing", async () => {
            // Arrange
            const userData = {
                firstName: "",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if lastName is missing", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "",
                email: "zahid@gmail.com",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if password is missing", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "",
            };
            // Act
            const response = await request(app).post("/auth/register").send(userData);

            // Assert

            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: " zahid95@gmail.com ",
                password: "password",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe("zahid95@gmail.com");
        });

        it("should return 400 if  email is not a valid email", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid_mern.space", // Invalid email
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/register").send(userData);

            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 if  password length is less than 8 character", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahidsarang@gmail.com", // Invalid email
                password: "pass",
            };
            // Act
            const response = await request(app).post("/auth/register").send(userData);

            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("should return an array of error message if email is missing", async () => {
            // Arrange
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "",
                password: "password",
            };
            // Act
            const response = await request(app).post("/auth/register").send(userData);

            //Assert
            expect(response.body).toHaveProperty("errors");
            expect((response.body as Record<string, string>).errors.length).toBeGreaterThan(0);
        });
    });
});
