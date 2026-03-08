import { pgPool } from '../config/database.js';

const dashboardController = {
  async getOverview(req, res) {
    try {
      // Total donations and count
      const totalsResult = await pgPool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM donations`
      );

      // Donations grouped by fund
      const byFundResult = await pgPool.query(
        `SELECT fund, COALESCE(SUM(amount), 0) AS total
         FROM donations
         GROUP BY fund
         ORDER BY total DESC`
      );

      const { total, count } = totalsResult.rows[0];
      const donationsByFund = {};
      for (const row of byFundResult.rows) {
        donationsByFund[row.fund || 'Unknown'] = parseFloat(row.total);
      }

      res.json({
        totalDonations: parseFloat(total),
        donationCount: parseInt(count),
        donationsByFund,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default dashboardController;
