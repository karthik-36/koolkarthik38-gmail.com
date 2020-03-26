const mongoose = require('mongoose');

var adminSchema = new mongoose.Schema({
  username : {
    type : String,
    required : " user name is required",
    unique : true
  },
  password : {
    type : String,
    required : "password is required"
  }
});

mongoose.model('admin' , adminSchema);
