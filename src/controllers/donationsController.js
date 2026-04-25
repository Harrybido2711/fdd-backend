import csv from 'csv-parser';
import { Readable } from 'stream';
import { pool } from '../config/database.js';

export const getDonations = async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT * FROM donations
      `);

    res.status(200).json({
      donations: result
    });
  } catch (err) {
    console.error("Get Donations Error ", err);
    res.status(500).json({ 
      error: err.message });
  }
};

export const uploadFile = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log('Parsed rows (sample):', results.slice(0, 5));
      console.log('Total rows:', results.length);

      if (!results.length) {
        return res.status(400).json({ error: 'CSV is empty' });
      }

      try {
        await pool.query('TRUNCATE TABLE donations');

        for (const row of results) {
          await pool.query(`
            INSERT INTO donations (donated_at, fund, amount, category, city, state)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
              row.donated_at || null,
              row.fund || null,
              row.amount ? parseFloat(row.amount) : null,
              row.category || null,
              row.city || null,
              row.state || null
            ]
          );
        }

        res.json({ 
          success: true, 
          id: results.length 
        });
      } catch (err) {
        console.error('Database insert error:', err);
        res.status(500).json({ error: err.message });
      }
    })
    .on('error', (err) => {
      console.error('CSV parse error:', err);
      res.status(500).json({ error: 'CSV parsing failed' });
    });
};

export const insertEntry = async (req, res) => {
  try {
    const { donated_at, fund, amount, category, city, state } = req.body;

    if (amount == undefined || amount == null) {
      return res.status(400).json({ 
        success: false,
        error: 'Amount is required' });
    }

    const [result] = await pool.query(`
      INSERT INTO donations (donated_at, fund, amount, category, city, state)
      VALUES (?, ?, ?, ?, ?, ?)`, 
    [
      donated_at || null,
      fund || null,
      parseFloat(amount),
      category || null,
      city || null,
      state || null
    ]);

    if (result.affectedRows  === 0) {
      return res.status(404).json({ error: 'No rows affected insert' });
    }

    res.status(201).json({
      success: true,
      id: result.insertId
    });
  } catch (err) {
    console.error("Database insert error: ", err);
    res.status(500).json({ 
      error: err.message });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Id is required' });
    }

    const [result] = await pool.query(`
      DELETE FROM donations WHERE id = ?`, 
    [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Donation not found' })
    }

    res.status(201).json({
      success: true,
    });
  } catch (err) {
    console.error("Database delete error: ", err);
    res.status(500).json({ 
      error: err.message });
  }
};

export const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { donated_at, fund, amount, category, city, state } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Donation ID is required' });
    }

    if (amount != null && isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, error: 'Amount must be a number' });
    }

    const fields = [];
    const values = [];

    if (donated_at !== undefined) { fields.push(`donated_at = ?`); values.push(donated_at); }
    if (fund !== undefined) { fields.push(`fund = ?`); values.push(fund); }
    if (amount !== undefined) { fields.push(`amount = ?`); values.push(parseFloat(amount)); }
    if (category !== undefined) { fields.push(`category = ?`); values.push(category); }
    if (city !== undefined) { fields.push(`city = ?`); values.push(city); }
    if (state !== undefined) { fields.push(`state = ?`); values.push(state); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields provided for update' });
    }

    values.push(id);
    const [result] = await pool.query(
      `UPDATE donations SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows  === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.status(200).json({ 
      success: true, 
      donation: result });

  } catch (err) {
    console.error("Database update error: ", err);
    res.status(500).json({ error: err.message });
  }
};