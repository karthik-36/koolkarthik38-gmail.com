const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const Employee = mongoose.model("Employee");
const Admin = mongoose.model("admin");
const Buildingsite = mongoose.model("building");
const Offices = mongoose.model("office");
const Bids = mongoose.model("bids");
//test//

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

  newAdmin.save((err, doc) => {
    if (!err) {
      console.log(" New Administratot added");
      res.send("building added \n" + newAdmin);
    } else {
      console.log("error during record insertion : " + err);
      res.send("error during insertion: " + err);
    }
  });
});

router.post("/addBuilding", (req, res) => {
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
      console.error(err);
      //    res.send(err);
    } else {
      console.log("Multiple documents inserted to Collection");
      //     res.send("Multiple documents inserted to Collection");
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

    res.send("buildingid : " +base_64(req.body.buildingName,req.body.locationType) + " \n " + resultHolder);
    console.log(resultHolder);
  } else {
    res.send("Error during insertion");
  }
});



//  } else {
//    res.set("Access-Control-Allow-Headers", "*");
//      res.send(err);
//      console.log(err);
//    }

router.post("/AddSiteByName", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let buildingIdList = [];
  function showName(){
    console.log("my name is karthik");
  }

  let localList =req.body.Site[1].buildingId;
//  console.log(localList);
  let bName = to_ascii(res,req.headers.buildingid);
  if(bName != -1){
  Bids.find({ buildingName: bName, idName : localList }).then(docs => {
    //  console.log(docs);
    //  showName();
      for(var i = 0 ; i < docs.length ; i++){
        buildingIdList.push(docs[i].buildingId);
      }
       console.log(buildingIdList);

       if(buildingIdList.length == 0){
         throw new Error("local name => buildingId   pair not found");
         //return reject();
       }
      return buildingIdList;

   }).then(buildingIdList =>{

    req.body.Site[1].buildingId = buildingIdList;
//    res.send(req.body);

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

  }).catch( err => {
    let str = '';
    str = str + err;
    console.log(str)
    res.send(str)
  })
}
});


