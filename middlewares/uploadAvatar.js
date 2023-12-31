const multer = require('multer');
const { diskStorage } = require('multer');
const { join } = require('path');
const uuid = require('uuid').v4;

const multerStorage = diskStorage({
    destination: (req, file, callback) => {
        callback(null, join(__dirname, '../tmp'));
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