import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { config } from "dotenv";
import { resolve } from "node:path";

config({
  path: resolve(__dirname, "../../../.env"),
});

if (!process.env.DB_NAME) {
  throw new Error("DB_NAME is missing (loaded from root .env)");
}
if (!process.env.DB_USER) {
  throw new Error("DB_USER is missing (loaded from root .env)");
}
if (!process.env.DB_PASSWORD && process.env.DB_PASSWORD !== "") {
  throw new Error("DB_PASSWORD is missing (loaded from root .env)");
}
if (!process.env.DB_HOST) {
  throw new Error("DB_HOST is missing (loaded from root .env)");
}
if (!process.env.DB_PORT) {
  throw new Error("DB_PORT is missing (loaded from root .env)");
}

if (!process.env.DB_SSL) {
  throw new Error("DB_SSL is missing (loaded from root .env)");
}

const connectionString = `postgresql://${process.env.DB_USER}:${
  process.env.DB_PASSWORD
}@${process.env.DB_HOST}:${process.env.DB_PORT}/${
  process.env.DB_NAME
}?sslmode=${process.env.DB_SSL === "true" ? "require" : "disable"}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
