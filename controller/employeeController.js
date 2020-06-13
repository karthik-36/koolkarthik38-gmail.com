const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const Employee = mongoose.model("employees");
const Admin = mongoose.model("admin");
const SuperAdmin = mongoose.model("superadmin");
let Buildingsite = mongoose.model("buildings");
const Offices = mongoose.model("office");
const Bids = mongoose.model("bids");
const util = require('util')
var nodemailer = require('nodemailer');




router.post("/getBuildingElement", (req, res) => {

Buildingsite.find({ buildingName : req.body.buildingName }).then(bdocs => {

  let mappedSites = bdocs[0].buildingSites;
  let buildingSite = [];
  for(var i = 0 ; i < bdocs[0].buildingSites.length ; i++){
    buildingSite.push(bdocs[0].buildingSites[i].Site[0].siteName);
  }

  let listDetails = {
    _id : bdocs[0]._id,
      locationType : bdocs[0].locationType,
      buildingName : bdocs[0].buildingName,
      countryCode : bdocs[0].countryCode,
      buildingSites : buildingSite
  };

  Offices.find({ buildingName: req.body.buildingName }).then(offices => {
    let newOffices = [];
    for (var x = 0; x < offices.length; x++) {
      newOffices.push(offices[x].officeName);
    }
    return newOffices;

  }).then((x) => {
    listDetails.officeNames = x;
    let pair = [];
    Bids.find({ buildingName: req.body.buildingName }).then(BidPair => {
      for(var i = 0 ; i < BidPair.length ; i++){
      pair.push([BidPair[i].idName ,BidPair[i].buildingId , BidPair[i].buildingType]);
      }
      return pair;
    }).then((pair) => {
      listDetails.bIdPairs = pair;
      let jarr = [];
      jarr.push(listDetails);
      Admin.find({ locationName : req.body.buildingName }).then(docs => {
      jarr.push(mappedSites);
      jarr.push(docs);
      res.json(jarr);
        });
      });


    });
  });
});












// partial/full name search
router.post("/searchBuilding", (req, res) => {

Buildingsite.find({  }).select('buildingName').then(bdocs => {
  let jarr = [];
  let st = req.body.searchTerm;
  for(var i = 0 ; i < bdocs.length; i++){
    if(bdocs[i].buildingName.includes(st)){
      jarr.push(bdocs[i].buildingName);
    }
  }

  res.json(jarr);

  });

});



// Custom Search Refer to customSearch Function
router.post("/customSearch", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Buildingsite.find({},{ locationType : 1 , buildingName : 1, buildingSites : 1, _id : 1}).then(docs => {
      let idList = customSearch(util.inspect(docs, {showHidden: false, depth: null}) , req.body.search , req.body.withinBuilding );

      return idList;
  }).then(idList => {
    console.log(idList);
    Buildingsite.find({ _id : idList }).then(docs => {
      res.send(docs);
      console.log(docs);
    });
});
});





// global Search
router.post("/search", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
// $text: { $search: "kosmoone" }
  //Buildingsite.index({ buildingName : "text" , buildingSites : "text"});
  Buildingsite.find({  $text: { $search: "kosmoone" } }).exec(function(err, docs){
  if (err) {
    console.log("hi");
    console.log(err)
    res.send("building not foun1");
    } else {
        console.log("hello");
      console.log(docs.toString())
      res.send(docs);
    }
  });
});






// Add New Administrator
router.post("/addAdmin", (req, res) => {
  const toLow = req.body.buildingName.replace(/ +/g, "");
  const lowBuildingName = toLow.toLowerCase();
  base64data = base_64(lowBuildingName,req.body.locationType);
  var newAdmin = new Admin();

  newAdmin.username = req.body.username;
  newAdmin.password = req.body.password;
  newAdmin.locationType = req.body.locationType;
  newAdmin.locationName = lowBuildingName;
  newAdmin.locationId = base64data;
  newAdmin.serviceList = req.body.serviceList;

  if(req.body._id == undefined){

     console.log("no id");
     newAdmin.save((err, doc) => {
       if (!err) {
         res.send("admin added \n" + newAdmin);
       } else {
         res.send("error during insertion: " + err);
       }
     });

  }else{
    console.log("yes id");
    newAdmin._id = req.body._id;
    Admin.findOneAndUpdate({ _id: req.body._id },newAdmin,{ new: true },(err, doc) => {
        if (!err) {
          res.send("record updated with  \n" + JSON.stringify(req.body));
        } else {
            console.log("Error during record update : " + err);
            res.send("Error during record update : " + err);
        }
      }
    );

  }
});






router.post("/addSuperAdmin", (req, res) => {
  var newAdmin = new SuperAdmin();
  if(validateEmail(req.body.username) && req.body.password.length > 0){
  newAdmin.username = req.body.username;
  newAdmin.password = req.body.password;

  newAdmin.save((err, doc) => {
    if (!err) {
      res.send("super admin added \n" + newAdmin);
    } else {
      res.status(400);
      res.send("error during insertion: " + err);
    }
  });
}else{
  res.status(400);
  res.send("error during insertion: email not valid");

}


});






















