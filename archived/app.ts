import express from "express";
import cors from "cors";

import middleware from "../utils/middleware";

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
