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
  },
  locationId : {
    type : String,
    required : "locationId is required"
  },
  locationType : {
    type : String,
    required : "locationType is required"
  },
  locationName :  {
    type : String,
    required : "locationName is required"
  },
  serviceList : {
    type :[String],
    required : "serviceList is required"
  }


});

mongoose.model('admin' , adminSchema);
