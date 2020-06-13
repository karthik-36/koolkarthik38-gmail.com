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
  },
  buildingType : {
    type : String,
    enum: ['LCE', 'GG'],
    default: 'LCE',
    required : " building type is required ",
  }
});

mongoose.model('bids' , bidsSchema);
