const { genSalt, hash } = require('bcrypt');
const { model, Schema } = require('mongoose');
const crypto = require('crypto');

const userSchema = new Schema({
    password: {
        type: String,
        required: [true, 'Set password for user'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    subscription: {
        type: String,
        enum: ["starter", "pro", "business"],
        default: "starter"
    },
    token: {
        type: String,
    },
    avatarURL: {
        type: String,
    },
    verify: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        required: [true, 'Verify token is required'],
    }
},
    { versionKey: false });

// Pre save hook. Fires on "save" and "create"
userSchema.pre('save', async function (next) {

    if (this.isNew) {
        const emailHash = crypto.createHash('md5').update(this.email).digest('hex');

        this.avatarURL = `https://www.gravatar.com/avatar/${emailHash}.jpg?d=robohash`;
    }

    if (!this.isModified('password')) return next();

    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);

    next();
});

const User = model('User', userSchema);

module.exports = User;