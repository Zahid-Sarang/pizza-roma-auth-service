import { UserData } from "../types";
import { User } from "../entity/User";
import { Repository } from "typeorm";
export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        const user = await this.userRepository.save({
            firstName,
            lastName,
            email,
            password,
        });
        return user; // return the created user
    }
}
