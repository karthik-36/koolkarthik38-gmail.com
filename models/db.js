const mongoose = require('mongoose')
require('dotenv').config();


let options = {
  tls: true,
  tlsCAFile: `/path/to/cert`,
  useUnifiedTopology: true
};
mongoose.connect(process.env.MONGOCREDS, options, {
  useNewUrlParser: true
}, (err) => {
  if (!err) {
    console.log("Connection to db successful");
  } else {
    console.log("DB error : " + err);
  }
});