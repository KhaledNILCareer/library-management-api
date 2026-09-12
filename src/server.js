import app from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "dotenv";
config({
  path: [".env.example", ".env.development", ".env.production"],
});
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
