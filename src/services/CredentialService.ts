import bcrypt from "bcrypt";

export class CredentialService {
    async comparePassword(userPassword: string, hashedPassword: string) {
        return await bcrypt.compare(userPassword, hashedPassword);
    }
}
