const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Employee = mongoose.model('Employee');
router.get('/', (req,res) => {

  res.send('empty response')

});

router.post('/', (req,res) => {

  //res.send('user created');
//  console.log(req.body);
  insertRecord(req,res);

});

function insertRecord(req,res){
var employee = new Employee();
employee.fullName = req.body.fullName;
employee.office = req.body.office;
employee.officeEmail = req.body.officeEmail;
employee.eId = req.body.eId;
employee.phone = req.body.phone;
employee.approval = req.body.approval;
console.log("assigned");

 employee.save((err,doc)=>{

   if(!err){
     console.log("NO errors ");
     res.send('employee created \n' +  employee);
   }else{
     console.log('error during record insertion : ' + err);
        res.send('error during record insertion : ' + err);
   }
 });

}


module.exports = router;
