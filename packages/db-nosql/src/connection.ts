import mongoose from 'mongoose'

export const connectMongoDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.DATABASE_URL}`, {
                dbName : "chat_app"
            }
            
        )
         
    } catch (error) {
            console.log("DB connection failed!");  
            process.exit(1)
    }
} 
