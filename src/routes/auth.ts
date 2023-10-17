import express, { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { AuthController } from "../controllers/AuthController";
import { User } from "../entity/User";
import { TokenSerivce } from "../services/TokenService";
import { UserService } from "../services/UserService";
import registerValidators from "../validators/register-validators";
const authRouter = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const tokenService = new TokenSerivce();
const authController = new AuthController(userService, logger, tokenService);

authRouter.post(
    "/register",
    registerValidators,
    (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next),
);

export default authRouter;
2;
