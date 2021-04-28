const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
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
    email: {
        type: String,
        unique: [true, 'Email is already taken'],
        validate: [isEmail, 'Please enter a valid email']
    },
    color: {
        type: String,
        unique: [true, 'Color already assinged'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// fire a function before doc saved to db
// do not use a arrow functon it will prevent the this to work
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// static method to login users
userSchema.statics.login = async function (name, password) {
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

const User = mongoose.model('user', userSchema);

module.exports = User;