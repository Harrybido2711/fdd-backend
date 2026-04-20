import { pool } from '../config/database.js';


export const getCategoryDollars = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, SUM(amount) AS totalDollars
      FROM donations
      GROUP BY category
      ORDER BY category
    `);

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching category by dollars", err);
    res.status(500).json({ error: err.message });
  }
};

export const getCategoryCount = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, COUNT(*) AS totalDonations
      FROM donations
      GROUP BY category
      ORDER BY category;
    `);

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching category counts", err);
    res.status(500).json({ error: err.message });
  }
};

export const getTotalDollars = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT SUM(amount) AS totalDonations
      FROM donations
    `);

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching total dollars", err);
    res.status(500).json({ error: err.message });
  }
};

export const getStateDollars = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT state, SUM(amount) AS totalDollars
      FROM donations
      GROUP BY state
      ORDER BY state
    `);

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching state by dollars", err);
    res.status(500).json({ error: err.message });
  }
};

export const getStateCount = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT state, COUNT(*) AS totalDonations
      FROM donations
      GROUP BY state
      ORDER BY state;
    `);

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching state counts", err);
    res.status(500).json({ error: err.message });
  }
};
