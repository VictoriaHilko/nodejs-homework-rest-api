const Contact = require('./contactModel');


const listContacts = async () => {
  try {
    const contacts = await Contact.find();

    console.log(Contact)

    return contacts;
  } catch (error) {
    console.error('Error reading contacts.json:');
    throw error;
  }
};

const getContactById = async (contactId) => {
  try {
    const foundContact = await Contact.findById(contactId);

    return foundContact || null;
  } catch (error) {
    console.error('Error in getContactById:', error.message);
    throw error;
  }
};

const removeContact = async (contactId) => {
  try {
    const removedContact = await Contact.findByIdAndDelete(contactId);

    return removedContact || null;
  } catch (error) {
  }
}

const addContact = async (body) => {
  try {
    const newContact = await Contact.create(body);

    return newContact;
  } catch (error) {
    console.error('Error in addContact:', error.message);
    throw error;
  }
};

const updateContact = async (contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {new: true});

    return updatedContact || null;

  } catch (error) {
    console.error('Error in updateContact:', error.message);
    throw error;
  }
};

const updateStatusContact = async (contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, { favorite: body.favorite }, {new: true});

    return updatedContact;

  } catch (error) {
    console.error('Error in updateStatusContact:', error.message);
    throw error;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact
};
