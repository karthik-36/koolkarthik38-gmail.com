const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Employee = mongoose.model('Employee');
const Admin = mongoose.model('admin');
const Buildingsite = mongoose.model('building');
const Offices = mongoose.model('office');
const Bids = mongoose.model('bids');
//test



router.post('/addBuilding', (req,res) => {

let arrSites = [];
for(i = 0 ; i <  req.body.Sites.length ; i++){
let bsite =  {
            "Site": [
                {
                    "siteName": req.body.Sites[i]
                },
                {
                    "buildingId": [
                    ]
                },
                {
                    "OfficeNames": [
                    ]
                }
            ]
        };
        arrSites.push(bsite);
}

 var newBuilding = new Buildingsite();
 newBuilding.buildingName =  req.body.buildingName;
 newBuilding.locationType = req.body.locationType;
 newBuilding.buildingSites = arrSites;



 var newAdmin = new Admin();
 newAdmin.username = req.body.username;
 newAdmin.password = req.body.password;
 newAdmin.locationType = req.body.locationType
 newAdmin.locationName =  req.body.buildingName;
 newAdmin.locationId = req.body.locationId;
 newAdmin.serviceList = req.body.serviceList;





var newOffices = new Offices();
let officeArray = [];
for(var i = 0 ; i < req.body.offices.length ; i++){
  var temp ={
    officeName : req.body.offices[i] ,
    buildingName : req.body.buildingName
  }
  officeArray.push(temp);
}


var newBids = new Bids();
let bidsArray = [];
for(var i = 0 ; i < req.body.buildingId.length ; i++){
  var temp ={
    buildingName : req.body.buildingName,
    buildingId : req.body.buildingId[i],
    idName : req.body.idName[i]
  }
  bidsArray.push(temp);
}

console.log("bids");
console.log(bidsArray);
console.log("office");
console.log(officeArray);
console.log("admin");
console.log(newAdmin);
console.log("buildingsite");
console.log(JSON.stringify(newBuilding));

/*
  newBuilding.save((err,doc)=>{

    if(!err){
       console.log("");
       res.send('building added \n' +  newBuilding);
    }else{
         console.log('error during record insertion : ' + err);
         res.send('error during record insertion : ' + err);
    }
  });

  newOffices.collection.insertMany(
   [ <document 1> , <document 2>, ... ],
   {
      writeConcern: <document>,
      ordered: <boolean>
   }
   );

 newAdmin.collection.insertMany(
   [ <document 1> , <document 2>, ... ],
   {
      writeConcern: <document>,
      ordered: <boolean>
   }
  );

  let officeArray = req.body.officeArray;
  console.log("employee Array inserted");
  console.log(employeeArray);
  Offices.collection.insert(officeArray,{ ordered : false}, function (err, docs) {
     if (err){
          console.error(err);
          res.send(err);
     } else {
       console.log("Multiple documents inserted to Collection");
       res.send("Multiple documents inserted to Collection");
     }
   });

*/
});



