import express from "express"
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { Socket , Server} from "socket.io";
import { createServer } from "node:http";

const app = express();

// creating http server
const httpServer =  createServer(app);

const io = new Server(httpServer, {
    cors : {
        origin : process.env.CORS_ORIGIN,
        methods : ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`Connection established ${socket.id}`);

    socket.on('disconnection', () => {
        console.log(`Connection discontined`);
        
    })
    
})

// cors policy
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));

// cookie parser setup
app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.use(cookieParser())

import { authRouter } from "./modules/auth/auth.route";

app.use("/api/v1/auth", authRouter);


export {app}



