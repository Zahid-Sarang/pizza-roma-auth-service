import { Request } from "express";
import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { RefreshToken } from "../entity/RefreshToken";
import { AuthCookie, IRefreshTokenPayload } from "../types";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
    async isRevoked(request: Request, token) {
        try {
            const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepository.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: { id: Number(token?.payload.sub) },
                },
            });
            return refreshToken === null;
        } catch (err) {
            logger.error("Error while getting refresh token", {
                id: (token?.payload as IRefreshTokenPayload).id,
            });
        }
        return true;
    },
});
