const mongoose = require('mongoose')
require('dotenv').config();

/*
let connectionString = process.env.MONGOCREDS;

let options = {
  tls: true,
  tlsCAFile: __dirname + "/certificate.txt",
  useUnifiedTopology: true,
  useNewUrlParser: true
};

console.log(__dirname);
// connects to a MongoDB database
mongoose.connect(connectionString, options, function(err, db) {
  if (err) {
    console.log(err);
  } else {
    // lists the databases that exist in the deployment
    console.log("success");
  }
});
*/

mongoose.connect(process.env.MONGOCRED, {
  useNewUrlParser: true
}, (err) => {
  if (!err) {
    console.log("Connection to db successful");
  } else {
    console.log("DB error : " + err);
  }
});