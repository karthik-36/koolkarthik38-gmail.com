const mongoose = require('mongoose');

var bidsSchema = new mongoose.Schema({
  buildingId : {
    type : String,
    required : " buildingId is required",
    unique : true
  },
  buildingName : {
    type : String,
    required : " building name is required",
  },
  idName : {
    type : String,
    required : " building name is required",
  }
});

mongoose.model('bids' , bidsSchema);