router.get("/buildingIdAndName", (req, res) => {
  let bName = to_ascii(res,req.headers.buildingid);
  if(bName != -1){
  Bids.find({ buildingName: bName }, (err, docs) => {
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
}
});

router.post("/onPageLoad", (req, res) => {
  let bName = to_ascii(res,req.headers.buildingid);
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

router.post("/deleteSite", (req, res) => {
  let bName = to_ascii(res,req.headers.buildingid);
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


router.post("/addSite", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = to_ascii(res,req.headers.buildingid);
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

router.get("/", (req, res) => {
  res.send("empty response");
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

router.post("/Office", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = to_ascii(res,req.headers.buildingid);
  if(bName != -1){
  var officeName = req.body.officeName;
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      console.log("complete doc shown to user");

      var arr = [];
      for (var i = 0; i < docs[0].buildingSites.length; i++) {
        for (
          var s = 0;
          s < docs[0].buildingSites[i].Site[2].OfficeNames.length;
          s++
        ) {
          if (docs[0].buildingSites[i].Site[2].OfficeNames[s] == officeName) {
            var obj = {
              Office_SiteAccess: docs[0].buildingSites[i].Site[0].siteName,
              Office_BuildingAccess:
                docs[0].buildingSites[i].Site[1].buildingId
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

router.get("/listOfficeId", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = to_ascii(res,req.headers.buildingid);
  if(bName != -1){
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      var arr = [];
      for (var i = 0; i < docs[0].buildingSites.length; i++) {
        for (
          var s = 0;
          s < docs[0].buildingSites[i].Site[2].OfficeNames.length;
          s++
        ) {
          var obj = {
            OfficeName: docs[0].buildingSites[i].Site[2].OfficeNames[s],
            Office_SiteAccess: docs[0].buildingSites[i].Site[0].siteName,
            Office_BuildingAccess: docs[0].buildingSites[i].Site[1].buildingId
          };
          arr.push(obj);
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

router.get("/listLocationAndOfficeName", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = to_ascii(res,req.headers.buildingid);
  if(bName != -1){
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      console.log("complete doc shown to user");
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

router.get("/listBuildingId", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  console.log("header is : " +  req.headers.buildingid)
  let bName = to_ascii(res,req.headers.buildingid);
  if(bName != -1){
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
    if (!err) {
      console.log("complete doc shown to user");
      //    var obj = JSON.parse(docs);
      //    console.log(obj.buildingName);
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

router.get("/listOffice", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = to_ascii(res,req.headers.buildingid);
  if(bName != -1){
  var arr = [];
  var officeArr = [];
  function sendJSON() {
    res.send("hello" + arr);
  }
  async function origanalList() {
    console.log("2");
    Buildingsite.find({ buildingName: bName }, (err, docs) => {
      if (!err) {
        console.log("complete doc shown to user");

        for (var i = 0; i < docs[0].buildingSites.length; i++) {
          console.log(docs[0].buildingSites[i].Site[2].OfficeNames);
          arr = arr.concat(docs[0].buildingSites[i].Site[2].OfficeNames);
        }
        console.log("office arr " + officeArr);
        arr = arr.concat(officeArr);
        arr = [...new Set(arr)];
        console.log(arr);
        res.json(arr);
      } else {
        res.send(err);
        console.log(err);
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

router.get("/listSites", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = to_ascii(res,req.headers.buildingid);
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

router.get("/buildingDetails", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = to_ascii(res,req.headers.buildingid);
  if(bName != -1){
  Buildingsite.find({ buildingName: bName }, (err, docs) => {
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
}
});

//return full list
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

router.post("/createOffice", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  if (req.body._id == null) {
    console.log("inserting new record");
    insertOffice(req, res);
  } else {
    res.send("office already exists");
  }
});

router.get("/listApprovedVisitor", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = to_ascii(res,req.headers.buildingid);
  if(bName != -1){
  Employee.find({ approval: true, permanent: false , buildingName : bName }, function (err, docs) {
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

router.get("/listApprovedPermanent", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = to_ascii(res,req.headers.buildingid);
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

//list all unapproved users
router.get("/listUnapprovedVisitor", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = to_ascii(res,req.headers.buildingid);
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

router.get("/listUnapprovedPermanent", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = to_ascii(res,req.headers.buildingid);
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

router.get("/listUnapproved", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Employee.find({ approval: false }, function (err, docs) {
    if (!err) {
      console.log("complete doc shown to user");
      res.json(docs);
    } else {
      res.send(err);
      console.log(err);
    }
  });
});

//delete record
router.get("/delete/:id", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Employee.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.send("record deleted");
    } else {
      console.log("Error in employee delete :" + err);
    }
  });
});

//insert new user / update existing user
router.post("/create", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  if (req.body._id == null) {
    console.log("inserting new record");
    insertRecord(req, res);
  } else {
    console.log("updating existing record");
    updateRecord(req, res);
  }
});

// insert BULK

router.post("/createBulk", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let employeeArray = req.body.arr;
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
      console.log("Multiple documents inserted to Collection");
      res.send("Multiple documents inserted to Collection");
    }
  });
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

function insertOffice(req, res) {
  var office = new Offices();
  office.officeName = req.body.officeName;
  office.buildingName = "kosmoone";
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
  employee.buildingName = req.body.buildingName;
  employee.save((err, doc) => {
    if (!err) {
      console.log("New employee created");
      res.send("employee created \n" + employee);
    } else {
      console.log("error during record insertion : " + err);
      res.send("error during record insertion : " + err);
    }
  });
}

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

function base_64(str1, str2){
return Buffer.from((str1+":"+str2)).toString('base64');
}

function to_ascii(res,str){
if(str != ""){
  str = Buffer.from(str,'base64').toString('ascii');
  if(str.includes(":office") || str.includes(":residential")){
      return str.split(":")[0];
   }else{
       res.send("buildingid header is not valid");
       return -1;
   }
}else{
    res.send("buildingid is missing");
    return -1;
    }
}


function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = router;
