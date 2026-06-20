import express, { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Server} from "socket.io";
import { createServer } from "node:http";

import dotenv from 'dotenv'
import path from 'node:path'


dotenv.config({
    path : path.resolve(__dirname, "./../../../.env")
})

const app = express();

// creating http server
const httpServer =  createServer(app);
console.log('Inside app', process.env.CORS_ORIGIN);
    
const io = new Server(httpServer, {
    cors : {
        origin : "http://localhost:5173",
        methods : ['GET', 'POST'],
        credentials : true
    }
});

io.on('connection', (socket) => {
    console.log(`Connection established ${socket.id}`);

    socket.on('send-message', (data) => {
        console.log(data);

        socket.broadcast.emit('receive-message',data);
        io.emit(data)
    })
   


    socket.on('disconnect', () => {
        console.log(`Connection discontined`);
        
    })
    
})



// cookie parser setup
app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.use(cookieParser())

console.log(process.env.CORS_ORIGIN);

app.use(
    cors({
        origin : process.env.CORS_ORIGIN,
        credentials : true
    })
)



import { authRouter } from "./modules/auth/auth.route";
import { ApiError } from "@repo/utils";

app.use("/api/v1/auth", authRouter);


app.use((err : ErrorRequestHandler, req : Request, res :Response , next : NextFunction) => {
    if(err instanceof ApiError){
            const statusCode = err.statusCode || 500;
            res.status(statusCode).json({
            success: false,
            message: err.message || "Internal Server Error",
  });

    }
 
});


export {httpServer}



