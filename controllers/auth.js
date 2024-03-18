const initializeUserModel = require('../models/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const { name, email, password, provider,
    provider_id,
    is_new_coin_alert_enabled,
    is_increase_alert_enabled,
    is_decrease_alert_enabled,
    email_alert_status} = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        msg: "Provide all required fields",
      });
    }
    const User = await initializeUserModel();
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(401).json({
        status: false,
        msg: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      provider,
      provider_id,
    is_new_coin_alert_enabled,
    is_increase_alert_enabled,
    is_decrease_alert_enabled,
    email_alert_status
    });
    res.status(201).json({
      status: true,
      msg: "User registered successfully",
      newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      msg: error.message,
    });
  }


}




const loginUser = async (req, res) => {
  try {
    const { email,password } = req.body;
    if(!email,!password){
    return res.status(401).json({
        status:false,
        msg:"provide all credentials"
      })
    }
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
    const passwordvalid= await bcrypt.compare(password,user.password)
    if(!passwordvalid){
      return res.status(400).json({
        status:false,
        msg:"invalid Password"
      })
    }
    const response = {
      status: true,
      data: user.dataValues, 
      token: token, 
    };
    res.status(201).json({
      status:true,
      msg:response
    });
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
  registerUser
};
