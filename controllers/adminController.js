import Message from '../models/message.js';
import User from '../models/user.js';

class adminController {
  static homePage = async (req, res) => {
    res.render("admin-home", { error: null });
  }
  static getallUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.render("customers", users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  static getallMessages = async (req, res) => {
    try {
      const messages = await Message.find();
      res.render('messages', { user: req.user, messages: messages });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  static deleteMessages = async (req, res) => {
    try {
      await Message.findByIdAndRemove(req.params.id);
      res.redirect('/admin/messages');
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default adminController;
