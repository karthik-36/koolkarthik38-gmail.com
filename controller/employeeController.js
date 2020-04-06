const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Employee = mongoose.model('Employee');
const Admin = mongoose.model('admin');
const Buildingsite = mongoose.model('building');
//test






router.post('/addSite/:name', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
   Buildingsite.find({ 'buildingName': req.params.name },(err,docs) => {


    if(!err){
      if(docs.length == 0){
        console.log("doc is null");
        res.send("building not found");
      }else{
        // kosmo one exists
        var siteExists = false;
          siteArr = [];
          for(var i = 0 ; i< docs[0].buildingSites.length ; i++){
            console.log(docs[0].buildingSites[i].Site[0].siteName);
            siteArr = siteArr.concat(docs[0].buildingSites[i].Site[0].siteName);
            }

            console.log(siteArr);

            if(siteArr.includes(req.body.Site[0].siteName)){
              siteExists = true;
            }

          if(siteExists){
        //    res.send("this site already exists  , updating existing site");
            console.log("this site already exists , updating existing site");
            var newBuildingID = new Set();
            var newOfficeName = new Set();
            var index;
            newBuildingID = req.body.Site[1].buildingId;
            newOfficeName = req.body.Site[2].OfficeNames;

            console.log("new building ids " + newBuildingID  );
            console.log("new office name " + newOfficeName);

            var earr;
            for(var i = 0 ; i< docs[0].buildingSites.length ; i++){
                if(docs[0].buildingSites[i].Site[0].siteName == req.body.Site[0].siteName){
                  index = i;
                  earr = docs[0].buildingSites[i];
                  break;
                }
              }


              console.log("earr  " + JSON.stringify(earr));
              console.log("index is " + i);


              console.log("after concating");
            //  console.log(earr.Site[1].buildingId);
              earr.Site[1].buildingId = earr.Site[1].buildingId.concat(newBuildingID);
              earr.Site[2].OfficeNames = earr.Site[2].OfficeNames.concat(newOfficeName);
              console.log("earr  " + JSON.stringify(earr));

              //////// Replacement commeth
                var arr = [];
                arr = docs[0].buildingSites;
                console.log(" \n object before pushing body \n");
                console.log(docs[0].buildingSites);
                console.log(" \n arr before pushing body \n");
                console.log(arr);
                arr[index] = earr;
                console.log(" \n arr after pushing body \n");
                console.log(arr);
                docs[0].buildingSites = arr;
                console.log("\n docs after pushing body \n");
                console.log(docs[0]);
                newDoc = docs[0];
                console.log("\n doc ID is \n");
                console.log(docs[0].id)
                addSite( docs[0]._id , newDoc , res);




          }
          else {

          var bidArr = [];
          var flag = true;
          for(var i = 0 ; i< docs[0].buildingSites.length ; i++){
              console.log(docs[0].buildingSites[i].Site[1].buildingId);
              bidArr = bidArr.concat(docs[0].buildingSites[i].Site[1].buildingId);
            }

            console.log("All buildingIDs" +  bidArr);

            for(var i = 0 ; i < req.body.Site[1].buildingId.length ; i++){
              if(bidArr.includes(req.body.Site[1].buildingId[i])){
                flag = false;
                break;
              }
            }

            if(flag){
              var arr = [];
              arr = docs[0].buildingSites;
              console.log(" \n object before pushing body \n");
              console.log(docs[0].buildingSites);
              console.log(" \n arr before pushing body \n");
              console.log(arr);
              arr.push(req.body);
              console.log(" \n arr after pushing body \n");
              console.log(arr);
              docs[0].buildingSites = arr;
              console.log("\n docs after pushing body \n");
              console.log(docs[0]);
              newDoc = docs[0];
              console.log("\n doc ID is \n");
              console.log(docs[0].id)
              addSite( docs[0]._id , newDoc , res);
            }{
              res.send("Building ID already exists in a different building or site, Enter unique ID or contact KONE ");
        }
      }

    }

  }else{
    res.send(err);
    console.log(err);
  }
  });
});


router.get('/', (req,res) => {
  res.send('empty response')
});

router.post('/listEmployeeSite', (req,res) => {
    res.set('Access-Control-Allow-Headers', '*');

  Employee.find({ 'sites': req.body.site }, function (err, docs) {
    if(!err){
    console.log("site -> employee shown to user");
    res.json(docs);
  }else{
    res.send(err);
    console.log(err);
  }
  });
});


router.post('/Office', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
  //console.log(req.body.officeName);
  var officeName = req.body.officeName;
   Buildingsite.find((err,docs) => {
    if(!err){
    console.log("complete doc shown to user");
//    var obj = JSON.parse(docs);
//    console.log(obj.buildingName);
 var arr = [];
 for(var i = 0 ; i< docs[0].buildingSites.length ; i++){

     for(var s = 0 ; s< docs[0].buildingSites[i].Site[2].OfficeNames.length ; s++){
     if(docs[0].buildingSites[i].Site[2].OfficeNames[s] == officeName){
       var obj = {
                 Office_SiteAccess : docs[0].buildingSites[i].Site[0].siteName,
                 Office_BuildingAccess : docs[0].buildingSites[i].Site[1].buildingId
                }
       arr.push(obj);
     }
     }
  }
  res.json(arr);
  }else{
    res.send(err);
    console.log(err);
  }
  });
});


