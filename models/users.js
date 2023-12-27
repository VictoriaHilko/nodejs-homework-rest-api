const User = require('./userModel');


const registerUser = async (body) => {
  try { 
    const newUser = await User.create(body);

    return newUser;
  } catch (error) {
    console.error('Error in addContact:', error.message);
    throw error;
  }
};

const loginUser = async (body) => {
  try {
    const { email } = body;
    const existingUser = await User.findOne({ email });

    return existingUser;
  } catch (error) {
    console.error('Error in loginUser:', error.message);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
};
