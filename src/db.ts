import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function createTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS data_table (
        id SERIAL PRIMARY KEY,
        metadata JSONB,
        content TEXT NOT NULL,
        embedding vector(1536)
      );
    `);
  } finally {
    client.release();
  }
}

export async function insertData(metadata: {category: string, created_at: string}, content: string, embedding: string) {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO data_table (metadata, content, embedding) VALUES ($1, $2, $3)',
      [metadata, content, embedding]
    );
  } finally {
    client.release();
  }
}

export async function findSimilarVectors(embedding: string, limit: number = 5) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT metadata, content, embedding <=> $1 AS distance FROM data_table ORDER BY distance ASC LIMIT $2',
      [embedding, limit]
    );
    return result.rows;
  } finally {
    client.release();
  }
}
