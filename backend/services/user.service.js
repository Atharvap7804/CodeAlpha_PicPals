const userModel= require('../models/User');


module.exports.createUser = async ({
  firstName,
  lastName,
  username,
  email,
  password
}) => {
  if(!firstName || !lastName || !username || !email || !password) {
    throw new Error('All fields are required');
  }
  
  const user= new userModel({
    firstName,
    lastName,
    username,
    email,
    password
  });

  await user.save();
  console.log('User created:', user);
  return user
}