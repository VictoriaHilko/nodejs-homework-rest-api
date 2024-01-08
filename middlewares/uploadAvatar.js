const multer = require('multer');
const { diskStorage } = require('multer');
const { join } = require('path');
const fs = require('fs').promises;
const uuid = require('uuid').v4;

const tmpDirectory = join(__dirname, '../tmp');

fs.mkdir(tmpDirectory, { recursive: true })
    .catch(error => console.error('Error creating tmp directory:', error));


const multerStorage = diskStorage({
    destination: (req, file, callback) => {
        callback(null, tmpDirectory);
    },
    filename: (req, file, callback) => {
        const extension = file.mimetype.split('/')[1];
        callback(null, `${req.user.id}-${uuid()}.${extension}`);
    },
});

const multerFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
        callback(null, true);
    } else {
        callback(new Error('Uplouad images only'), false);
    }
};

exports.uploadAvatar = multer({
    storage: multerStorage,
    fileFilter: multerFilter,

    limits: {
        fileSize: 2 * 1024 * 1024,
    }
}).single('avatar');