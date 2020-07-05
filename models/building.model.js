const mongoose = require('mongoose');

var buildingSchema = new mongoose.Schema({
  buildingName: {
    type: String,
    unique: true,
    required: " full name is required"
  },
  originalName: {
    type: String,
    required: " name is required"
  },
  locationType: {
    type: String,
    enum: ['office', 'residential'],
    default: 'office',
    required: "Location Type is required"
  },
  countryCode: {
    type: String,
    required: "country code is required"
  },
  country: {
    type: String,
    required: "country is required"
  },
  city: {
    type: String,
    required: "city is required"
  },
  postalCode: {
    type: String,
    required: "postalCode is required"
  },
  locationId: {
    type: String,
    required: " locationId is required"
  },
  buildingSites: {
    type: [],
    required: " sites required"
  }
});

buildingSchema.index({
  buildingName: "text",
  buildingSites: "text"
});
mongoose.model('buildings', buildingSchema);