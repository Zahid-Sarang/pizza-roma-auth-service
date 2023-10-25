import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from ".";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    synchronize: true, // always false in production
    logging: false,
    entities: [User, RefreshToken],
    migrations: [],
    subscribers: [],
});
