
import { connectMongoDB } from "@repo/db-nosql";
import { httpServer} from "./app";


const port = process.env.API_PORT ?? "8000";

(async () => {
  try {
    await connectMongoDB();
    console.log("DB connection established successfully!");

    httpServer.listen(port, () => {
      console.log(`Server is running on ${port}`);
    });
  } catch (error) {
    console.error("Failed to establish db connection!", error);
    process.exit(1);
  }
})();
