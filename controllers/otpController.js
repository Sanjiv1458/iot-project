import User from "../models/user.js";

class otpController {
  static otpForm = async (req, res) => {
    res.render("otp", { error: null });
  };
  static processForm = async (req, res) => {
    const { otp } = req.body;
    const email = req.session.email;

    try {
      // Find the user in the database
      const user = await User.findOne({ email });
      if (!user) {
        req.flash("error", "An error occurred while processing your request");
        res.redirect("/register");
        return;
      }
      // Check if the OTP is correct
      if (otp != user.otp) {
        req.flash("error", "Invalid OTP");
        res.redirect("/otp");
        return;
      }

      // Update the user's status to "active"
      user.status = "active";
      user.otp = null;
      await user.save();

      // Store the user's details in the session
      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
      };

      // Redirect the user to the dashboard
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
      req.flash("error", "An error occurred while processing your request");
      res.redirect("/otp");
    }
  };
}

export default otpController;
