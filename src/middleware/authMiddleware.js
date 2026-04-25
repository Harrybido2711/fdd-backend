import admin from '../config/firebase.js';

// const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token =
//       authHeader && authHeader.startsWith('Bearer ')
//         ? authHeader.split(' ')[1]
//         : null;

//     if (!token) {
//       return res.status(401).json({ error: 'No Firebase ID token provided' });
//     }

//     const decodedToken = await admin.auth().verifyIdToken(token);

//     req.user = decodedToken;
//     next();
//   } catch (error) {
//     console.error('Firebase Auth middleware error:', error);
//     if (error.code === 'auth/id-token-expired') {
//       return res.status(401).json({ error: 'Firebase ID token expired' });
//     }
//     if (error.code === 'auth/invalid-id-token') {
//       return res.status(401).json({ error: 'Invalid Firebase ID token' });
//     }
//     res
//       .status(500)
//       .json({ error: 'Internal server error during authentication' });
//   }
// };

// export default authMiddleware;


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
