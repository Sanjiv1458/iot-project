import User from "../models/user.js";
import Booking from "../models/booking.js";
import upload from '../config/upload.js';
import Message from "../models/message.js";

class userController {
  static homePage = async (req, res) => {
    res.render("user-home", { error: null });
  }
  static aboutUs = async (req, res) => {
    res.render("about-us", { error: null });
  }
  static services = async (req, res) => {
    res.render("services", { error: null });
  }
  static contactPage = async (req, res) => {
    res.render("contact-us", { error: null });
  }
  static getBookpage = async (req, res) => {
    res.render("book-slot", { error: null });
  }
  static getProfile = async (req, res) => {
    try {
      res.render("profile", { user: req.user });
    } catch (err) {
      console.log(err);
      res.render("profile", { error: err });
    }
  }
  static userData = async (req, res) => {
    try {
      res.json({ user: req.user });
    } catch (err) {
      console.log(err);
      res.render("profile", { error: err });
    }
  }
  static updatePage = async (req, res) => {
    res.render("update-profile", { error: null });
  }
  static deleteAccount = async (req, res) => {
    try {
      await User.findByIdAndRemove(req.params.id);
      req.logout();
      res.redirect("/");
    } catch (err) {
      res.redirect("/");
    }
  }
  static sendMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
      const messages = new Message({
        name: name,
        email: email,
        subject: subject,
        message: message
      });
      await messages.save();
      res.redirect('/');
    } catch (err) {
      console.log(err.message);
      res.redirect('/');
    }
  }
  static updateProfile = async (req, res) => {
    upload.single('avatar')(req, res, async function (err) {
      if (err) {
        return res.render("update-profile", { error: err.message });
      } else {
        const { fname, lname, email, mobile, password, confirm_password } = req.body;
        let photo;
        if (req.file) {
          photo = req.file.filename;
        } else {
          photo = req.user.photo;
        }
        if (password === confirm_password) {
          try {
            const updatedData = { fname: fname, lname: lname, email: email, mobile: mobile, password: password, photo: photo };
            const user = await User.findOne({ email: email });
            if (!user) {
              res.render("update-profile", { error: "Email already in used" });
            } else {
              const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });
              res.render("profile", { user: updatedUser });
            }
          } catch (error) {
            return res.render("update-profile", { error: error.message });
          }
        } else {
          res.render("update-profile", { error: "Password and Confirm Password doesn't match" })
        }
      }
    });
  }
  static getallBookings = async (req, res) => {
    try {
      const userId = req.user.id;
      const bookings = await Booking.find({ user: userId });
      res.render("booking-history", { bookings: bookings, user: req.user });
    } catch (err) {
      console.error(err);
      res.render("booking-history", { error: err.message, user: req.user });
    }
  };

  static slotBook = async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $push: { bookings: req.body } },
        { new: true }
      );
      const latestBooking = user.bookings[user.bookings.length - 1];
      res.render("confirmation", { user: user, booking: latestBooking });
    } catch (err) {
      console.log(err);
      res.render("book-slot", { error: err });
    }
  }
}

export default userController;