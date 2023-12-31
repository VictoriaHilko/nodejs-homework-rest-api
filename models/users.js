const User = require('./userModel');

const jimp = require('jimp');
const fs = require('fs/promises');
const path = require('path');
const { UUID } = require('mongodb');



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

const updateAvatar = async (body, user, file) => {
  try {
    if (file) {
      const tmpPath = file.path;
      const extension = file.originalname.split('.').pop();
      const newFilename = `${user.id}-${new UUID()}.${extension}`;
      const avatarPath = path.join(__dirname, `../public/avatars/${newFilename}`);

      const image = await jimp.read(tmpPath);
      await image.resize(250, 250).write(avatarPath);

      await fs.unlink(tmpPath);

      user.avatarURL = `/avatars/${newFilename}`;
    }

    Object.keys(body).forEach((key) => {
      user[key] = body[key];
    });

    await user.save();
    return user;
  } catch (error) {
    console.error('Error in updateAvatar:', error.message);
    throw error;
  }
};


module.exports = {
  registerUser,
  loginUser,
  updateAvatar
};