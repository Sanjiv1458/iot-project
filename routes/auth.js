import express from 'express';
import authController from '../controllers/authController.js';
import isLoggedIn from '../middleware/isLoggedin.js';
import { upload } from '../middleware/multer.js';
const router = express.Router();

// Render common home page to get start page
router.get('/', authController.dashboardPage);

// Render register page
router.get('/register', authController.registerPage);
// Handle user registration
router.post('/register', upload.single('avatar'), authController.registerUser);

router.get('/login', authController.loginPage);

router.post('/login', authController.loginUser);

router.get('/logout', isLoggedIn.isAuthenticated, authController.logoutUser);

router.get('/unAuth', authController.getUnauth);

router.get("/home", isLoggedIn.isAuthenticated, authController.homePage);

export default router;