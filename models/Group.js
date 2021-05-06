const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./User');

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
    users: {
        type: [User.schema]
    },
    isActive: {
        type: Boolean,
    },
    isImported: {
        type: Boolean,
    },
    usbPath: {
        type: String,
        required: [true, 'Group Path is missing'],
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
    const group = await this.findOne({ name });
    if (group) {
        const auth = await bcrypt.compare(password, group.password);
        if (auth) {
            return group;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect name');
}

const Group = mongoose.model('group', groupSchema);

module.exports = Group;