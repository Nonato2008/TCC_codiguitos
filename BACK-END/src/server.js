import express from "express";
import routes from "./routes/routes.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", routes);

app.use(
    "/uploads",
    express.static(path.resolve(process.cwd(), "uploads"))
);

app.use("/", routes);

app.listen(process.env.SERVER_PORT, () => {
    console.log(
        `Servidor rodando em: http://localhost:${process.env.SERVER_PORT}`
    );
});