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
  buildingId : {
    type : [String],
    required : " Building ID is required"
  },
  sites :{
    type : [String],
    required : "sites is required"
  },
  officeEmail : {
    type : String,
    required : " office email is required",
    unique: false
  },
  eId : {
    type : String,
      required : " employee id is required",
      unique: false
  },
  phone : {
    type : String,
      required : " phone number is required",
      unique: true
  },
  approval : {
    type : Boolean,
    required : " approval status is required"
  },
  terms : {
    type : Boolean,
    required : " terms status is required"
  },
  allowMessaging : {
    type : Boolean,
    required : "Messaging status is required"
  },
  permanent : {
    type : Boolean,
    default : true,
    required : " permanent/temporary status is required"
  },
  buildingName : {
    type : String,
    required : "buildingName status is required"
  },

});

employeeSchema.path('officeEmail').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

employeeSchema.index({ buildingName : "text" , fullName : "text"});
mongoose.model('employees' , employeeSchema);
//mongoose.model('employees' , employeeSchema);
