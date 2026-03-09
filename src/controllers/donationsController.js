import csv from 'csv-parser';
import { Readable } from 'stream';
import { pgPool } from '../config/database.js';

export const getDonations = async (req, res) => {
  try {
    const client = await pgPool.connect();

    const result = await client.query(`
      SELECT * FROM donations
      `);

    client.release();

    res.status(200).json({
      donations: result.rows
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
        const client = await pgPool.connect();

        await client.query('TRUNCATE donations');

        for (const row of results) {
          await client.query(
            `INSERT INTO donations (donated_at, fund, amount, category, city, state)
             VALUES ($1, $2, $3, $4, $5, $6)`,
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

        client.release();

        res.json({ 
          success: true, 
          inserted_rows: results.length 
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

    const client = await pgPool.connect();

    const result = await client.query(`
      INSERT INTO donations (donated_at, fund, amount, category, city, state)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`, 
    [
      donated_at || null,
      fund || null,
      parseFloat(amount),
      category || null,
      city || null,
      state || null
    ]);

    client.release();

    res.status(201).json({
      success: true,
      donation: result.rows[0]
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

    const client = await pgPool.connect();

    const result = await client.query(`
      DELETE FROM donations WHERE id = $1 RETURNING *`, 
    [id]);

    client.release();

    if (result.rows.length == 0) {
      return res.status(404).json({ 
        error: 'Donation not found' })
    }

    res.status(201).json({
      success: true,
      donation: result.rows[0]
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

    const client = await pgPool.connect();

    const fields = [];
    const values = [];
    let counter = 1;

    if (donated_at !== undefined) { fields.push(`donated_at = $${counter++}`); values.push(donated_at); }
    if (fund !== undefined) { fields.push(`fund = $${counter++}`); values.push(fund); }
    if (amount !== undefined) { fields.push(`amount = $${counter++}`); values.push(parseFloat(amount)); }
    if (category !== undefined) { fields.push(`category = $${counter++}`); values.push(category); }
    if (city !== undefined) { fields.push(`city = $${counter++}`); values.push(city); }
    if (state !== undefined) { fields.push(`state = $${counter++}`); values.push(state); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields provided for update' });
    }

    values.push(id); // last parameter for WHERE id
    const result = await client.query(
      `UPDATE donations SET ${fields.join(', ')} WHERE id = $${counter} RETURNING *`,
      values
    );

    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.status(200).json({ 
      success: true, 
      donation: result.rows[0] });

  } catch (err) {
    console.error("Database update error: ", err);
    res.status(500).json({ error: err.message });
  }
};