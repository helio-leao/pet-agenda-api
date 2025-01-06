import express from "express";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import petsRouter from "./routes/pets";
import tasksRouter from "./routes/tasks";
import petWeightRecordsRouter from "./routes/petWeightRecords";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger/swagger-output.json";

const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://pet-agenda.vercel.app",
];

mongoose.connect(process.env.DATABASE_URL!);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const app = express();
app.use(express.json());
app.use(cors({ origin: allowedOrigins }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/pets", petsRouter);
app.use("/tasks", tasksRouter);
app.use("/petWeightRecords", petWeightRecordsRouter);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
