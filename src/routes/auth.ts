import express, { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { AuthController } from "../controllers/AuthController";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { CredentialService } from "../services/CredentialService";
import { TokenSerivce } from "../services/TokenService";
import { UserService } from "../services/UserService";
import loginValidators from "../validators/login-validators";
import registerValidators from "../validators/register-validators";
const authRouter = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshToken = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenSerivce(refreshToken);
const credentialsService = new CredentialService();
const authController = new AuthController(userService, logger, tokenService, credentialsService);

authRouter.post(
    "/register",
    registerValidators,
    (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next),
);

authRouter.post("/login", loginValidators, (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next),
);

export default authRouter;
2;
