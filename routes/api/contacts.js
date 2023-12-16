const express = require('express');
const router = express.Router();

const { listContacts, getContactById, addContact, removeContact, updateContact, updateStatusContact } = require('../../models/contacts');
const joi = require('joi');

// Валідація для POST та PUT запитів

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

router.get('/', async (req, res, next) => {
  try {
    const contacts = await listContacts();

    res.status(200).json(contacts);

  } catch (error) {
    res.status(404).json({ message: 'List Not found' });
    next(error);
  }
});

router.get('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const foundContact = await getContactById(contactId);

    if (foundContact) {
      res.status(200).json(foundContact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { error } = validateContact(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const newContact = await addContact(req.body);

    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const contactToDelete = await removeContact(contactId);

    if (contactToDelete) {
      res.status(200).json({ message: 'contact deleted' });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    next(error);
  }
});

router.put('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { name, email, phone, favorite } = req.body;

    const { error } = validateContact(req.body);

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Missing fields'});
    }

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const result = await updateContact(contactId, { name, email, phone, favorite });

    // res.status(200).json(result);

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({message: 'Not found'});
    }

  } catch (error) {
    next(error);
  }
});

router.patch('/:contactId/favorite', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { favorite } = req.body;

    // Перевірка наявності поля favorite в body
    if (favorite === undefined) {
      return res.status(400).json({ message: 'missing field favorite' });
    }

    // Виклик функції оновлення статусу контакту
    const updatedContact = await updateStatusContact(contactId, { favorite });

    // Перевірка, чи контакт знайдено та оновлено
    if (updatedContact) {
      res.status(200).json(updatedContact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(404).json({ message: 'List Not found' });
    next(error);
  }
});

module.exports = router;