router.get("/buildingDetailsUnmapped", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
    let pair = [];
    Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      var sites1 = [];
      var buildingId = [];
      var newOffices = [];

      for (var i = 0; i < docs[0].buildingSites.length; i++) {
        sites1 = sites1.concat(docs[0].buildingSites[i].Site[0].siteName);
      }
      console.log(sites1);
      Bids.find({ buildingName: bName }).then(bds => {
        for (var u = 0; u < bds.length; u++) {
          buildingId[u] = [bds[u].idName,bds[u].buildingId];

        }
        console.log(buildingId);
        return 1;
      }).then(resolved =>{

            Offices.find({ buildingName: bName }).then(offices => {
              for (var x = 0; x < offices.length; x++) {
                newOffices.push(offices[x].officeName);
              }
              console.log(newOffices);
              return 1;
            }).then(resolved =>{
              let obj3arr = {
                locationType:docs[0].locationType,
                Sites :  sites1 ,
                BuildingIdPairs : buildingId,
                OfficeNames : newOffices
              }
              res.send(obj3arr);
            });
      });

    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});











// Add New Building + ( offices and buildingId ==> localName pairs)
router.post("/addBuilding", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let resultHolder = '';
  const toLow = req.body.buildingName.replace(/ +/g, "");
  const lowBuildingName = toLow.toLowerCase();

  let arrSites = [];
  let reason = "";




Buildingsite.find({ buildingName : lowBuildingName  }).then(bdocs => {
  if(bdocs.length > 0){
    reason = reason +"Building Name : " + bdocs[0].buildingName + " already exists ";
  }

  Bids.find({ buildingId : req.body.buildingId  }).then(docs => {
    if(docs.length > 0){
      if(reason.length > 0){reason = reason + ", "}
      reason = reason + "  matching buildingId already exists : ";
      for(var i = 0 ; i < docs.length  ; i++){
        if(i == 0){
            reason = reason + " " +docs[i].buildingId;
        }else {
            reason = reason + ", " +docs[i].buildingId;
        }
      }
      return reason;
    }else{
       return "";
    }
  }).then(uniqueBuildingIds =>{
    if(uniqueBuildingIds.length == 0){

    console.log("all sites are unique");
    for (i = 0; i < req.body.Sites.length; i++) {
      let bsite = {
        Site: [
          {
            siteName: req.body.Sites[i]
          },
          {
            buildingId: []
          },
          {
            OfficeNames: []
          }
        ]
      };
      arrSites.push(bsite);
    }

    var newBuilding = new Buildingsite();
    newBuilding.buildingName = lowBuildingName;
    newBuilding.locationType = req.body.locationType;
    newBuilding.buildingSites = arrSites;
    newBuilding.countryCode = req.body.countryCode;

    if(req.body.locationType != "residential"){
    var newOffices = new Offices();
    let officeArray = [];
    for (var i = 0; i < req.body.offices.length; i++) {
      var temp = {
        officeName: req.body.offices[i],
        buildingName: lowBuildingName
      };
      officeArray.push(temp);
    }

    Offices.collection.insert(officeArray, { ordered: false }, function (
      err,
      docs
    ) {
      if (err) {
        console.log("officeerror");
        console.error(err);
        //    res.send(err);
      } else {
        console.log("Multiple documents inserted to Collection");
        resultHolder = resultHolder + " Office Collection Added ,  "
      }
    });

    }

    var newBids = new Bids();
    let bidsArray = [];
    for (var i = 0; i < req.body.buildingId.length; i++) {
      var temp = {
        buildingName: lowBuildingName,
        buildingId: req.body.buildingId[i],
        idName: req.body.idName[i],
        buildingType : req.body.buildingType[i]
      };
      bidsArray.push(temp);
    }


    if (
      lowBuildingName &&
      req.body.locationType &&
      req.body.Sites.length &&
      req.body.buildingType.length == req.body.buildingId.length &&
      req.body.buildingId.length == req.body.idName.length
    ) {
      newBuilding.save((err, doc) => {
        if (!err) {
          resultHolder = resultHolder + " New Building Added ,  ";
        } else {
          console.log("error during record insertion : " + err);
        }
      });


      Bids.collection.insert(bidsArray, { ordered: false }, function (err, docs) {
        if (err) {
          console.error(err);
        } else {
          console.log("Bids : Multiple documents inserted to Collection");
            resultHolder = resultHolder + "  Building id sets added ,  ";
        }
      });

      res.send("buildingid : " +base_64(lowBuildingName,req.body.locationType) + " \n " + resultHolder);
      console.log(resultHolder);
    } else {
      res.status(400);
      res.send("Error during insertion : " + " essential field/s missing check location type, building name, country code etc ; ensure that buildingID.length == idName.length == buildingType.length and try again");
    }
  }else {
    res.status(400);
    res.send("error : " + reason);
  }
  });


 });
///////////////////
});












