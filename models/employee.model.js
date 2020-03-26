const mongoose = require('mongoose');

var employeeSchema = new mongoose.Schema({
  fullName : {
    type : String,
    required : " full name is required"
  },
  office : {
    type : String,
    required : " Office is required"
  },
  officeEmail : {
    type : String,
    required : " office email is required",
    unique: true
  },
  eId : {
    type : String,
      required : " employee id is required",
      unique: true
  },
  phone : {
    type : String,
      required : " phone number is required",
      unique: true
  },
  approval : {
    type : Boolean,
      required : " approval status is required"
  }

});

employeeSchema.path('officeEmail').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

mongoose.model('Employee' , employeeSchema)
