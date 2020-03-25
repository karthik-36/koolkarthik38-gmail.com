const mongoose = require('mongoose')

mongoose.connect('mongodb://karthik:musicSHIRT36@ds249092.mlab.com:49092/social-elevator' , {useNewUrlParser : true}, (err) => {
  if(!err){
    console.log("Connection to db successful");
  }else{
    console.log("DB error : " + err);
  }
});
