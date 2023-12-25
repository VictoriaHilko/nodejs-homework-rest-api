const express = require('express');
const router = express.Router();

const joi = require('joi');
const { loginUser, registerUser } = require('../../models/users');
const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../../middlewares/verifyToken');
const { jwtSecret, jwtExpires } = require('../../configs/serverConfig');


const validateUserRegister = (user) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    subscription: joi.string(),
    token: joi.string()
  }).messages({
    "any.required": "Missing required {{#label}} field",
  });

  return schema.validate(user);
};

const validateUserLogin = (user) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    token: joi.string()
  }).messages({
    "any.required": "Missing required {{#label}} field",
    "string.email": "Invalid email format",
  });

  return schema.validate(user);
};

router.post('/register', async (req, res, next) => {
  try {
    const { email } = req.body;
    const { error } = validateUserRegister(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'Email in use' });
    }

    const newUser = await registerUser(req.body);
    
    const userWithoutSensitiveInfo = { ...newUser.toObject(), _id: undefined, password: undefined };

    const response = {
      user: userWithoutSensitiveInfo,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error } = validateUserLogin(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { email, password } = req.body;

    const user = await loginUser({ email });

    if (!user) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email or password is wrong' });
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

module.exports = router;
