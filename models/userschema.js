'use strict';

const mongoose = require('mongoose');

const DrugSchema = require('./drugschema');

const UserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  }
});

UserSchema.methods.newDrug = function(drugData){
  let drug = new DrugSchema(drugData);
  drug.userId = this._id;
  return drug.save();
};

module.exports = mongoose.model('User', UserSchema);
