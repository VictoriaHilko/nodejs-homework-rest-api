const express = require('express');
const router = express.Router();

const joi = require('joi');
const { registerUser, updateAvatar } = require('../../models/users');
const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../../middlewares/verifyToken');
const { jwtSecret } = require('../../configs/serverConfig');
const { uploadAvatar } = require('../../middlewares/uploadAvatar');

const { UUID } = require('mongodb');

const { sendgridToken } = require('../../configs/serverConfig');
const sgMail = require('@sendgrid/mail');



const validateUserRegister = (user) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    subscription: joi.string(),
  }).messages({
    "any.required": "Missing required {{#label}} field",
  });

  return schema.validate(user);
};

const validateUserLogin = (user) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }).messages({
    "any.required": "Missing required {{#label}} field",
    "string.email": "Invalid email format",
  });

  return schema.validate(user);
};

const validateResendVerificationRequest = (user) => {
  const schema = joi.object({
    email: joi.string().email().required(),
  }).messages({
    "any.required": "Missing required {{#label}} field",
    "string.email": "Invalid email format",
  });

  return schema.validate(user);
};

sgMail.setApiKey(sendgridToken);

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationLink = `http://localhost:3000/api/users/verify/${verificationToken}`;

  const msg = {
    to: email,
    from: 'svictoria951@gmail.com',
    subject: 'Verify Your Email',
    text: `Click the following link to verify your email: ${verificationLink}`,
    html: `<p>Click the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
  };

  try {
    const result = await sgMail.send(msg);
    console.log('SendGrid Response:', result);
  } catch (error) {
    console.error('SendGrid Error:', error.response ? error.response.body : error.message);
  }

  await sgMail.send(msg);
};

const generateVerificationToken = () => {
  return new UUID();
};

router.post('/register', async (req, res, next) => {
  try {
    const { email } = req.body;
    const { error } = validateUserRegister(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'Email in use' });
    }

    const verificationToken = generateVerificationToken();

    const newUser = await registerUser({ ...req.body, verificationToken });

    const userWithoutSensitiveInfo = { ...newUser.toObject(), _id: undefined, password: undefined };

    await sendVerificationEmail(email, verificationToken);

    const response = {
      user: userWithoutSensitiveInfo,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
    console.log(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error } = validateUserLogin(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email, verify: true });

    if (!user) {
      return res.status(401).json({ message: 'Email or password is wrong or email is not verified' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email or password is wrong or email is not verified' });
    }

    const token = jwt.sign({ userId: user._id.toString() }, jwtSecret, { expiresIn: '1h' });

    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});


router.post('/logout', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    user.tokens = user.tokens || [];

    user.tokens = user.tokens.filter((token) => token.token !== req.token);

    await User.findByIdAndUpdate(userId, { token: "" });
    await user.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/current', verifyToken, async (req, res, next) => {
  try {
    const { _id } = req.user;

    const user = await User.findById({ _id });

    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });

  } catch (error) {
    next(error);
  }
});


router.patch('/avatars', verifyToken, uploadAvatar, async (req, res, next) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided for avatar update' });
    }

    const updatedUser = await updateAvatar(req.body, req.user, req.file);

    res.status(200).json({
      avatarURL: updatedUser.avatarURL,
    });
  } catch (error) {
    console.error('Error in /avatars PATCH:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }

});

router.get('/verify/:verificationToken', async (req, res) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    console.log('User verified:', user);

    return res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/verify', async (req, res) => {
  const { email } = req.body;

  // Validate the request body
  const { error } = validateResendVerificationRequest(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
 
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.verify) {
      return res.status(400).json({ message: 'Verification has already been passed' });
    }

    await sendVerificationEmail(user.email, user.verificationToken);

    return res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;
