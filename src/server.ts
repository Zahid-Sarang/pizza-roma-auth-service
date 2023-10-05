import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => logger.info(`Listing on ${PORT}`));
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error("Error", error);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

startServer();
