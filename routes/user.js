import express from 'express';
import userController from '../controllers/userController.js';
import isLoggedIn from '../middleware/isLoggedin.js';
import { upload } from '../middleware/multer.js';
const router = express.Router();


//Public users access routes
router.get('/', userController.homePage);
router.get('/about-us', userController.aboutUs);
router.get('/services', userController.services);
router.get('/contact-us', userController.contactPage);

//Authenticated users access routes
router.get('/user-data', isLoggedIn.isAuthenticated, userController.userData);
router.get('/profile', isLoggedIn.isAuthenticated, userController.getProfile);
router.get('/update-profile', upload.single('avatar'), isLoggedIn.isAuthenticated, userController.updatePage);
router.post('/update-profile', isLoggedIn.isAuthenticated, userController.updateProfile);
router.get('/delete-account', isLoggedIn.isAuthenticated, userController.deleteAccount);
router.get('/book-slot', isLoggedIn.isAuthenticated, userController.getBookpage);
router.get('/booking-history', isLoggedIn.isAuthenticated, userController.getallBookings);
router.post('/contact-us', userController.sendMessage);

export default router;
