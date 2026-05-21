import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client/extension";

const addapter = new PrismaMariaDb({
    host : "localhost",
    port : 3306, 
    connectionLimit : 10
})


const client = new PrismaClient({addapter})