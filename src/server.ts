import express from "express";
import usersRouter from "./routes/users";
import petsRouter from "./routes/pets";
import tasksRouter from "./routes/tasks";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger/swagger-output.json";

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DATABASE_URL!);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/users", usersRouter);
app.use("/pets", petsRouter);
app.use("/tasks", tasksRouter);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
