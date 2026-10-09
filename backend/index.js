import http from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import connectDB, { disconnectDB } from "./utils/db.js";
import { logger } from "./utils/logger.js";

let server;
let shuttingDown = false;

const shutdown = async (signal, exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Graceful shutdown started");

    const forceExit = setTimeout(() => {
        logger.error("Graceful shutdown timed out");
        process.exit(1);
    }, 10000);
    forceExit.unref();

    if (server) await new Promise((resolve) => server.close(resolve));
    await disconnectDB();
    clearTimeout(forceExit);
    process.exit(exitCode);
};

const start = async () => {
    try {
        await connectDB();
        server = http.createServer(app);
        server.listen(env.PORT, () => {
            logger.info({ port: env.PORT, environment: env.NODE_ENV }, "JobNet API listening");
        });
    } catch (error) {
        logger.fatal({ err: error }, "Failed to start JobNet API");
        await disconnectDB();
        process.exit(1);
    }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (error) => {
    logger.error({ err: error }, "Unhandled promise rejection");
    shutdown("unhandledRejection", 1);
});
process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught exception");
    shutdown("uncaughtException", 1);
});

start();
