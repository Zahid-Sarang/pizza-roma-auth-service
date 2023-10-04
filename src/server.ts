import app from "./app";
import { Config } from "./config";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        // eslint-disable-next-line no-console
        app.listen(PORT, () => console.log("Starting server", PORT));
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error", error);
        process.exit(1);
    }
};

startServer();
