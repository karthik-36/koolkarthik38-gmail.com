const mongoose = require('mongoose');


var calls = new mongoose.Schema({
  maxCalls: {
    type: Number,
    default: 7,
    required: " max calls required"
  },
  remainingCalls: {
    type: Number,
    default: 7,
    required: " remaining calls required "
  }
}, {
  _id: false
});


var buildingIdPair = new mongoose.Schema({
  name: {
    type: String,
    required: " building id is required"
  },
  localName: {
    type: String,
    required: " local Name is required , check if local name was added to buildindId"
  },
  type: {
    type: String,
    required: "Building ID type is required"
  }
}, {
  _id: false
});


var employeeSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: " full name is required"
  },
  locationId: {
    type: String,
    required: " locationId is required"
  },
  office: {
    type: String
  },
  calls: {
    type: calls
  },
  buildingId: {
    type: [buildingIdPair],
    required: " Building ID is required"
  },
  sites: {
    type: [String],
    required: "sites is required"
  },
  officeEmail: {
    type: String,
    required: " office email is required",
    unique: false
  },
  eId: {
    type: String,
    required: " employee id is required",
    unique: false
  },
  phone: {
    type: String,
    required: " phone number is required",
    unique: true
  },
  approval: {
    type: Boolean,
    required: " approval status is required"
  },
  terms: {
    type: Boolean,
    required: " terms status is required"
  },
  allowMessaging: {
    type: Boolean,
    required: "Messaging status is required"
  },
  permanent: {
    type: Boolean,
    default: true,
    required: " permanent/temporary status is required"
  },
  sessionId: {
    type: String,
    required: " SessionId is required"
  },
  buildingName: {
    type: String,
    required: "buildingName status is required"
  },
  archived: {
    type: Boolean,
    default: false,
    required: "Archived status is required"
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date
  }

});

employeeSchema.path('officeEmail').validate((val) => {
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(val);
}, 'Invalid e-mail.');

employeeSchema.index({
  buildingName: "text",
  fullName: "text"
});
mongoose.model('employees', employeeSchema);