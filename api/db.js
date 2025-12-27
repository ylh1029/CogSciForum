import pg from "pg"

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL.toLowerCase() == 'true'
})

pool.on('connect', async (client) => {
  await client.query(`SET search_path TO ${process.env.DB_SCHEMA}`)
})

export default pool