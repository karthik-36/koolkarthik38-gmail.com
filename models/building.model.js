const mongoose = require('mongoose');

var buildingSchema = new mongoose.Schema({
  buildingName : {
    type : String,
    unique : true,
    required : " full name is required"
  },
  locationType : {
    type : String,
    enum: ['office', 'residential'],
    default: 'office',
    required : "Location Type is required"
  },
  countryCode : {
    type : String,
    required : "country code is required"
  },
  buildingSites : {
    type : [] ,
    required : " sites required"
   }
});

buildingSchema.index({ buildingName : "text" , buildingSites : "text"});
mongoose.model('buildings' , buildingSchema);
