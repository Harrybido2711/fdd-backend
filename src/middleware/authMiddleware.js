import admin from '../config/firebase.js';



const requireAuth = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] ||
      req.cookies.session;

    if (!token) {
      return res.status(401).json({ error: 'No token' });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', err });
  }
};

export default requireAuth;
