const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        unique: [true, 'Name is already taken'],
        maxlength: [15, 'Maximum name length is 15 characters']
    },
    users: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Group = mongoose.model('group', groupSchema);

module.exports = Group;