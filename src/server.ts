import express from "express";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
