const mongoose = require('mongoose');

var buildingSchema = new mongoose.Schema({
  buildingName : {
    type : String,
    unique : true,
    required : " full name is required"
  },
  locationType : {
    type : String,
    required : "Location Type is required"
  },
  buildingSites : {
    type : [] ,
    required : " sites required"
   }
});

mongoose.model('building' , buildingSchema);
