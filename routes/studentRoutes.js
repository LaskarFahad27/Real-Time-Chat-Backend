const express = require('express');
const { getAllStudents, getStudentByID, createStudent, studentLogin, getCurrentUser } = require('../controllers/studentController');
const { isAuthenticated, authenticateJWT } = require('../middleware/auth');

const router = express.Router();

//routes

//GET all students || GET - Protected route with JWT
router.get('/', authenticateJWT, getAllStudents);

//GET student by id || GET - Protected route with JWT
router.get('/:id', authenticateJWT, getStudentByID);

//CREATE student || POST
router.post('/',createStudent);

//Login with name and email
router.post('/login', studentLogin);

//Get current user profile - Protected route with JWT
router.get('/profile', authenticateJWT, getCurrentUser);

//logged in user info - Protected route with JWT
router.get('/dashboard', authenticateJWT, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Dashboard accessed successfully",
        user: req.user
    });
});

// Check JWT authentication status
router.get('/auth/status', authenticateJWT, (req, res) => {
    res.status(200).json({
        success: true,
        isAuthenticated: true,
        user: req.user
    });
});

module.exports = router;