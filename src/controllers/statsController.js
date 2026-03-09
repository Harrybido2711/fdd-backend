import { pgPool } from '../config/database.js';


export const getCategoryDollars = async (req, res) => {
  try {
    const client = await pgPool.connect();
    const result = await client.query(`
      SELECT category, SUM(amount) AS totalDollars
      FROM donations
      GROUP BY category
      ORDER BY category
    `);
    client.release();

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching category by dollars", err);
    res.status(500).json({ error: err.message });
  }
};

export const getCategoryCount = async (req, res) => {
  try {
    const client = await pgPool.connect();
    const result = await client.query(`
      SELECT category, COUNT(*) AS totalDonations
      FROM donations
      GROUP BY category
      ORDER BY category;
    `);
    client.release();

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching category counts", err);
    res.status(500).json({ error: err.message });
  }
};

export const getTotalDollars = async (req, res) => {
  try {
    const client = await pgPool.connect();
    const result = await client.query(`
      SELECT SUM(amount) AS totalDonations
      FROM donations
    `);
    client.release();

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching total dollars", err);
    res.status(500).json({ error: err.message });
  }
};

export const getStateDollars = async (req, res) => {
  try {
    const client = await pgPool.connect();
    const result = await client.query(`
      SELECT state, SUM(amount) AS totalDollars
      FROM donations
      GROUP BY state
      ORDER BY state
    `);
    client.release();

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching state by dollars", err);
    res.status(500).json({ error: err.message });
  }
};

export const getStateCount = async (req, res) => {
  try {
    const client = await pgPool.connect();
    const result = await client.query(`
      SELECT state, COUNT(*) AS totalDonations
      FROM donations
      GROUP BY state
      ORDER BY state;
    `);
    client.release();

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching state counts", err);
    res.status(500).json({ error: err.message });
  }
};
