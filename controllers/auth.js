const initializeUserModel = require('../models/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
  try {
    const { email } = req.body;
    const User = await initializeUserModel();
    const user = await User.findOne({ where: { email } });
    console.log('User', user);
    if (!user) {
      return res.status(401).json({ status: false, msg: 'Invalid Email' });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      {},
    );
    const response = {
      status: true,
      data: user.dataValues, 
      token: token, 
    };
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      msg: error,
    });
  }
};

const updateUserSocketId = async (userId, socketId, res) => {
  try {
    const User = await initializeUserModel();
    const user = await User.findOne({ where: { id: userId } });

    if (user) {
      user.socketId = socketId;
      await user.save();
      return { success: true };
    } else {
      return { success: false, message: 'User not available' }; 
    }
  } catch (error) {
    console.error('Error checking user availability:', error);
    return { success: false, message: 'Internal server error' };
  }
};

module.exports = {
  loginUser,
  updateUserSocketId,
};
