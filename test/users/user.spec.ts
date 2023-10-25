import request from "supertest";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("Get /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:8001");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return the 200 status code", async () => {
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it("should return the user data", async () => {
            // register user
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            // generate token
            const accessToken = jwks.token({ sub: String(data.id), role: data.role });
            // add token to cookie
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            // assert
            // check if user id matches with register user
            expect((response.body as Record<string, string>).id).toBe(data.id);
        });

        it("should not return password field", async () => {
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it("should return the user data", async () => {
            // register user
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            // generate token
            const accessToken = jwks.token({ sub: String(data.id), role: data.role });
            // add token to cookie
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            // assert
            // check if user id matches with register user
            expect(response.body).not.toHaveProperty("password");
        });
    });
});
