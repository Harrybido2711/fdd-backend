import { parse } from 'csv-parse';
import multer from 'multer';

import { pgPool } from '../config/database.js';

// Store uploaded files in memory (not disk)
const upload = multer({ storage: multer.memoryStorage() });

const csvController = {
  upload: upload.single('file'),

  async handleUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const csvString = req.file.buffer.toString('utf-8');

      // Parse the CSV
      const records = await new Promise((resolve, reject) => {
        parse(
          csvString,
          {
            columns: true, // use first row as headers
            skip_empty_lines: true,
            trim: true,
          },
          (err, records) => {
            if (err) reject(err);
            else resolve(records);
          }
        );
      });

      let rowsProcessed = 0;
      let rowsFailed = 0;
      const errors = [];

      for (let i = 0; i < records.length; i++) {
        const row = records[i];

        try {
          // Map CSV columns to database columns
          // Expected CSV headers: date, fund, amount, city, state
          const donated_at = row.date || row.donated_at || null;
          const fund = row.fund || null;
          const amount = parseFloat(row.amount);
          const city = row.city || null;
          const state = row.state || null;

          if (isNaN(amount)) {
            throw new Error('Invalid amount');
          }

          await pgPool.query(
            `INSERT INTO donations (donated_at, fund, amount, city, state)
             VALUES ($1, $2, $3, $4, $5)`,
            [donated_at, fund, amount, city, state]
          );

          rowsProcessed++;
        } catch (rowError) {
          rowsFailed++;
          errors.push({
            row: i + 1,
            data: row,
            error: rowError.message,
          });
        }
      }

      res.json({
        message: 'CSV processed',
        rowsProcessed,
        rowsFailed,
        errors,
      });
    } catch (error) {
      console.error('CSV upload error:', error);
      res.status(500).json({ error: 'Failed to process CSV' });
    }
  },
};

export default csvController;