// Add New Building + ( offices and buildingId ==> localName pairs)
router.post("/updateBuilding", (req, res) => {
res.set("Access-Control-Allow-Headers", "*");


let reason = "";


Buildingsite.findOne({ buildingName : req.body.buildingName  }).then(bdocs => {

 if(bdocs.buildingSites.length > 0){
   return bdocs.buildingSites;
 }else{
   return [];
 }
}).then((arrSites) => {


//  let arrSites = arrSites;
  Bids.find({ buildingId : req.body.buildingId  }).then(docs => {
    if(docs.length > 0){
      if(reason.length > 0){reason = reason + ", "}
      reason = reason + "  matching buildingId already exists : ";
      for(var i = 0 ; i < docs.length  ; i++){
        if(i == 0){
            reason = reason + " " +docs[i].buildingId;
          }else {
            reason = reason + ", " +docs[i].buildingId;
          }
        }
        return reason;
      }else{
        return "";
      }
    }).then(uniqueBuildingIds =>{
  ///// unique building id
    if(uniqueBuildingIds == ""){

    //  let arrSites = [];
      for (i = 0; i < req.body.Sites.length ; i++) {
        let siteInstance = {
          Site: [
            {
              siteName: req.body.Sites[i]
            },
            {
              buildingId: []
            },
            {
              OfficeNames: []
            }
          ]
        };

        let overlap = false;
          console.log(arrSites);
        for(var s = 0 ; s < arrSites.length ; s++){
          console.log( siteInstance.Site[0].siteName + "    " +  arrSites[s].Site[0].siteName);
            if(siteInstance.Site[0].siteName == arrSites[s].Site[0].siteName){
              overlap = true;
              break;
            }
        }
        if(!overlap){
          arrSites.push(siteInstance);
        }
    }




     let newBuilding = new Buildingsite();
     const toLow = req.body.buildingName.replace(/ +/g, "");
     const lowBuildingName = toLow.toLowerCase();
     newBuilding.buildingName = lowBuildingName;
     newBuilding.locationType = req.body.locationType;
     newBuilding.buildingSites = arrSites;
     newBuilding.countryCode = req.body.countryCode;



     var newBids = new Bids();
     let bidsArray = [];
     for (var i = 0; i < req.body.buildingId.length; i++) {
       var temp = {
         buildingName: lowBuildingName,
         buildingId: req.body.buildingId[i],
         idName: req.body.idName[i],
         buildingType : req.body.buildingType[i]
       };
       bidsArray.push(temp);
     }



      if(req.body._id != undefined){



        if (lowBuildingName &&
          req.body.locationType &&
          req.body.Sites.length &&
          req.body.buildingType.length == req.body.buildingId.length &&
          req.body.buildingId.length == req.body.idName.length) {

            newBuilding._id = req.body._id;
            Buildingsite.findOneAndUpdate({ _id: req.body._id },newBuilding,{ new: true },(err, doc) => {
              if(!err){
                res.send(newBuilding);
              }else{
                res.send(err);
              }
            });




            Bids.collection.insert(bidsArray, { ordered: false }, function (err, docs) {
              if (err) {
                console.error(err);
              } else {
                console.log("Bids : Multiple documents inserted to Collection");
                  resultHolder = resultHolder + "  Building id sets added ,  ";
              }
            });





            if(req.body.locationType != "residential"){
            var newOffices = new Offices();
            let officeArray = [];
            for (var i = 0; i < req.body.offices.length; i++) {
              var temp = {
                officeName: req.body.offices[i],
                buildingName: lowBuildingName
              };
              officeArray.push(temp);
            }


            Offices.collection.insert(officeArray, { ordered: false }, function ( err,docs ) {
              if (err) {
                console.log("officeerror");
                console.error(err);
              } else {
                console.log("Multiple documents inserted to Collection");
                resultHolder = resultHolder + " Office Collection Added ,  "
              }
            });

           }









          }



      }else{
        res.send(" you must include _id in order to update");
      }



     }
     else{
        res.send(reason);
     }

    });


});
//here




      ///// unique building id end

    //Buildingsite.findOneAndUpdate({ _id: req.body._id },newAdmin,{ new: true },(err, doc) => {
    //});
    //Buildingsite.find({ buildingName :   }).then(bdocs => {
  //    res.send("here");
//    });

});































// Add New Building + ( offices and buildingId ==> localName pairs)  // deprecated
router.post("/addBuildingOld", (req, res) => {
  let resultHolder = '';
  const toLow = req.body.buildingName.replace(/ +/g, "");;
  const lowBuildingName = toLow.toLowerCase();
  const buff = new Buffer(lowBuildingName);
  const base64data = buff.toString("base64");
  let arrSites = [];


  for (i = 0; i < req.body.Sites.length; i++) {
    let bsite = {
      Site: [
        {
          siteName: req.body.Sites[i]
        },
        {
          buildingId: []
        },
        {
          OfficeNames: []
        }
      ]
    };
    arrSites.push(bsite);
  }

  var newBuilding = new Buildingsite();
  newBuilding.buildingName = lowBuildingName;
  newBuilding.locationType = req.body.locationType;
  newBuilding.buildingSites = arrSites;

  if(req.body.locationType != "residential"){
  var newOffices = new Offices();
  let officeArray = [];
  for (var i = 0; i < req.body.offices.length; i++) {
    var temp = {
      officeName: req.body.offices[i],
      buildingName: lowBuildingName
    };
    officeArray.push(temp);
  }

  console.log("office");
  console.log(officeArray);

  Offices.collection.insert(officeArray, { ordered: false }, function (
    err,
    docs
  ) {
    if (err) {
      console.log("officeerror");
      console.error(err);
      //    res.send(err);
    } else {
      console.log("Multiple documents inserted to Collection");
      resultHolder = resultHolder + " Office Collection Added ,  "
    }
  });

  }

  var newBids = new Bids();
  let bidsArray = [];
  for (var i = 0; i < req.body.buildingId.length; i++) {
    var temp = {
      buildingName: lowBuildingName,
      buildingId: req.body.buildingId[i],
      idName: req.body.idName[i]
    };
    bidsArray.push(temp);
  }


  if (
    lowBuildingName &&
    req.body.locationType &&
    req.body.Sites.length &&
    req.body.buildingId.length == req.body.idName.length
  ) {
    newBuilding.save((err, doc) => {
      if (!err) {
        resultHolder = resultHolder + " New Building Added ,  ";
      } else {
        console.log("error during record insertion : " + err);
      }
    });



    Bids.collection.insert(bidsArray, { ordered: false }, function (err, docs) {
      if (err) {
        console.error(err);
      } else {
        console.log("Multiple documents inserted to Collection");
          resultHolder = resultHolder + "  Building id sets added ,  ";
      }
    });

    res.send("buildingid : " +base_64(lowBuildingName,req.body.locationType) + " \n " + resultHolder);
    console.log(resultHolder);
  } else {
    res.send("Error during insertion");
  }
});






