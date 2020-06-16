const mongoose = require('mongoose')
require('dotenv').config();
mongoose.connect(process.env.MONGOCRED, {
  useNewUrlParser: true
}, (err) => {
  if (!err) {
    console.log("Connection to db successful");
  } else {
    console.log("DB error : " + err);
  }
});