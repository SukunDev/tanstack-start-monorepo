import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes";
import { Service } from "./services/service";
import path from "path";
import dotenv from "dotenv";
import { rateLimiter } from "./middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOrigin = process.env.CORS_ORIGIN;
let allowedOrigins;

if (corsOrigin === "*") {
  allowedOrigins = true;
} else if (
  corsOrigin &&
  corsOrigin.startsWith("[") &&
  corsOrigin.endsWith("]")
) {
  try {
    const parsedOrigins = JSON.parse(corsOrigin);
    if (Array.isArray(parsedOrigins) && parsedOrigins.includes("*")) {
      allowedOrigins = true;
    } else {
      allowedOrigins = parsedOrigins;
    }
  } catch (error) {
    console.error("Invalid CORS_ORIGIN JSON format:", corsOrigin);
    allowedOrigins = corsOrigin;
  }
} else if (corsOrigin && corsOrigin.includes(",")) {
  allowedOrigins = corsOrigin.split(",").map((origin) => origin.trim());
} else {
  allowedOrigins = corsOrigin;
}

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.static(path.join(process.cwd(), "public")));

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300,
  })
);

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${req.method} ${req.url} - ${timestamp}`);
  next();
});

app.use(bodyParser.json());
app.use("/api", routes);

const service = new Service();

app.use((req, res) => {
  const response = service.response({
    code: 404,
    message: "Endpoint not found",
    data: null,
    error: "Endpoint not found",
  });
  res.status(404).json(response);
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);
    const response = service.response({
      code: 500,
      message: "Internal Server Error",
      data: null,
      error: "Internal Server Error",
    });
    res.status(500).json(response);
  }
);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