router.get('/buildingIdAndName', (req,res) => {

const str = req.headers.buildingid;
let buff = Buffer.from(str, 'base64');
let bName = buff.toString('ascii');

Bids.find({ buildingName : bName},(err,docs) => {
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


router.post('/onPageLoad', (req,res) => {
  const str = req.headers.buildingid;
  let buff = Buffer.from(str, 'base64');
  let bName = buff.toString('ascii');
  Buildingsite.find({ 'buildingName': bName },(err,docs) => {
  if(err){
    res.send("building not found");
  }
  else{
  res.send(docs);
  }
  });
});


router.post('/deleteSite', (req,res) => {
  const str = req.headers.buildingid;
  let buff = Buffer.from(str, 'base64');
  let bName = buff.toString('ascii');
  res.set('Access-Control-Allow-Headers', '*');
   Buildingsite.find({ 'buildingName': bName },(err,docs) => {
    if(!err){
      if(docs.length == 0){
        console.log("doc is null");
        res.send("building not found");
      }
      else{
        console.log("Site name  " + req.body.siteName);
        var index = -1;
        for(var i = 0 ; i< docs[0].buildingSites.length ; i++){
            if(docs[0].buildingSites[i].Site[0].siteName == req.body.siteName){
              index = i;
              break;
            }
          }
        if(index >= 0){
          console.log("site found");
          console.log("index is " + index);
        var arr = [];
        arr = docs[0].buildingSites;
          arr.splice(index, 1);
        docs[0].buildingSites = arr;
        newDoc = docs[0];
        addSite( docs[0]._id , newDoc , res);
    }else {
      res.send(" Site not found");
    }

      }
  }else{
    res.send(err);
    console.log(err);
  }
  });
});






router.post('/addSite', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
  const str = req.headers.buildingid;
  let buff = Buffer.from(str, 'base64');
  let bName = buff.toString('ascii');
   Buildingsite.find({ 'buildingName': bName },(err,docs) => {
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

              earr.Site[1].buildingId  = [...new Set(earr.Site[1].buildingId)];
              earr.Site[2].OfficeNames   = [...new Set(earr.Site[2].OfficeNames)];
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
            }else{
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
  const str = req.headers.buildingid;
  let buff = Buffer.from(str, 'base64');
  let bName = buff.toString('ascii');
   Buildingsite.find({"buildingName" : bName},(err,docs) => {
    if(!err){
    console.log("complete doc shown to user");


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
  const str = req.headers.buildingid;
  let buff = Buffer.from(str, 'base64');
  let bName = buff.toString('ascii');
   Buildingsite.find({"buildingName" : bName },(err,docs) => {
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
  const str = req.headers.buildingid;
  let buff = Buffer.from(str, 'base64');
  let bName = buff.toString('ascii');
   Buildingsite.find({ "buildingName" : bName },(err,docs) => {
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
  const str = req.headers.buildingid;
  let buff = Buffer.from(str, 'base64');
  let bName = buff.toString('ascii');
  var arr = [];
  var officeArr = [];
    function sendJSON(){
      res.send("hello" + arr);
    }
  async function origanalList(){
      console.log("2");
   Buildingsite.find({"buildingName" : bName},(err,docs) => {
    if(!err){
    console.log("complete doc shown to user");

    for(var i = 0 ; i< docs[0].buildingSites.length ; i++){
     console.log(docs[0].buildingSites[i].Site[2].OfficeNames);
     arr = arr.concat(docs[0].buildingSites[i].Site[2].OfficeNames);
   }
  console.log("office arr " + officeArr);
  arr = arr.concat(officeArr);
  arr =  [...new Set(arr)];
  console.log(arr);
  res.json(arr);
  }else{

    res.send(err);
    console.log(err);
  }
});

  }



 function getOfficeList(callback){
  Offices.find((err,docs) => {
    if(!err){
    for(var s = 0 ; s< docs.length ; s++){
      console.log(" pushed "+ docs[s].officeName)
    officeArr.push(docs[s].officeName);
    }
    console.log("officeArr "+ officeArr);
    console.log("1");
    callback();
   }else{
    console.log(err);
  }
  });

  }
getOfficeList(origanalList);
});





router.get('/listSites', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
  const str = req.headers.buildingid;
  let buff = Buffer.from(str, 'base64');
  let bName = buff.toString('ascii');
   Buildingsite.find({"buildingName" : bName},(err,docs) => {
    if(!err){
    console.log("complete doc shown to user");

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
  const str = req.headers.buildingid;
  let buff = Buffer.from(str, 'base64');
  let bName = buff.toString('ascii');
   Buildingsite.find({"buildingName" : bName},(err,docs) => {
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


router.post('/createOffice', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
  if (req.body._id == null){
        console.log("inserting new record");
          insertOffice(req, res);
    } else{
      res.send('office already exists');
    }
});


router.get('/listApprovedVisitor', (req,res) => {
    res.set('Access-Control-Allow-Headers', '*');
  Employee.find({ 'approval': true , "permanent" : false }, function (err, docs) {
    if(!err){
    console.log("approved doc shown to user");
    res.json(docs);
  }else{
    res.send(err);
    console.log(err);
  }
  });
});


router.get('/listApprovedPermanent', (req,res) => {
    res.set('Access-Control-Allow-Headers', '*');
  Employee.find({ 'approval': true , "permanent" : true }, function (err, docs) {
    if(!err){
    console.log("approved Permanent doc shown to user");
    res.json(docs);
  }else{
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
router.get('/listUnapprovedVisitor', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
  Employee.find({ 'approval': false , 'permanent' : false}, function (err, docs) {
    if(!err){
    console.log("complete doc shown to user");
    res.json(docs);
  }else{
    res.send(err);
    console.log(err);
  }
  });
});

router.get('/listUnapprovedPermanent', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
  Employee.find({ 'approval': false , 'permanent' : true}, function (err, docs) {
    if(!err){
    console.log("complete doc shown to user");
    res.json(docs);
  }else{
    res.send(err);
    console.log(err);
  }
  });
});

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


// insert BULK

router.post('/createBulk', (req,res) => {
  res.set('Access-Control-Allow-Headers', '*');
  let employeeArray = req.body.arr;
  console.log("employee Array inserted");
  console.log(employeeArray);
  Employee.collection.insert(employeeArray,{ ordered : false}, function (err, docs) {
     if (err){
          console.error(err);
          res.send(err);
     } else {
       console.log("Multiple documents inserted to Collection");
       res.send("Multiple documents inserted to Collection");
     }
   });
});

//check if admin username and password is correct
router.post('/check', (req, res) => {
  res.set('Access-Control-Allow-Headers', '*');
        Admin.find({ username: req.body.username , password : req.body.password },(err,docs) => {

       if(err){}else{
        console.log(docs[0]);

         var valid = {
          "validity" : true,
          "locationtype" : docs[0].locationType ,
          "locationname" : docs[0].locationName ,
          "locationid" : docs[0].locationId,
          "serviceList" : docs[0].serviceList
       };

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






function insertOffice(req,res){
 var office = new Offices();
 office.officeName = req.body.officeName;
 office.buildingName = 'kosmoone';
 office.save((err,doc)=>{

   if(!err){
      console.log("office added");
      res.send('office added \n' +  office);
   }else{
        console.log('error during record insertion : ' + err);
        res.send('error during record insertion : ' + err);
   }
 });

};



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
 employee.permanent = req.body.permanent;
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
