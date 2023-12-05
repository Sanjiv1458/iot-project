import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  photo: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  bookings: [
    {
      paymentId: { type: String },
      slotId: { type: String, required: true, enum: ['1', '2', '3', '4', '5', '6'] },
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      amount: { type: Number, required: true },
      status: { type: String, enum: ["Booked", "Pending", "Expired", "Cancelled"], default: "Pending" }
    }
  ]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.methods.generateAccessToken = function () {
  const accessToken = jwt.sign({
    id: this._id,
    fname: this.fname,
    email: this.email,
  }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  return accessToken;
};

userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign({
    id: this._id
  }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return refreshToken;
};

const User = mongoose.model('User', userSchema);

export default User;