// Add New Site / Update Existing (local Names will be supplied instead of building Ids)
router.post("/AddSiteByName", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let buildingIdList = [];
  let localList =req.body.Site[1].buildingId;
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Bids.find({ buildingName: bName, idName : localList }).then(docs => {
      for(var i = 0 ; i < docs.length ; i++){
        buildingIdList.push(docs[i].buildingId);
      }
       console.log(buildingIdList);

       if(buildingIdList.length == 0){
         throw new Error("local name => buildingId   pair not found");
       }
      return buildingIdList;

   }).then(buildingIdList =>{

    req.body.Site[1].buildingId = buildingIdList;
      Buildingsite.find({ buildingName: bName }, (err, docs) => {
        if (!err) {
          if (docs.length == 0) {
            res.send("building not found");
          } else {


            var siteExists = false;
            siteArr = [];
            for (var i = 0; i < docs[0].buildingSites.length; i++) {
              siteArr = siteArr.concat(docs[0].buildingSites[i].Site[0].siteName);
            }

            if (siteArr.includes(req.body.Site[0].siteName)) {
              siteExists = true;
            }

            if (siteExists) {

              var newBuildingID = new Set();
              var newOfficeName = new Set();
              var index;
              newBuildingID = req.body.Site[1].buildingId;
              newOfficeName = req.body.Site[2].OfficeNames;

              var earr;
              for (var i = 0; i < docs[0].buildingSites.length; i++) {
                if (
                  docs[0].buildingSites[i].Site[0].siteName ==
                  req.body.Site[0].siteName
                ) {
                  index = i;
                  earr = docs[0].buildingSites[i];
                  break;
                }
              }


              earr.Site[1].buildingId = earr.Site[1].buildingId.concat(
                newBuildingID
              );
              earr.Site[2].OfficeNames = earr.Site[2].OfficeNames.concat(
                newOfficeName
              );

              earr.Site[1].buildingId = [...new Set(earr.Site[1].buildingId)];
              earr.Site[2].OfficeNames = [...new Set(earr.Site[2].OfficeNames)];
              //////// Replacement
              var arr = [];
              arr = docs[0].buildingSites;
              arr[index] = earr;
              docs[0].buildingSites = arr;
              newDoc = docs[0];
              addSite(docs[0]._id, newDoc, res);
            } else {
              var bidArr = [];
              var flag = true;
              for (var i = 0; i < docs[0].buildingSites.length; i++) {
                bidArr = bidArr.concat(docs[0].buildingSites[i].Site[1].buildingId);
              }

              for (var i = 0; i < req.body.Site[1].buildingId.length; i++) {
                if (bidArr.includes(req.body.Site[1].buildingId[i])) {
                  flag = false;
                  break;
                }
              }

              if (flag) {
                var arr = [];
                arr = docs[0].buildingSites;
                arr.push(req.body);
                docs[0].buildingSites = arr;
                newDoc = docs[0];
                addSite(docs[0]._id, newDoc, res);
              } else {
                res.send(
                  "Building ID already exists in a different building or site, Enter unique ID or contact KONE "
                );
              }
            }
          }
        } else {
          res.send(err);
        }
      });

  }).catch( err => {
    let str = '';
    str = str + err;
    console.log(str)
    res.send(str)
  })
}
});








router.post("/userEmail", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
    let mail = req.body.officeEmail;
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'whatsapp2backend@gmail.com',
        pass: 'musicSHIRT36'
      }
    });

       var mailOptions = {
                 from: 'WB_Karthik@gmail.com',
                 to: mail,
                 subject: 'Your building access request has been approved',
                 text: 'You now have access to services in kosmoone.',
                 html: '<div style="background-color: rgba(37 ,211, 102 , 0.7); border-radius: 25px; " ><h1 style = "padding-left : 20px;  padding-top : 10px; " > Request Granted !</h1><p style = "font-size:20px; font-weight: bold; padding-bottom : 9px;  padding-left : 20px;"> Hello '+ req.body.fullName +', you now have access to services at '+bName.toUpperCase()+'.</p></div>'
               };

            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });


    res.send("email recieved");
  }
});











// List All Buildingid  ===> Local Name   Pairs
router.get("/buildingIdAndName", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Bids.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      res.json(docs);
    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});



//on Page Load
router.post("/onPageLoad", (req, res) => {
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (err) {
      res.send("building not found");
    } else {
      res.send(docs);
    }
  });
}
});



