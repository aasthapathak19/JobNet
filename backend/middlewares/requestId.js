import { randomUUID } from "node:crypto";

export const requestId = (req, res, next) => {
    const incomingId = req.get("x-request-id");
    req.requestId = incomingId && incomingId.length <= 128 ? incomingId : randomUUID();
    res.setHeader("X-Request-Id", req.requestId);
    next();
};
