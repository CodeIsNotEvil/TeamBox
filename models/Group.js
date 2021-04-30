const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        unique: [true, 'Name is already taken'],
        maxlength: [15, 'Maximum name length is 15 characters']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [8, 'Minimum password length is 8 characters']
    },
    users: [String],
    isActive: {
        type: Boolean,
    },
    isImported: {
        type: Boolean,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

groupSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

groupSchema.statics.login = async function (name, password) {
    const user = await this.findOne({ name });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect name');
}

const Group = mongoose.model('group', groupSchema);

module.exports = Group;