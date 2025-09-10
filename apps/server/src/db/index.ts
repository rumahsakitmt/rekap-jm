import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import "dotenv/config";

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: Number(process.env.DATABASE_PORT!),
});

export const db = drizzle({ client: connection });
