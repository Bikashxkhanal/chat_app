import express, { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { initializeSocketInstance } from "./websocket";
import dotenv from "dotenv";
import path from "node:path";

// dotenv.config({
//   path: path.resolve(__dirname, "./../../../.env"),
// });

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
initializeSocketInstance(io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'))

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

import { authRouter } from "./modules/auth/auth.route";
import { ApiError } from "@repo/utils";
import { userRouter } from "./modules/users/users.route";
import { conversationRouter } from "./modules/conversations/conversations.route";
import { messagesRouter } from "./modules/messages/messages.route";
import { groupsRouter } from "./modules/groups/groups.route";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/conversations", conversationRouter);
app.use("/api/v1/messages", messagesRouter);
app.use("/api/v1/groups", groupsRouter);

app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    statusCode: err.statusCode,
    errors: err.errors,
    message: err.message || "Internal Server Error",
  });
});

export { httpServer, app };
