import express from "express";
import usersRouter from "./routes/users";
import petsRouter from "./routes/pets";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use("/users", usersRouter);
app.use("/pets", petsRouter);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
