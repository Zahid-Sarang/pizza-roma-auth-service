import express from "express";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { AuthController } from "../controllers/AuthController";
import { User } from "../entity/User";
import { UserService } from "../services/UserService";
const authRouter = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);

authRouter.post("/register", (req, res, next) => authController.register(req, res, next));

export default authRouter;
2;
