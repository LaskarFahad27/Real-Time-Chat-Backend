const express = require('express');
const { getAllStudents, getStudentByID, createStudent, studentLogin, getCurrentUser, storeMessage, getMessages, getId } = require('../controllers/studentController');
const { isAuthenticated, authenticateJWT } = require('../middleware/auth');

const router = express.Router();

//routes

//GET all students || GET - Protected route with JWT
router.get('/', authenticateJWT, getAllStudents);

//Store Message
router.post('/messages', authenticateJWT, storeMessage);

//Get Messages
router.get('/messages', authenticateJWT, getMessages);

//Get ID of Google logged in user
router.get('/getId', authenticateJWT, getId);

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

//GET student by id || GET - Protected route with JWT
router.get('/:id', authenticateJWT, getStudentByID);

//CREATE student || POST
router.post('/',createStudent);

//Login with name and email
router.post('/login', studentLogin);

// Check JWT authentication status
router.get('/auth/status', authenticateJWT, (req, res) => {
    res.status(200).json({
        success: true,
        isAuthenticated: true,
        user: req.user
    });
});

module.exports = router;