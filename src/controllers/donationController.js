import { pgPool } from '../config/database.js';

const donationController = {
  async getAll(req, res) {
    try {
      const { fund, start_date, end_date } = req.query;
      let sql = 'SELECT * FROM donations';
      const params = [];
      const conditions = [];

      if (fund) {
        params.push(fund);
        conditions.push(`fund = $${params.length}`);
      }
      if (start_date) {
        params.push(start_date);
        conditions.push(`donated_at >= $${params.length}`);
      }
      if (end_date) {
        params.push(end_date);
        conditions.push(`donated_at <= $${params.length}`);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY donated_at DESC';

      const { rows } = await pgPool.query(sql, params);
      res.json(rows);
    } catch (error) {
      console.error('Get donations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const { rows } = await pgPool.query(
        'SELECT * FROM donations WHERE id = $1',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Get donation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async create(req, res) {
    try {
      const { donated_at, fund, amount, city, state } = req.body;

      if (!amount) {
        return res.status(400).json({ error: 'Amount is required' });
      }

      const { rows } = await pgPool.query(
        `INSERT INTO donations (donated_at, fund, amount, city, state)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [donated_at || null, fund || null, amount, city || null, state || null]
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Create donation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { donated_at, fund, amount, city, state } = req.body;

      const { rows } = await pgPool.query(
        `UPDATE donations
         SET donated_at = $1, fund = $2, amount = $3, city = $4, state = $5
         WHERE id = $6
         RETURNING *`,
        [donated_at, fund, amount, city, state, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Update donation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const { rowCount } = await pgPool.query(
        'DELETE FROM donations WHERE id = $1',
        [id]
      );

      if (rowCount === 0) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      res.json({ message: 'Donation deleted' });
    } catch (error) {
      console.error('Delete donation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default donationController;
