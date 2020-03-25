const mongoose = require('mongoose');

var employeeSchema = new mongoose.Schema({
  fullName : {
    type : String
  },
  email : {
    type : String
  },
  Eid : {
    type : String
  },
  approval : {
    type : Boolean
  },
  phone : {
    type : String
  }

});

mongoose.model('Employee' , employeeSchema)