// Delete existing Site of a building
router.post("/deleteSite", (req, res) => {
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  res.set("Access-Control-Allow-Headers", "*");
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      if (docs.length == 0) {
        res.send("building not found");
      } else {
        var index = -1;
        for (var i = 0; i < docs[0].buildingSites.length; i++) {
          if (docs[0].buildingSites[i].Site[0].siteName == req.body.siteName) {
            index = i;
            break;
          }
        }
        if (index >= 0) {
          var arr = [];
          arr = docs[0].buildingSites;
          arr.splice(index, 1);
          docs[0].buildingSites = arr;
          newDoc = docs[0];
          addSite(docs[0]._id, newDoc, res);
        } else {
          res.send(" Site not found");
        }
      }
    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});





// Add New Site
router.post("/addSite", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      if (docs.length == 0) {
        res.send("building not found");
      } else {
        var siteExists = false;
        siteArr = [];
        for (var i = 0; i < docs[0].buildingSites.length; i++) {
          siteArr = siteArr.concat(docs[0].buildingSites[i].Site[0].siteName);
        }

        if (siteArr.includes(req.body.Site[0].siteName)) {
          siteExists = true;
        }

        if (siteExists) {

          var newBuildingID = new Set();
          var newOfficeName = new Set();
          var index;
          newBuildingID = req.body.Site[1].buildingId;
          newOfficeName = req.body.Site[2].OfficeNames;

          var earr;
          for (var i = 0; i < docs[0].buildingSites.length; i++) {
            if (
              docs[0].buildingSites[i].Site[0].siteName ==
              req.body.Site[0].siteName
            ) {
              index = i;
              earr = docs[0].buildingSites[i];
              break;
            }
          }


          earr.Site[1].buildingId = earr.Site[1].buildingId.concat(
            newBuildingID
          );
          earr.Site[2].OfficeNames = earr.Site[2].OfficeNames.concat(
            newOfficeName
          );

          earr.Site[1].buildingId = [...new Set(earr.Site[1].buildingId)];
          earr.Site[2].OfficeNames = [...new Set(earr.Site[2].OfficeNames)];
          //////// Replacement commeth
          var arr = [];
          arr = docs[0].buildingSites;
          arr[index] = earr;
          docs[0].buildingSites = arr;
          newDoc = docs[0];
          addSite(docs[0]._id, newDoc, res);
        } else {
          var bidArr = [];
          var flag = true;
          for (var i = 0; i < docs[0].buildingSites.length; i++) {
            bidArr = bidArr.concat(docs[0].buildingSites[i].Site[1].buildingId);
          }


          for (var i = 0; i < req.body.Site[1].buildingId.length; i++) {
            if (bidArr.includes(req.body.Site[1].buildingId[i])) {
              flag = false;
              break;
            }
          }

          if (flag) {
            var arr = [];
            arr = docs[0].buildingSites;
            arr.push(req.body);
            docs[0].buildingSites = arr;
            newDoc = docs[0];
            addSite(docs[0]._id, newDoc, res);
          } else {
            res.send(
              "Building ID already exists in a different building or site, Enter unique ID or contact KONE "
            );
          }
        }
      }
    } else {
      res.send(err);
    }
  });
}
});




router.post("/listEmployeeSite", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Employee.find({ sites: req.body.site }, function (err, docs) {
    if (!err) {
      res.json(docs);
    } else {
      res.send(err);
      console.log(err);
    }
  });
});




// List offices in a particular building
router.post("/Office", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  var officeName = req.body.officeName;
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      var arr = [];
      for (var i = 0; i < docs[0].buildingSites.length; i++) {
        for (var s = 0;s < docs[0].buildingSites[i].Site[2].OfficeNames.length;s++) {
          if (docs[0].buildingSites[i].Site[2].OfficeNames[s] == officeName) {
            var obj = {
              Office_SiteAccess: docs[0].buildingSites[i].Site[0].siteName,
              Office_BuildingAccess: docs[0].buildingSites[i].Site[1].buildingId
            };
            arr.push(obj);
          }
        }
      }
      res.json(arr);
    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});




//List office IDs of a building
router.get("/listOfficeId", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  let buildingIdList = [];
    let arrbid = [];
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
     for (var i = 0; i < docs[0].buildingSites.length; i++) {
       console.log( docs[0].buildingSites[i].Site[1].buildingId);
       arrbid = arrbid.concat(docs[0].buildingSites[i].Site[1].buildingId);
       buildingIdList = (docs[0].buildingSites[i].Site[1].buildingId);
      }


      console.log(arrbid)
      let pair = [];
      Bids.find({ buildingName: bName, buildingId : arrbid }).then(bds => {
        console.log(bds);
        console.log("\n");
        let flag;
        for(var i = 0 ; i< arrbid.length ; i++){
          flag = false;
          for(var s = 0 ; s< bds.length ; s++){
             if(arrbid[i] == bds[s].buildingId){
               pair[i] = [arrbid[i] , bds[s].idName];
               flag = true;
             }
          }
          if(flag == false){
            pair[i] = [arrbid[i] , "id Not Mapped yet" ];
          }
        }
        return pair
     }).then(pair =>{
        var arr = [];
        for (var i = 0; i < docs[0].buildingSites.length; i++) {


          for (var s = 0; s < docs[0].buildingSites[i].Site[2].OfficeNames.length; s++) {
            console.log(docs[0].buildingSites[i].Site[1].buildingId);
            let finalPair = [];

            for(var u = 0 ; u < docs[0].buildingSites[i].Site[1].buildingId.length ; u++){
              for(var x = 0 ; x < pair.length ; x++){
                if(pair[x][0] == docs[0].buildingSites[i].Site[1].buildingId[u]){
                 finalPair.push(pair[x]);
                 break;
                }
              }
            }


            var obj = {
              OfficeName: docs[0].buildingSites[i].Site[2].OfficeNames[s],
              Office_SiteAccess: docs[0].buildingSites[i].Site[0].siteName,
              Office_LocalName : finalPair
            };
            arr.push(obj);
          }
        }
        res.json(arr);

      });




    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});






