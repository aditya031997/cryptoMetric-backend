
const initializeUserModel= require('../models/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

 loginUser = async (req, res) => {
  try {
    const { email } = req.body;
    const User = await initializeUserModel();
    const user = await User.findOne({ where: { email } });
     if (!user) {
      return res.status(401).json({ status: false, msg: 'Invalid Email' });
    }
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   return res.status(401).json({ status: false, msg: 'Invalid Password' });
    // }
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
    
    });
   res.json({ status: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      msg:error,
    });
  }
};

module.exports = 
  loginUser
  
