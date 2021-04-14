const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Represents a Pencil Object
 */
const PencilAndLineObjectSchema = new Schema({
    type: String,
    x: Number,
    y: Number,
    v: Number,
    xp: Number,
    yp: Number,
    col: String,
    l: Number

});

/**
 * Represents a PencilArray Object wich persists of a Array of the PencilArrays
 */
const PencilArrayObjectSchema = new Schema({
    type: String,
    objArray: [PencilAndLineObjectSchema]
});

/**
 * Represents a Rectangle or a Circle Object
 */
const RectangleAndCircleObjectSchema = new Schema({
    type: String,
    x: Number,
    y: Number,
    v: Number,
    width: Number,
    height: Number,
    col: String,
    filled: Boolean,
    l: Number,
});

/**
 * Represents a Text Object
 */
 const TextObjectSchema = new Schema({
    type: String,
    x: Number,
    y: Number,
    str: String,
    size: Number,
    family: String,
    col: String,
    l: Number
});

/**
 * Represents a Image Object
 */
 const ImageObjectSchema = new Schema({
    type: String,
    src: String,
    x: Number,
    y: Number,
    l: Number
});

/**
 * Represents a AppDraw file
 */
const AppDrawFileSchema = new Schema({
    filename: String,
    drawObjects: [
        PencilAndLineObjectSchema, 
        PencilArrayObjectSchema, 
        RectangleAndCircleObjectSchema,
        TextObjectSchema,
        ImageObjectSchema
    ]
});

/**
 * Represents the overall AppDraw data structure
 */
const AppDrawDataSchema = new Schema({
    group: String,
    files: [AppDrawFileSchema]
});
const AppDrawFile = mongoose.model('appdrawfile', AppDrawFileSchema);
const AppDrawData = mongoose.model('appdrawdata', AppDrawDataSchema);

module.exports = AppDrawData, AppDrawFile;