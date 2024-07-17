const initializeUserModel = require('../models/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const { where, Sequelize } = require('sequelize');

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      provider,
      provider_id,
      is_new_coin_alert_enabled,
      is_increase_alert_enabled,
      is_decrease_alert_enabled,
      email_alert_status,
    } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        msg: 'Provide all required fields',
      });
    }
    const User = await initializeUserModel();
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(401).json({
        status: false,
        msg: 'User already exists',
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
      email_alert_status,
    });
    res.status(200).json({
      status: true,
      msg: 'User registered successfully',
      newUser,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(401).json({
        status: false,
        msg: 'Please provide email',
      });
    }
    const User = await initializeUserModel();
    const user = await User.findOne({ where: { email } });
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
    res.status(200).json({
      status: true,
      msg: 'Login successful',
      data: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      msg: error,
    });
  }
};

const getUser=async(req,res)=>{
 try {
const Users= await initializeUserModel() 
 const allUsers= await Users.findAll()
res.status(200).json({
  status:true,
  msg:"All Users Data",
  data:allUsers
})
 } catch (error) {
  console.log(error)
  res.status(500).json({status:true,
  msg:error})
 }
}

const getUsersBy=async(req,res)=>{
const id=req.params.id
try {
const Users=await initializeUserModel()    
const user = await Users.findOne({ where:{id:id}})
console.log("DATA Get By Id Sucessfull")
res.status(200).json({
staus:true,
msg:"Data Get Successfully",user
})
} catch (error) {
console.log(error)
res.satus(500).json({
status:false,
msg:error
})}}


module.exports = {
  loginUser,
  registerUser,
  getUser,
  getUsersBy,
  
};
