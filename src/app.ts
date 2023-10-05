import express, { NextFunction, Response, Request } from "express";
import { HttpError } from "http-errors";

import logger from "./config/logger";

const app = express();

app.get("/", async (req, res) => {
    res.status(200).send("Welcome to auth service");
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;
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
