import passport from "../config/passport.js";
import User from "../models/user.js";
import transporter from '../config/email.js';
import { uploadOnCloudinary } from '../config/cloudinary.js';

class AuthController {
  static dashboardPage = async (req, res) => {
    if (req.isAuthenticated()) {
      res.redirect("/home");
    } else {
      res.render("dashboard");
    }
  }

  static registerPage = async (req, res) => {
    res.render("sign-up", { error: null });
  }

  static loginPage = async (req, res) => {
    res.render("sign-in", { error: null });
  }

  static homePage = async (req, res) => {
    if (req.user && req.user.role === "admin") {
      res.render("admin-home", { user: req.user });
    } else if (req.user && req.user.role === "user") {
      res.render("user-home", { user: req.user });
    } else {
      res.redirect("/login");
    }
  }

  static registerUser = async (req, res) => {
    const { fname, lname, email, mobile, password, confirm_password } = req.body;
    let photoUrl = null;
    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      if (cloudinaryResponse && cloudinaryResponse.secure_url) {
        photoUrl = cloudinaryResponse.secure_url;
      }
    }
    const user = await User.findOne({ email: email });
    if (user) {
      res.render("sign-up", { error: "Email already in use" });
    } else {
      if (fname && lname && email && mobile && password && confirm_password) {
        if (password === confirm_password) {
          try {
            const newUser = new User({
              fname: fname, lname: lname, email: email, mobile: mobile, password: password, photo: photoUrl
            });
            await newUser.save();

            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email,
              subject: 'Registration Confirmation',
              text: 'Thank you for registering with My Car Parking System!'
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error(error.message);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });

            req.login(newUser, (error) => {
              if (error) {
                return next(error);
              } else {
                res.redirect("/home");
              }
            });
          } catch (error) {
            return res.render("sign-up", { error: error.message });
          }
        } else {
          res.render("sign-up", { error: "Password and Confirm Password don't match" });
        }
      } else {
        res.render("sign-up", { error: "All fields are required" });
      }
    }
  };

  static loginUser = async (req, res, next) => {
    try {
      passport.authenticate("local", async (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.render("sign-in", { error: info.message });
        }
        req.logIn(user, (error) => {
          if (error) {
            return next(error);
          }
          return res.redirect("/home");
        });
      })(req, res, next);
    } catch (error) {
      return res.render("sign-in", { error: error.message });
    }
  };

  static logoutUser = async (req, res, next) => {
    try {
      req.logout(() => {
        res.redirect("/");
      });
    } catch (error) {
      return next(error);
    }
  };

  static getUnauth = async (req, res) => {
    res.render('unauthorized');
  }
}

export default AuthController;
