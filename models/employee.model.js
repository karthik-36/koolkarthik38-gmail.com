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
    required : " office email is required"
  },
  eId : {
    type : String,
      required : " employee id is required"
  },
  phone : {
    type : String,
      required : " phone number is required"
  },
  approval : {
    type : Boolean,
      required : " approval status is required"
  }

});

mongoose.model('Employee' , employeeSchema)
