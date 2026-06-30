import { ApiError } from "@repo/utils";
import { handleEvents } from "./events/handleevent";
import jwt from "jsonwebtoken";
import { userModel } from "@repo/db-nosql";
import type { JwtPayload } from "jsonwebtoken";
import { chatEventEnums } from "@repo/types";

interface jwtpayload extends JwtPayload {
  _id: string;
}

const initializeSocketInstance = (io: any) => {
  return io.on("connection", async (socket: any) => {
    try {
      const token = socket.handshake.auth.accessToken;
      if (!token) throw new ApiError(401, "Unauthorized access, access token missing");

      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as jwtpayload;

      if (!decodedToken) throw new ApiError(401, "Unauthorized access, invalid access token");

      const user = await userModel
        .findById(decodedToken?._id)
        .select("-hashed_password -refresh_token");

      if (!user) throw new ApiError(401, "Unauthorized request, token expired");

      socket.user = user;
      socket.join(user._id.toString());
      socket.emit(chatEventEnums.CONNECTED_EVENT);

      handleEvents(socket, io);

      socket.on(chatEventEnums.DISCONNECT_EVENT, () => {
        if (socket.user?._id) {
          socket.leave(socket.user._id.toString());
        }
      });
    } catch {
      socket.emit(
        chatEventEnums.SOCKET_ERROR_EVENT,
        "Something went wrong while connecting socket"
      );
    }
  });
};

const emitSocketEvents = (req: any, roomId: any, ioevent: any, payload: any) => {
  req.app.get("io").in(roomId).emit(ioevent, payload);
};

export { initializeSocketInstance, emitSocketEvents };
