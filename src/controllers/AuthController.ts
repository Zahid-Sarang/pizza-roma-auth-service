import { Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
export class AuthController {
    constructor(private userService: UserService) {}
    async register(req: RegisterUserRequest, res: Response) {
        const { firstName, lastName, email, password } = req.body;
        // store created user in "user" variable
        const user = await this.userService.create({
            firstName,
            lastName,
            email,
            password,
        });

        res.status(201).json({ id: user.id }); // pass the created user id in json object
    }
}
