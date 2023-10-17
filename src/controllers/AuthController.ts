import { Response, NextFunction } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenSerivce } from "../services/TokenService";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenSerivce,
    ) {}
    async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
        // Validate request fields
        const validate = validationResult(req);
        if (!validate.isEmpty()) {
            return res.status(400).json({ errors: validate.array() });
        }
        const { firstName, lastName, email, password } = req.body;

        this.logger.debug("New request to register a user: ", {
            firstName,
            lastName,
            email,
            password: "****",
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info("User has been registered", { id: user.id });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken = await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 60 minutes
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1year
                httpOnly: true,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }
}
