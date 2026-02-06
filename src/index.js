const express = require("express");
const { Client } = require("pg");
const redis = require("redis");

const app = express();

const pgClient = new Client({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "postgres",
});

pgClient.connect();

const redisClient = redis.createClient({
  url: "redis://cache:6379",
});
redisClient.connect();

app.get("/", async (req, res) => {
  const visits = await redisClient.incr("visits");
  res.send(`Hello 🚀 Visits: ${visits}`);
});

app.listen(3000, () => console.log("Server running on port 3000"));
