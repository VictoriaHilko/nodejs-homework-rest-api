const Contact = require('./contactModel');


const listContacts = async (ownerId) => {
  try {
    const contacts = await Contact.find({ owner: ownerId });

    console.log(Contact);

    return contacts;
  } catch (error) {
    console.error('Error reading contacts.json:');
    throw error;
  }
};

const getContactById = async (contactId, owner) => {
  try {
    const foundContact = await Contact.findById({ _id: contactId, owner });

    return foundContact || null;
  } catch (error) {
    console.error('Error in getContactById:', error.message);
    throw error;
  }
};

const removeContact = async (contactId, owner) => {
  try {
    const removedContact = await Contact.findByIdAndDelete({ _id: contactId, owner });

    return removedContact || null;
  } catch (error) {
  }
}

const addContact = async (body, owner) => {
  try {
    const newContact = await Contact.create({...body, owner});

    return newContact;
  } catch (error) {
    console.error('Error in addContact:', error.message);
    throw error;
  }
};

const updateContact = async (contactId, owner, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate({ _id: contactId, owner }, body, {new: true});

    return updatedContact || null;

  } catch (error) {
    console.error('Error in updateContact:', error.message);
    throw error;
  }
};

const updateStatusContact = async (contactId, owner, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate({ _id: contactId, owner }, { favorite: body.favorite }, {new: true});

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
