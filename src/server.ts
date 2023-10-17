import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info("database connected successfully!");
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

void startServer();