// List (1)Location And Office Names
router.get("/listLocationAndOfficeName", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      var arr = [];
      for (var i = 0; i < docs[0].buildingSites.length; i++) {
        for (var s = 0;s < docs[0].buildingSites[i].Site[2].OfficeNames.length;s++) {
          var obj = docs[0].buildingSites[i].Site[2].OfficeNames[s];
          arr.push(obj);
        }
      }
      let toSend = {
        locationType : docs[0].locationType,
        officeNames : arr
      };

      res.json(toSend);

    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});






// List all buildingIds of a particular building
router.get("/listBuildingId", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  console.log("header is : " +  req.headers.buildingid)
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      var arr = [];
      for (var i = 0; i < docs[0].buildingSites.length; i++) {
        console.log(docs[0].buildingSites[i].Site[1].buildingId);
        arr = arr.concat(docs[0].buildingSites[i].Site[1].buildingId);
      }
      res.json(arr);
    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});






// List Offices of a Building
router.get("/listOffice", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  var arr = [];
  var officeArr = [];
  async function origanalList() {
    Buildingsite.find({ buildingName: bName }, (err, docs) => {
      if (!err) {
        for (var i = 0; i < docs[0].buildingSites.length; i++) {
          arr = arr.concat(docs[0].buildingSites[i].Site[2].OfficeNames);
        }
        arr = arr.concat(officeArr);
        arr = [...new Set(arr)];
        res.json(arr);
      } else {
        res.send(err);
      }
    });
   }
  }

  function getOfficeList(callback) {
    Offices.find((err, docs) => {
      if (!err) {
        for (var s = 0; s < docs.length; s++) {
          console.log(" pushed " + docs[s].officeName);
          officeArr.push(docs[s].officeName);
        }
        console.log("officeArr " + officeArr);
        console.log("1");
        callback();
      } else {
        console.log(err);
      }
    });
  }
  getOfficeList(origanalList);
});





// list Sites of a particular Building
router.get("/listSites", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      console.log("complete doc shown to user");

      var arr = [];
      for (var i = 0; i < docs[0].buildingSites.length; i++) {
        console.log(docs[0].buildingSites[i].Site[0].siteName);
        arr.push(docs[0].buildingSites[i].Site[0].siteName);
      }
      res.json(arr);
    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});






// list 1 Building Detail
router.get("/buildingDetails", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
    let pair = [];
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {

      var arr = [];
      var buildingSet = [];
      for (var i = 0; i < docs[0].buildingSites.length; i++) {
        buildingSet[i] = docs[0].buildingSites[i].Site[1].buildingId;
        arr = arr.concat(docs[0].buildingSites[i].Site[1].buildingId);
      }
      console.log(arr)
      console.log(buildingSet)


      Bids.find({ buildingName: bName, buildingId : arr }).then(bds => {
        console.log(bds);
        console.log("\n");
        let flag;
        for(var i = 0 ; i< arr.length ; i++){
          flag = false;
          for(var s = 0 ; s< bds.length ; s++){
             if(arr[i] == bds[s].buildingId){
               pair[i] = [arr[i] , bds[s].idName];
               flag = true;
             }
          }
          if(flag == false){
            pair[i] = [arr[i] , "id Not Mapped yet" ];
          }
        }
        return pair;
     }).then(pair =>{

       let pairSet = [];
       for (var u = 0; u < docs[0].buildingSites.length; u++) {
         pairSet = [];
         for(var x = 0 ; x < docs[0].buildingSites[u].Site[1].buildingId.length  ; x++){
                console.log(docs[0].buildingSites[u].Site[1].buildingId[x]);
                for(var t = 0 ; t < pair.length ; t++){
                  if(docs[0].buildingSites[u].Site[1].buildingId[x] == pair[t][0]){
                    pairSet.push(pair[t]);
                    break;
                    }
               }
          }
          docs[0].buildingSites[u].Site[1].buildingId = pairSet;
          console.log("\n")
       }


       let sites1 = [];
       for(var tar = 0 ; tar < docs[0].buildingSites.length ; tar++){
        sites1 = sites1.concat(docs[0].buildingSites[tar].Site[0].siteName);
       }
       let bidspair = [];
       for(var tar = 0 ; tar < docs[0].buildingSites.length ; tar++){
        bidspair = bidspair.concat(docs[0].buildingSites[tar].Site[1].buildingId);
       }

       let olist = [];
       for(var tar = 0 ; tar < docs[0].buildingSites.length ; tar++){
        olist = olist.concat(docs[0].buildingSites[tar].Site[2].OfficeNames);
       }

       let obj3arr = {
         Sites : sites1,
         BuildingIdPair : bidspair,
         Offices : olist
       }
         res.json(obj3arr);
  //      res.json(docs);

      });

    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});




