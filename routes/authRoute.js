const express = require('express');
require('../controllers/auth');
require('dotenv').config();
const passport = require('passport');
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

//Starting Google OAuth
router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    prompt: 'select_account consent',
  })
);

//Handle Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {

    const user = {
      name: req.user.displayName,
      email: req.user.emails?.[0]?.value,
      picture: req.user.photos?.[0]?.value,
    };


    // Create JWT
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });

    const redirectUrl = `http://localhost:5173/auth-success?token=${token}`;
    res.redirect(redirectUrl);

  }
);

//Facebook Auth
router.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
  })
);

//Handle Callback
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req, res) => {
    
    const user = {
      name: req.user.displayName,
      email: req.user.emails?.[0]?.value,
      picture: req.user.photos?.[0]?.value,
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });

    const redirectUrl = `http://localhost:5173/auth-success?token=${token}`;
    res.redirect(redirectUrl);

  }
);

router.get('/user/profile', (req, res)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
        })
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user: decoded
        })
        } catch (error) {
        res.status(403).json({
            success: false,
            message: "Invalid or expired token",
        })
    }
})

module.exports = router;
