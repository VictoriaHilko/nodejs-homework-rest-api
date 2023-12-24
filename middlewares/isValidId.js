const { isValidObjectId } = require("mongoose");

exports.isValidId = (req, res, next) => {
  const { contactId } = req.params;

  if (!isValidObjectId(contactId)) {
    return res.status(400).json({ message: 'Not a valid id' });
  }
  next();
};