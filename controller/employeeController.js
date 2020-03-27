const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Employee = mongoose.model('Employee');
const Admin = mongoose.model('admin');

//test
router.get('/', (req,res) => {
  res.send('empty response')
});



//return full list
router.get('/listAll', (req,res) => {
Employee.find((err,docs) => {
  if(!err){
  console.log("complete doc shown to user");
  res.json(docs);
}else{
  res.send(err);
  console.log(err);
}
});
});


//list all approved users
router.get('/listApproved', (req,res) => {
  Employee.find({ 'approval': true }, function (err, docs) {
    if(!err){
    console.log("approved doc shown to user");
    res.json(docs);
  }else{
    res.send(err);
    console.log(err);
  }
  });
});


//list all unapproved users
router.get('/listUnapproved', (req,res) => {
  Employee.find({ 'approval': false }, function (err, docs) {
    if(!err){
    console.log("complete doc shown to user");
    res.json(docs);
  }else{
    res.send(err);
    console.log(err);
  }
  });
});



//delete record
router.get('/delete/:id', (req, res) => {
    Employee.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.send('record deleted');
        }
        else { console.log('Error in employee delete :' + err); }
    });
});


//insert new user / update existing user
router.post('/create', (req,res) => {
  if (req.body._id == null){
        console.log("inserting new record");
          insertRecord(req, res);
    } else{
      console.log("updating existing record");
       updateRecord(req, res);
     }
});

//check if admin username and password is correct
router.post('/check', (req, res) => {
  Admin.exists({ username: req.body.username , password : req.body.password}, function(err, result) {
     if (err) {
       console.log(err);
     } else {
        console.log("User does exist "  + result);
        const valid = { validity : result };
        res.json(valid);
     }
   });
});


router.post('/checkPhone', (req,res) => {
  Employee.exists({ phone : req.body.phone }, function(err, result) {
     if (err) {
       console.log(err);
     } else {
        console.log("Exist "  + result);
        const valid = { exists : result };
        res.json(valid);
     }
   });
});






function insertRecord(req,res){
 var employee = new Employee();
 employee.fullName = req.body.fullName;
 employee.office = req.body.office;
 employee.officeEmail = req.body.officeEmail;
 employee.eId = req.body.eId;
 employee.phone = req.body.phone;
 employee.approval = req.body.approval;
 employee.save((err,doc)=>{

   if(!err){
      console.log("New employee created");
      res.send('employee created \n' +  employee);
   }else{
        console.log('error during record insertion : ' + err);
        res.send('error during record insertion : ' + err);
   }
 });

};


function updateRecord(req, res) {
if(validateEmail(req.body.officeEmail)){
Employee.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
      if (!err) {
        res.send("record updated with  \n" + JSON.stringify(req.body));
    }
        else {
            if (err.name == 'ValidationError') {
              console.log("volidation error");
              res.send("validation error "+ err);
            }
            else{
                console.log('Error during record update : ' + err);
                  res.send('Error during record update : ' + err);
        }}
    });
  }else{
    res.send("invalid email");
    console.log("invalid email");
  }
}



function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}



module.exports = router;










//trash

/*
  UserModel.find({name : self.name}, function (err, docs) {
        if (!docs.length){
            next();
        }else{
            console.log('user exists: ',self.name);
            next(new Error("User exists!"));
        }
    });
*/

/*
Employee.exists({ phone: req.body.phone }, function(err, result) {
   if (err) {
     console.log(err);
   } else {
      console.log(result);
   }
 });
 */
