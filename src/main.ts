import express from "express";
import { PrismaClient } from "@prisma/client";
import hwRouter from "./endpoint/hwRouter";

const prisma = new PrismaClient();
export default prisma;

const app = express();
const port = 8069;

app.use(express.json());
app.use(express.urlencoded());

app.get("/ping", async (_req, res) => {
  console.log("pong");
  res.json({ pong: true });
});

app.use("/hw", hwRouter);

app.listen(port, "0.0.0.0", () => {
  console.log(`App runing at http://localhost:` + port);
});
