const express = require('express');
const router = express.Router();

const { listContacts, getContactById, addContact, removeContact, updateContact, updateStatusContact } = require('../../models/contacts');
const joi = require('joi');
const { isValidId } = require('../../middlewares/isValidId');
const { verifyToken } = require('../../middlewares/verifyToken');
// const Contact = require('../../models/contactModel');

// Валідація для POST, PUT, PATCH запитів

const validateContact = (contact) => {
  const schema = joi.object({
    name: joi.string().min(3).required(),
    email: joi.string().email().required(),
    phone: joi.string().required(),
    favorite: joi.bool().default(false)
  }).messages({
    "any.required": "Missing required {{#label}} field",
  });

  return schema.validate(contact);
};

const validateFavorite = (favorite) => {
  const schema = joi.object({
    favorite: joi.bool().required(),
  }).messages({
    "any.required": "Missing required {{#label}} field",
  });

  return schema.validate({ favorite });
};

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    
    const contacts = await listContacts(owner);

    res.status(200).json(contacts);

  } catch (error) {
    res.status(404).json({ message: 'List Not found' });
    next(error);
  }
});

router.get('/:contactId', verifyToken, isValidId, async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { contactId } = req.params;

    const foundContact = await getContactById(contactId, owner);

    if (foundContact) {
      res.status(200).json(foundContact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { error } = validateContact(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const newContact = await addContact(req.body, owner);

    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete('/:contactId', verifyToken, isValidId, async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { contactId } = req.params;

    const contactToDelete = await removeContact(contactId, owner);

    if (contactToDelete) {
      res.status(200).json({ message: 'contact deleted' });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    next(error);
  }
});

router.put('/:contactId', verifyToken, isValidId, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { name, email, phone, favorite } = req.body;
    const { _id: owner } = req.user;

    const { error } = validateContact(req.body);

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Missing fields'});
    }

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const result = await updateContact(contactId, owner, { name, email, phone, favorite });
    

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({message: 'Not found'});
    }

  } catch (error) {
    next(error);
  }
});

router.patch('/:contactId/favorite', verifyToken, isValidId, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { favorite } = req.body;
    const { _id: owner } = req.user;

    const { error } = validateFavorite(favorite);

    // Перевірка наявності поля favorite в body
    if (favorite === undefined) {
      return res.status(400).json({ message: 'missing field favorite' });
    }

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Виклик функції оновлення статусу контакту
    const updatedContact = await updateStatusContact(contactId, owner, { favorite });

    // Перевірка, чи контакт знайдено та оновлено
    if (updatedContact) {
      res.status(200).json(updatedContact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
