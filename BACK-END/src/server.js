import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routes/routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", routes);

app.listen(process.env.SERVER_PORT, () => {
    console.log(
        `Servidor rodando em: http://localhost:${process.env.SERVER_PORT}`
    );
});