import Booking from "../models/booking.js";
import crypto from 'crypto';
import Razorpay from "razorpay";
import dotenv from 'dotenv'
import transporter from '../config/email.js';
dotenv.config()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
  headers: {
    "X-Razorpay-Account": process.env.RAZORPAY_ACCOUNT,
  }
});

class paymentController {
  static getKey = async (req, res) => {
    try {
      const key_id = process.env.RAZORPAY_KEY_ID;
      res.json({ key: key_id });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };

  static createPayment = async (req, res) => {
    try {
      const userId = req.user.id;
      const { amount, carId, slotId, startTime, endTime } = req.body;
      const options = {
        amount: amount,
        currency: 'INR',
        notes: {
          userId: userId,
          carId: carId,
          slotId: slotId,
          startTime: startTime,
          endTime: endTime,
        },
      };

      const order = await razorpay.orders.create(options);

      const newBooking = new Booking({
        user: userId,
        carId: carId,
        slotId: slotId,
        startTime: startTime,
        endTime: endTime,
        status: 'Pending',
      });

      await newBooking.save();

      res.json(order);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };

  static verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        const booking = await Booking.findOneAndUpdate(
          { carId: payment.notes.carId, status: 'Pending' },
          {
            $set: {
              slotId: payment.notes.slotId,
              status: payment.captured ? 'Booked' : 'Failed',
              razorpay_payment_id: payment.id,
              amount: payment.amount,
              captured: payment.captured,
            },
          },
          { new: true }
        );

        if (!booking) {
          console.error('Booking not found or payment already processed');
          return res.status(400).send('Booking not found or payment already processed');
        }
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: req.user.email,
          subject: 'Payment Confirmation',
          text: `Thank you for your payment. Your booking is confirmed.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error.message);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        res.render('confirmation', { booking: booking, user: req.user });
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      return res.status(400).send('Webhook Signature Verification Failed');
    }
  };


  static getPaymentHistory = async (req, res) => {
    try {
      const paymentHistory = await Booking.find({ user: req.user._id });
      res.render("booking-history", { error: null, paymentHistory });
    } catch (error) {
      console.error(error);
      res.render("booking-history", { error: "Error fetching payment history", paymentHistory: null });
    }
  }

  static successPayment = async (req, res) => {
    try {
      const booking = await Booking.findOne({ user: req.user._id }).sort({ startTime: -1 });
      res.render("success", { user: req.user, booking });
    } catch (error) {
      console.error(error);
      res.render("success", { user: req.user, booking: null });
    }
  }
}

export default paymentController;
