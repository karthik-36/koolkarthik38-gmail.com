const mongoose = require('mongoose');

var employeeSchema = new mongoose.Schema({
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



mongoose.model('admin' , employeeSchema)
