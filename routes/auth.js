import express from 'express';
import authController from '../controllers/authController.js';
import isLoggedIn from '../middleware/isLoggedin.js';
const router = express.Router();

// Render common home page to get start page
router.get('/', authController.dashboardPage);

// Render register page
router.get('/register', authController.registerPage);
// Handle user registration
router.post('/register', authController.registerUser);

// Render login page
router.get('/login', authController.loginPage);
// Handle user login
router.post('/login', authController.loginUser);

// Handle user logout
router.get('/logout', isLoggedIn.isAuthenticated, authController.logoutUser);

// Handle user logout
router.get('/unAuth', authController.getUnauth);

// User Defined Rendering dashboard page
router.get("/home", isLoggedIn.isAuthenticated, authController.homePage);

export default router;