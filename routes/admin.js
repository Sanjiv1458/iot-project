import express from 'express';
import adminController from '../controllers/adminController.js';
import isLoggedIn from '../middleware/isLoggedin.js';
const router = express.Router();


router.get('/', isLoggedIn.isAuthenticated, adminController.homePage);
router.get('/customers', isLoggedIn.isAuthenticated, adminController.getallUsers);
router.get('/messages', isLoggedIn.isAuthenticated, adminController.getallMessages);
router.post('/messages/:id', isLoggedIn.isAuthenticated, adminController.deleteMessages);

export default router;