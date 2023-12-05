import express from 'express';
import paymentController from '../controllers/paymentController.js';
import isLoggedIn from '../middleware/isLoggedin.js';
const router = express.Router();

router.get('/get-key', isLoggedIn.isAuthenticated, paymentController.getKey);
router.post('/create-payment', isLoggedIn.isAuthenticated, paymentController.createPayment);
router.post('/verify-payment', isLoggedIn.isAuthenticated, paymentController.verifyPayment);
router.post('/payment-history', isLoggedIn.isAuthenticated, paymentController.getPaymentHistory);
router.get('/success', isLoggedIn.isAuthenticated, paymentController.successPayment);

export default router;