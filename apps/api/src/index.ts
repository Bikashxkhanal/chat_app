import dotenv from 'dotenv'
import path from 'node:path'


dotenv.config({
    path : path.resolve(__dirname, "./../../../.env")
})
console.log(__dirname);


import {connectMongoDB} from "@repo/db-nosql";
import { httpServer } from "./app";




;(async() => {
    
    try {
        await connectMongoDB();
      console.log(`DB connection established successfully!`);
      
    } catch (error) {
        console.log(`Failed to establish db connection!`);
    }
})()

httpServer.listen( process.env.API_PORT, () => {
    console.log(`Server is running on ${process.env.API_PORT}`);
})


