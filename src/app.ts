import "reflect-metadata";
import express, { NextFunction, Response, Request } from "express";
import { HttpError } from "http-errors";
import cookieParse from "cookie-parser";
import logger from "./config/logger";
import authRouter from "./routes/auth";

const app = express();
app.use(express.static("public"));
app.use(cookieParse());
app.use(express.json());

app.get("/", async (req, res) => {
    res.status(200).send("Welcome to auth service!");
});

app.use("/auth", authRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