router.get('/listOfficeId', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
   Buildingsite.find((err,docs) => {
    if(!err){
    console.log("complete doc shown to user");
//    var obj = JSON.parse(docs);
//    console.log(obj.buildingName);
 var arr = [];
 for(var i = 0 ; i< docs[0].buildingSites.length ; i++){

     for(var s = 0 ; s< docs[0].buildingSites[i].Site[2].OfficeNames.length ; s++){
       var obj = {
                 OfficeName : docs[0].buildingSites[i].Site[2].OfficeNames[s],
                 Office_SiteAccess : docs[0].buildingSites[i].Site[0].siteName,
                 Office_BuildingAccess : docs[0].buildingSites[i].Site[1].buildingId
                }
       arr.push(obj);
     }
  }
  res.json(arr);
  }else{
    res.send(err);
    console.log(err);
  }
  });
});


router.get('/listBuildingId', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
   Buildingsite.find((err,docs) => {
    if(!err){
    console.log("complete doc shown to user");
//    var obj = JSON.parse(docs);
//    console.log(obj.buildingName);
 var arr = [];
 for(var i = 0 ; i< docs[0].buildingSites.length ; i++){
     console.log(docs[0].buildingSites[i].Site[1].buildingId);
     arr = arr.concat(docs[0].buildingSites[i].Site[1].buildingId);
  }
  res.json(arr);
  }else{

    res.send(err);
    console.log(err);
  }
  });
});


router.get('/listOffice', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
   Buildingsite.find((err,docs) => {
    if(!err){
    console.log("complete doc shown to user");
//    var obj = JSON.parse(docs);
//    console.log(obj.buildingName);
 var arr = [];
 for(var i = 0 ; i< docs[0].buildingSites.length ; i++){
     console.log(docs[0].buildingSites[i].Site[2].OfficeNames);
  //   if(!arr.includes(docs[0].buildingSites[i].Site[2].OfficeNames)){
     arr = arr.concat(docs[0].buildingSites[i].Site[2].OfficeNames);
     arr = [...new Set(arr)];
  }
  res.json(arr);
  }else{

    res.send(err);
    console.log(err);
  }
  });
});


router.get('/listSites', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
   Buildingsite.find((err,docs) => {
    if(!err){
    console.log("complete doc shown to user");
//    var obj = JSON.parse(docs);
//    console.log(obj.buildingName);
 console.log(typeof docs);
 var arr = [];
 for(var i = 0 ; i< docs[0].buildingSites.length ; i++){
     console.log(docs[0].buildingSites[i].Site[0].siteName);
     arr.push(docs[0].buildingSites[i].Site[0].siteName);
  }
  res.json(arr);
  }else{

    res.send(err);
    console.log(err);
  }
  });
});


router.get('/buildingDetails', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
   Buildingsite.find((err,docs) => {
    if(!err){
    console.log("complete doc shown to user");
    res.set('Access-Control-Allow-Headers', '*');
    res.json(docs);
  }else{
    res.set('Access-Control-Allow-Headers', '*');
    res.send(err);
    console.log(err);
  }
  });
});

//return full list
router.get('/listAll', (req,res) => {
Employee.find((err,docs) => {
  if(!err){
  console.log("complete doc shown to user");
  res.set('Access-Control-Allow-Headers', '*');
  res.json(docs);
}else{
  res.set('Access-Control-Allow-Headers', '*');
  res.send(err);
  console.log(err);
}
});
});


//list all approved users
router.get('/listApproved', (req,res) => {
    res.set('Access-Control-Allow-Headers', '*');
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
  res.set('Access-Control-Allow-Headers', '*');
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
  res.set('Access-Control-Allow-Headers', '*');
    Employee.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.send('record deleted');
        }
        else { console.log('Error in employee delete :' + err); }
    });
});


//insert new user / update existing user
router.post('/create', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
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
  res.set('Access-Control-Allow-Headers', '*');
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
  res.set('Access-Control-Allow-Headers', '*');
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
 employee.buildingId = req.body.buildingId;
 employee.sites = req.body.sites;
 employee.eId = req.body.eId;
 employee.phone = req.body.phone;
 employee.approval = req.body.approval;
 employee.terms = req.body.terms;
 employee.allowMessaging = req.body.allowMessaging;
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

function addSite( id , newDoc , res) {
Buildingsite.findOneAndUpdate({ _id : id }, newDoc , { new: true }, (err, doc) => {
      if (!err) {
        //res.send("record updated with  \n" + JSON.stringify(newDoc));
        res.json(newDoc);
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
