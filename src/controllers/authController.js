import admin from '../config/firebase.js';

const authController = {


  async login(req, res) {
    try {
      const { idToken } = req.body;

      const decoded = await admin.auth().verifyIdToken(idToken);

      res.cookie('session', idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600 * 1000,
      });

      res.json({
        uid: decoded.uid,
        email: decoded.email,
      });

    } catch (err) {
      res.status(401).json({ error: 'Invalid token', err });
    }
  },

  async logout(req, res) {
    res.clearCookie('session');
    res.json({ message: 'Logged out' });
  },

  async getMe(req, res) {
    res.json({
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name || null,
      admin: req.user.admin || false,
    });
  }
};

export default authController;