// create New Office
router.post("/createOffice", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  if (req.body._id == null) {
    console.log("inserting new record");
    insertOffice(req, res, bName);
  } else {
    res.send("office already exists");
  }
}
});



//return full list of employess
router.get("/listAll", (req, res) => {
  Employee.find((err, docs) => {
    if (!err) {
      console.log("complete doc shown to user");
      res.set("Access-Control-Allow-Headers", "*");
      res.json(docs);
    } else {
      res.set("Access-Control-Allow-Headers", "*");
      res.send(err);
      console.log(err);
    }
  });
});








// List Approved and Visitor status
router.get("/listApprovedVisitor", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  // ex
  //let current = curdate - (24 * 3600);

//
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Employee.find({ approval: true, permanent: false , buildingName : bName }, function (err, docs) {
    // expiry date
    // current date
    if (!err) {
      console.log("approved doc shown to user");
      res.json(docs);
    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});




// list Approved and permanent
router.get("/listApprovedPermanent", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Employee.find({ approval: true, permanent: true , buildingName : bName}, function (err, docs) {
    if (!err) {
      console.log("approved Permanent doc shown to user");
      res.json(docs);
    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});





//list all approved users
router.get("/listApproved", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Employee.find({ approval: true }, function (err, docs) {
    if (!err) {
      console.log("approved doc shown to user");
      res.json(docs);
    } else {
      res.send(err);
      console.log(err);
    }
  });
});





//list all unapproved  and visitor status users
router.get("/listUnapprovedVisitor", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Employee.find({ approval: false, permanent: false , buildingName : bName   }, function (err, docs) {
    if (!err) {
      console.log("complete doc shown to user");
      res.json(docs);
    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});





// list UnApproved And Permanent
router.get("/listUnapprovedPermanent", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Employee.find({ approval: false, permanent: true , buildingName : bName }, function (err, docs) {
    if (!err) {
      console.log("complete doc shown to user");
      res.json(docs);
    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});





// List all Unapproved
router.get("/listUnapproved", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Employee.find({ approval: false }, function (err, docs) {
    if (!err) {
      console.log("complete doc shown to user");
      res.json(docs);
    } else {
      res.send(err);
      console.log(err);
    }
  });
}
});





//delete record
router.get("/delete/:id", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  Employee.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.send("record deleted");
    } else {
      console.log("Error in employee delete :" + err);
    }
  });
}
});






//insert new user / update existing user
router.post("/create", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  if (req.body._id == null) {
    req.body.buildingName = bName;
    console.log("inserting new record");
    insertRecord(req, res);
  } else {
    console.log("updating existing record");
    updateRecord(req, res);
  }
 }
});





// insert BULK
router.post("/createBulk", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ?  to_ascii(res,req.headers.buildingid) : to_ascii(res,"");
  if(bName != -1){
  let employeeArray = req.body.arr;
  for(var i = 0 ; i < employeeArray.length ; i++){
    employeeArray[i].buildingName = bName;
    employeeArray[i].sessionId = employeeArray[i].buildingId[0];
    employeeArray[i].createdAt = new Date();
  }
  console.log("employee Array inserted");
  console.log(employeeArray);
  Employee.collection.insert(employeeArray, { ordered: false }, function (
    err,
    docs
  ) {
    if (err) {
      console.error(err);
      res.send(err);
    } else {
      res.send("Multiple documents inserted to Collection");
    }
  });
}
});





//check if admin username and password is correct
router.post("/check", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Admin.find(
    { username: req.body.username, password: req.body.password },
    (err, docs) => {
      if (err) {
      } else if (docs[0] == undefined) {
        res.send("user not found");
      } else {
        console.log(docs[0]);

        var valid = {
          validity: true,
          locationtype: docs[0].locationType,
          locationname: docs[0].locationName,
          locationid: docs[0].locationId,
          serviceList: docs[0].serviceList
        };

        res.json(valid);
      }
    }
  );
});



//check if admin username and password is correct
router.post("/checkSuper", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  SuperAdmin.find(
    { username: req.body.username, password: req.body.password },
    (err, docs) => {
      if (err) {
      } else if (docs[0] == undefined) {
        res.status(400);
        res.json({ message : "user not valid" , valid : false});
      } else {
        console.log(docs[0]);
        var valid = {
          message : "user is valid",
          valid : true
        };

        res.json(valid);
      }
    }
  );
});







// Check if Phone number exists in employee DataBase
router.post("/checkPhone", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Employee.exists({ phone: req.body.phone }, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Exist " + result);
      const valid = { exists: result };
      res.json(valid);
    }
  });
});



router.post("/validatePhone", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  console.log(req.body.number);
  console.log("number up");
  let str = req.body.number.toString();
  console.log(str);
  Employee.find({ phone : str }, function (err, docs) {
    if (!err) {
      console.log(docs);
      if(docs.length != 0){
      req.body = docs[0];
      ordByPhone(req,res);
    }else{
      res.send("number was not found");
    }
  }else {
      res.send(err);
      console.log(err);
    }
  });
});




// Insert New Office
function insertOffice(req, res , bName) {
  var office = new Offices();
  office.officeName = req.body.officeName;
  office.buildingName = bName;
  office.save((err, doc) => {
    if (!err) {
      console.log("office added");
      res.send("office added \n" + office);
    } else {
      console.log("error during record insertion : " + err);
      res.send("error during record insertion : " + err);
    }
  });
}






