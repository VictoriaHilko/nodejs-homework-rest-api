const { genSalt, hash } = require('bcrypt');
const { model, Schema } = require('mongoose');

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

},
    { versionKey: false });

// Pre save hook. Fires on "save" and "create"
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);

    next();
});

const User = model('User', userSchema);

module.exports = User;