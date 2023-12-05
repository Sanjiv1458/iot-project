import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: String, required: true },
  slotId: { type: Number, required: true, enum: [1, 2, 3, 4, 5, 6] },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['Booked', 'Available', 'Pending'], default: 'Available' },
  razorpay_payment_id: { type: String },
  amount: { type: Number },
  captured: { type: Boolean },
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
