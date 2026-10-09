import express from "express";
import mongoose from "mongoose";
import { env } from "../config/env.js";

const router = express.Router();

const databaseState = () => ({
    connected: mongoose.connection.readyState === 1,
    state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
});

router.get("/health", (_req, res) => {
    res.json({ success: true, status: "ok", database: databaseState(), environment: env.NODE_ENV, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

router.get("/ready", (_req, res) => {
    const database = databaseState();
    res.status(database.connected ? 200 : 503).json({
        success: database.connected,
        status: database.connected ? "ready" : "not_ready",
        database,
        environment: env.NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

export default router;