// Insert Employee Record Function
function insertRecord(req, res) {
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
  employee.sessionId = req.body.buildingId[0];
  employee.buildingName = req.body.buildingName;
  employee.createdAt =  new Date();
  // add expiry date  new Date(); + 24 hrs
  employee.save((err, doc) => {
    if (!err) {
      console.log("New employee created");
      if(req.body.office != null){
      res.send("employee created ");
    }else{
        res.send("employee not created ");
      }
    } else {
      console.log("error during record insertion : " + err);
      res.send("error during record insertion : " + err);
    }
  });
}





// Update existing Record
function updateRecord(req, res) {
  if (validateEmail(req.body.officeEmail)) {
    Employee.findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      { new: true },
      (err, doc) => {
        if (!err) {
          res.send("record updated with  \n" + JSON.stringify(req.body));
        } else {
          if (err.name == "ValidationError") {
            console.log("volidation error");
            res.send("validation error " + err);
          } else {
            console.log("Error during record update : " + err);
            res.send("Error during record update : " + err);
          }
        }
      }
    );
  } else {
    res.send("invalid email");
    console.log("invalid email");
  }
}




function updateRecordByPhone(req, res) {
  req.body.apporval = true;
  if (validateEmail(req.body.officeEmail)) {
    Employee.findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      { new: true },
      (err, doc) => {
        if (!err) {
          let message = {
            message : "Phone was validated",
            buildingId : req.body.buildingId
          }
          res.json(message);
        } else {
          if (err.name == "ValidationError") {
            console.log("volidation error");
            res.send("validation error " + err);
          } else {
            console.log("Error during record update : " + err);
            res.send("Error during record update : " + err);
          }
        }
      }
    );
  } else {
    res.send("invalid email");
    console.log("invalid email");
  }
}






function updateRecordInterval(req) {
    Employee.findOneAndUpdate({  _id : req.body._id } , req.body , { new: true },(err, doc) => {
        if (!err) {
          console.log("Record Updated");
        } else {
          if (err.name == "ValidationError") {
            console.log("volidation error");
          } else {
            console.log("Error during record update : " + err);
          }
        }
      }
    );
}






// add / Update Existing Site
function addSite(id, newDoc, res) {
  Buildingsite.findOneAndUpdate(
    { _id: id },
    newDoc,
    { new: true },
    (err, doc) => {
      if (!err) {
        res.json(newDoc);
      } else {
        if (err.name == "ValidationError") {
          console.log("volidation error");
          res.send("validation error " + err);
        } else {
          console.log("Error during record update : " + err);
          res.send("Error during record update : " + err);
        }
      }
    }
  );
}



// text => base64
function base_64(str1, str2){
return Buffer.from((str1+":"+str2)).toString('base64');
}



// base64 => text
function to_ascii(res,str){
if(str != ""){
  str = Buffer.from(str,'base64').toString('ascii');
  if(str.includes(":office") || str.includes(":residential")){
      return str.split(":")[0];
   }else{
       res.status(400).send("buildingid header is not valid");
       return -1;
   }
}else{
    res.status(400).send("buildingid is missing");
    return -1;
    }
}



// Custom database search function
function customSearch(str , search , withinBuilding){
  str = str.toLowerCase();
  search = search.toLowerCase();
  let pushIndex = 0;;
  let idHolder;
  while(pushIndex != -1){
    pushIndex = str.indexOf("_id", pushIndex);
    if(pushIndex == -1){
      break;
    }
    idHolder = str.slice(pushIndex ,pushIndex + 29);
    str = str.slice(0,pushIndex) + str.slice(pushIndex + 30);
    let res = '';
    let insertIndex;
    for(var i = pushIndex ;  ; i++){
      pushIndex++;
      res= res + str[i];
      if(str[i] == '}'){
        str = str.slice(0, i) + idHolder + str.slice(i);
        break;
      }
    }
  }
  str = str.replace(/(?!i)(?!d)(?!:)[a-zA-Z]*:/g, '');
  console.log(str);
  let idList = [];
  let index = 0;
  while(index != -1){
   index = str.indexOf(search ,index);
   if(index == -1){
     break;
   }
   console.log(" index of search : " + index + " word is " + str.slice(index,index + search.length));
   index = str.indexOf("_id", index);
   console.log(" index of _id : "  +index +  "  id is : " + str.slice(index + 5,index + 29));
   idList.push(str.slice(index + 5,index + 29))
  }
  return idList;
}



// validate Email
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}





function inValidateEmployee(){
console.log("interval Called");
Employee.find({ approval: true, permanent: false }, function (err, docs) {
  if (!err) {
      for(var i = 0 ; i < docs.length ; i++){
        let employeeCreatedAt = docs[i].createdAt;
        let current =  new Date();
        if((current - employeeCreatedAt) < 86500000){
          console.log(" employee is valid " + (current - employeeCreatedAt))
        }else{
          console.log(" employee is not valid anymore");
          let newBody = docs[i];
          newBody.approval = false;
          if(newBody.body != null){
            updateRecordInterval(newBody);
          }
        }
      }
  } else {
    console.log(err);
  }
});
}
setInterval(inValidateEmployee,3600000);



module.exports = router;
