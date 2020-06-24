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
  res.set("Access-Control-Allow-Headers", "*");
  Buildingsite.find({
    buildingName: req.body.buildingName
  }).limit(1).then(bdocs => {

    let mappedSites = bdocs[0].buildingSites;
    let buildingSite = [];
    for (var i = 0; i < bdocs[0].buildingSites.length; i++) {
      buildingSite.push(bdocs[0].buildingSites[i].Site[0].siteName);
    }

    let listDetails = {
      _id: bdocs[0]._id,
      locationType: bdocs[0].locationType,
      buildingName: bdocs[0].buildingName,
      country: bdocs[0].country,
      city: bdocs[0].city,
      postalCode: bdocs[0].postalCode,
      locationId: bdocs[0].locationId,
      countryCode: bdocs[0].countryCode,
      buildingSites: buildingSite
    };

    Offices.find({
      buildingName: req.body.buildingName
    }).then(offices => {
      let newOffices = [];
      for (var x = 0; x < offices.length; x++) {
        newOffices.push(offices[x].officeName);
      }
      return newOffices;

    }).then((x) => {
      listDetails.officeNames = x;
      let pair = [];
      Bids.find({
        buildingName: req.body.buildingName
      }).then(BidPair => {
        for (var i = 0; i < BidPair.length; i++) {
          pair.push([BidPair[i].idName, BidPair[i].buildingId, BidPair[i].buildingType]);
        }
        return pair;
      }).then((pair) => {
        listDetails.bIdPairs = pair;
        let jarr = [];
        jarr.push(listDetails);
        Admin.find({
          locationName: req.body.buildingName
        }).then(docs => {
          jarr.push(mappedSites);
          jarr.push(docs);
          res.json(jarr);
        }).catch(err => {
          res.status(400);
          res.send("Admin find error : " + err);
        });
      }).catch(err => {
        res.status(400);
        res.send("buildingId pair fetch error : " + err);
      });
    }).catch(err => {
      res.status(400);
      res.send("Office fetch error : " + err);
    });
  }).catch(err => {
    res.status(400);
    res.send("Building id fetch error :" + err);
  });
});









// partial/full name search
router.post("/searchBuilding", (req, res) => {

  Buildingsite.find({}).select('buildingName').then(bdocs => {
    let jarr = [];
    let st = req.body.searchTerm;
    for (var i = 0; i < bdocs.length; i++) {
      if (bdocs[i].buildingName.includes(st)) {
        jarr.push(bdocs[i].buildingName);
      }
    }

    res.json(jarr);

  }).catch(err => {
    res.status(400);
    res.send(err);
  });

});



// Custom Search Refer to customSearch Function
router.post("/customSearch", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Buildingsite.find({}, {
    locationType: 1,
    buildingName: 1,
    buildingSites: 1,
    _id: 1
  }).then(docs => {
    let idList = customSearch(util.inspect(docs, {
      showHidden: false,
      depth: null
    }), req.body.search, req.body.withinBuilding);

    return idList;
  }).then(idList => {
    console.log(idList);
    Buildingsite.find({
      _id: idList
    }).then(docs => {
      res.send(docs);
      console.log(docs);
    });
  });
});





// global Search
router.post("/search", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Buildingsite.find({
    $text: {
      $search: req.body.searchTerm
    }
  }).exec(function(err, docs) {
    if (err) {
      res.status(400);
      console.log(err)
      res.send("building not found");
    } else {

      console.log(docs.toString())
      res.send(docs);
    }
  });
});






// Add New Administrator
router.post("/addAdmin", (req, res) => {
  const toLow = req.body.buildingName.replace(/ +/g, "");
  const lowBuildingName = toLow.toLowerCase();
  var newAdmin = new Admin();

  newAdmin.username = req.body.username;
  newAdmin.password = req.body.password;
  newAdmin.locationType = req.body.locationType;
  newAdmin.locationName = lowBuildingName;
  newAdmin.locationId = req.body.locationId;
  newAdmin.serviceList = req.body.serviceList;

  if (req.body._id == undefined) {

    console.log("no id");
    newAdmin.save((err, doc) => {
      if (!err) {
        res.send("admin added \n" + newAdmin);
      } else {
        res.status(400);
        res.send("error during insertion: " + err);
      }
    });

  } else {
    console.log("yes id");
    newAdmin._id = req.body._id;
    Admin.findOneAndUpdate({
      _id: req.body._id
    }, newAdmin, {
      new: true
    }, (err, doc) => {
      if (!err) {
        let message = {
          message: "record updated",
          bodyDetail: req.body
        }
        res.json(message);
      } else {
        res.status(400);
        let message = {
          message: "record update failed",
          errMsg: err
        }
        console.log("Error during record update : " + err);
        res.send(message);
      }
    });

  }
});






router.post("/addSuperAdmin", (req, res) => {
  var newAdmin = new SuperAdmin();
  if (validateEmail(req.body.username) && req.body.password.length > 0) {
    newAdmin.username = req.body.username;
    newAdmin.password = req.body.password;

    newAdmin.save((err, doc) => {
      if (!err) {

        let message = {
          message: ""
        }
        res.send("super admin added \n" + newAdmin);
      } else {
        res.status(400);
        res.send("error during insertion: " + err);
      }
    });
  } else {
    res.status(400);
    res.send("error during insertion: email not valid");
  }


});









router.get("/buildingDetailsUnmapped", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    let pair = [];
    Buildingsite.findOne({
      locationId: req.headers.buildingid
    }, (err, docs) => {
      if (!err) {
        var sites1 = [];
        var buildingId = [];
        var newOffices = [];

        for (var i = 0; i < docs.buildingSites.length; i++) {
          sites1 = sites1.concat(docs.buildingSites[i].Site[0].siteName);
        }
        console.log(sites1);
        Bids.find({
          locationId: req.headers.buildingid
        }).then(bds => {
          for (var u = 0; u < bds.length; u++) {
            buildingId[u] = [bds[u].idName, bds[u].buildingId];

          }
          console.log(buildingId);
          return 1;
        }).then(resolved => {

          Offices.find({
            locationId: req.headers.buildingid
          }).then(offices => {
            for (var x = 0; x < offices.length; x++) {
              newOffices.push(offices[x].officeName);
            }
            console.log(newOffices);
            return 1;
          }).then(resolved => {
            let obj3arr = {
              locationType: docs.locationType,
              Sites: sites1,
              BuildingIdPairs: buildingId,
              OfficeNames: newOffices
            }
            res.send(obj3arr);
          });
        });

      } else {
        res.status(400);
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
  let newLocationId = base_64(lowBuildingName, req.body.locationType, req.body.country, req.body.city, req.body.postalCode);


  Buildingsite.find({
    buildingName: lowBuildingName,
    locationType: req.body.locationType,
    country: req.body.country,
    city: req.body.city,
    postalCode: req.body.postalCode
  }).limit(1).then(bdocs => {
    if (bdocs.length > 0) {
      reason = reason + "Building Name : " + bdocs[0].buildingName + " already exists in " + req.body.city;
    }

    Bids.find({
      buildingId: req.body.buildingId
    }).then(docs => {
      if (docs.length > 0) {
        if (reason.length > 0) {
          reason = reason + ", "
        }
        reason = reason + "  matching buildingId already exists : ";
        for (var i = 0; i < docs.length; i++) {
          if (i == 0) {
            reason = reason + " " + docs[i].buildingId;
          } else {
            reason = reason + ", " + docs[i].buildingId;
          }
        }
        return reason;
      } else {
        return "";
      }
    }).then(uniqueBuildingIds => {
      if (uniqueBuildingIds.length == 0) {

        console.log("all sites are unique");
        for (i = 0; i < req.body.Sites.length; i++) {
          let bsite = {
            Site: [{
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
        newBuilding.country = req.body.country;
        newBuilding.city = req.body.city;
        newBuilding.postalCode = req.body.postalCode;
        newBuilding.buildingName = lowBuildingName;
        newBuilding.locationType = req.body.locationType;
        newBuilding.buildingSites = arrSites;
        newBuilding.countryCode = req.body.countryCode;
        newBuilding.locationId = newLocationId;


        var newBids = new Bids();
        let bidsArray = [];
        for (var i = 0; i < req.body.buildingId.length; i++) {
          var temp = {
            buildingName: lowBuildingName,
            buildingId: req.body.buildingId[i],
            idName: req.body.idName[i],
            buildingType: req.body.buildingType[i],
            locationId: newLocationId
          };
          bidsArray.push(temp);
        }


        if (
          lowBuildingName &&
          req.body.locationType &&
          req.body.Sites.length &&
          req.body.buildingType.length == req.body.buildingId.length &&
          req.body.buildingId.length == req.body.idName.length &&
          req.body.country && req.body.city && req.body.postalCode && newLocationId
        ) {



          if (req.body.locationType != "residential") {
            var newOffices = new Offices();
            let officeArray = [];
            for (var i = 0; i < req.body.offices.length; i++) {
              var temp = {
                officeName: req.body.offices[i],
                buildingName: lowBuildingName,
                locationId: newLocationId
              };
              officeArray.push(temp);
            }

            Offices.collection.insert(officeArray, {
              ordered: false
            }, function(
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





          newBuilding.save((err, doc) => {
            if (!err) {
              resultHolder = resultHolder + " New Building Added ,  ";
            } else {
              console.log("error during record insertion : " + err);
            }
          });


          Bids.collection.insert(bidsArray, {
            ordered: false
          }, function(err, docs) {
            if (err) {
              console.error(err);
            } else {
              console.log("Bids : Multiple documents inserted to Collection");
              resultHolder = resultHolder + "  Building id sets added ,  ";
            }
          });

          //    res.send("buildingid : " + base_64(lowBuildingName, req.body.locationType, req.body.country, req.body.city, req.body.area) + " \n " + resultHolder);
          let responseArr = {
            message: "successful insertion",
            authHeader: newLocationId
          };
          res.send(responseArr);
          console.log(resultHolder);
        } else {
          res.status(400);
          res.send("Error during insertion : " + " essential field/s missing check location type, building name, country code etc ; ensure that buildingID.length == idName.length == buildingType.length and try again");
        }
      } else {
        res.status(400);
        res.send("error : " + reason);
      }
    });
  });
});









// Add New Building + ( offices and buildingId ==> localName pairs)
router.post("/updateBuilding", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");


  let reason = "";
  let constLocationId = req.body.locationId;
  Buildingsite.findOne({
    locationId: constLocationId
  }).then(bdocs => {
    //  constLocationId = bdocs.locationId;
    if (bdocs.buildingSites.length > 0) {
      return bdocs.buildingSites;
    } else {
      return [];
    }
  }).then((arrSites) => {

    //  let arrSites = [];
    for (i = 0; i < req.body.Sites.length; i++) {
      let siteInstance = {
        Site: [{
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
      for (var s = 0; s < arrSites.length; s++) {
        console.log(siteInstance.Site[0].siteName + "    " + arrSites[s].Site[0].siteName);
        if (siteInstance.Site[0].siteName == arrSites[s].Site[0].siteName) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        arrSites.push(siteInstance);
      }
    }




    let newBuilding = new Buildingsite();
    const toLow = req.body.buildingName.replace(/ +/g, "");
    const lowBuildingName = toLow.toLowerCase();
    newBuilding.country = req.body.country;
    newBuilding.city = req.body.city;
    newBuilding.postalCode = req.body.postalCode;
    newBuilding.buildingName = lowBuildingName;
    newBuilding.locationType = req.body.locationType;
    newBuilding.buildingSites = arrSites;
    newBuilding.locationId = constLocationId;
    newBuilding.countryCode = req.body.countryCode;



    var newBids = new Bids();
    let bidsArray = [];
    for (var i = 0; i < req.body.buildingId.length; i++) {
      var temp = {
        buildingName: lowBuildingName,
        buildingId: req.body.buildingId[i],
        idName: req.body.idName[i],
        locationId: constLocationId,
        buildingType: req.body.buildingType[i]
      };
      bidsArray.push(temp);
    }



    if (req.body._id != undefined) {



      if (lowBuildingName &&
        req.body.locationType &&
        req.body.Sites.length &&
        req.body.buildingType.length == req.body.buildingId.length &&
        req.body.buildingId.length == req.body.idName.length &&
        req.body.country && req.body.city && req.body.postalCode
      ) {

        newBuilding._id = req.body._id;


        Bids.find({
          buildingId: req.body.buildingId,
          locationId: {
            $ne: constLocationId
          }
        }).then(docs => {
          if (docs.length > 0) {
            if (reason.length > 0) {
              reason = reason + ", "
            }
            reason = reason + "  matching buildingId already exists : ";
            for (var i = 0; i < docs.length; i++) {
              if (i == 0) {
                reason = reason + " " + docs[i].buildingId;
              } else {
                reason = reason + ", " + docs[i].buildingId;
              }
            }
            return reason;
          } else {
            return "";
          }
        }).then(uniqueBuildingIds => {
          if (uniqueBuildingIds.length == 0) {

            Buildingsite.findOneAndUpdate({
              _id: req.body._id
            }, newBuilding, {
              new: true
            }, (err, doc) => {
              if (!err) {

                Bids.deleteMany({
                    locationId: constLocationId
                  })
                  .then(result => {
                    console.log(`Deleted ${result.deletedCount} item(s).`)
                    Bids.collection.insert(bidsArray, {
                      ordered: false
                    }, function(err, docs) {
                      if (err) {
                        console.error(err);
                      } else {
                        console.log("Bids : Multiple documents inserted to Collection");
                      }
                    });

                  });


                if (req.body.locationType != "residential") {

                  var newOffices = new Offices();
                  let officeArray = [];
                  for (var i = 0; i < req.body.offices.length; i++) {
                    var temp = {
                      officeName: req.body.offices[i],
                      buildingName: lowBuildingName,
                      locationId: constLocationId
                    };
                    officeArray.push(temp);
                  }

                  Offices.deleteMany({
                      officeName: req.body.offices,
                      buildingName: lowBuildingName
                    })
                    .then(result => {
                      console.log(`Deleted ${result.deletedCount} item(s).`)
                      Offices.collection.insert(officeArray, {
                        ordered: false
                      }, function(err, docs) {
                        if (err) {
                          console.log("office error");
                          console.error(err);
                        } else {
                          console.log("Multiple documents inserted to Collection");
                        }
                      });
                    })
                    .catch(err => console.error(`Delete failed with error: ${err}`))
                }

                let responseArr = {
                  message: "successful insertion",
                  authHeader: constLocationId
                };
                res.send(responseArr);
              } else {
                res.status(400);
                res.send(err);
              }
            });
          } else {
            res.status(400);
            res.send("Error during insertion : " + reason);
          }
        });

      } else {
        res.status(400);
        res.send("Error during insertion : " + " essential field/s missing check location type, building name, country code etc ; ensure that buildingID.length == idName.length == buildingType.length and try again");
      }
    } else {
      res.status(400);
      res.send(" you must include _id in order to update");
    }

  });
});









// Add New Site / Update Existing (local Names will be supplied instead of building Ids)
router.post("/AddSiteByName", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let buildingIdList = [];
  let localList = req.body.Site[1].buildingId;
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    console.log("bName  : " + bName + "  " + " Local list " + localList);
    Bids.find({
      locationId: req.headers.buildingid,
      buildingId: localList
    }).then(docs => {
      for (var i = 0; i < docs.length; i++) {
        buildingIdList.push(docs[i].buildingId);
      }
      console.log(buildingIdList);

      if (buildingIdList.length == 0) {
        throw new Error("local name => buildingId   pair not found");
      }
      return buildingIdList;

    }).then(buildingIdList => {

      req.body.Site[1].buildingId = buildingIdList;
      Buildingsite.find({
          locationId: req.headers.buildingid
        },
        null, {
          sort: {
            'date': -1
          },
          limit: 1
        }, (err, docs) => {
          if (!err) {
            if (docs.length == 0) {
              res.status(400);
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
                  if (docs[0].buildingSites[i].Site[0].siteName == req.body.Site[0].siteName) {
                    index = i;
                    earr = docs[0].buildingSites[i];
                    break;
                  }
                }


                let buildingIdOriginal = [];
                for (var i = 0; i < docs[0].buildingSites.length; i++) {
                  if (docs[0].buildingSites[i].Site[0].siteName != req.body.Site[0].siteName) {
                    buildingIdOriginal = buildingIdOriginal.concat(docs[0].buildingSites[i].Site[1].buildingId);
                  }
                }

                let bidSet = new Set(buildingIdOriginal);
                console.log(buildingIdOriginal);
                console.log(bidSet);

                let overlap = false;
                for (var i = 0; i < newBuildingID.length; i++) {
                  if (bidSet.has(newBuildingID[i])) {
                    overlap = true;
                    res.status(400);
                    res.send(newBuildingID[i] + " is overlapping with another site.");
                    break;
                  }
                }

                if (!overlap) {
                  earr.Site[1].buildingId = newBuildingID;
                  earr.Site[2].OfficeNames = newOfficeName;
                  var arr = [];
                  arr = docs[0].buildingSites;
                  arr[index] = earr;
                  docs[0].buildingSites = arr;
                  newDoc = docs[0];
                  addSite(docs[0]._id, newDoc, res);
                }
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
                  res.status(400);
                  res.send(
                    "Building ID already exists in a different building or site, Enter unique ID or contact KONE "
                  );
                }
              }
            }
          } else {
            res.status(400);
            res.send(err);
          }
        });

    }).catch(err => {
      res.status(400);
      res.send(err);
    })
  }
});







router.post("/userEmailSmtp", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    let mail = req.body.officeEmail;


    async function mailer() {
      let testAccount = await nodemailer.createTestAccount();

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "eudsmtp.konenet.com",
        port: 25,
        secure: false,
        auth: {
          user: "karthik.rsingh@kone.com",
          pass: "xxx",
        },
      });

      let info = await transporter.sendMail({
        from: 'karthik.rsingh@kone.com', // sender address
        to: "karthik.rsingh@kone.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      res.send("email sent");

    }

    mailer();

  }
});









router.post("/userEmail", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    let mail = req.body.officeEmail;
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'whatsapp2backend@gmail.com',
        pass: process.env.EMAILPASS
      }
    });

    var mailOptions = {
      from: 'WB_Karthik@gmail.com',
      to: mail,
      subject: 'Your building access request has been approved',
      text: 'You now have access to services in kosmoone.',
      html: '<div style="background-color: rgba(37 ,211, 102 , 0.7); border-radius: 25px; " ><h1 style = "padding-left : 20px;  padding-top : 10px; " > Request Granted !</h1><p style = "font-size:20px; font-weight: bold; padding-bottom : 9px;  padding-left : 20px;"> Hello ' + req.body.fullName + ', you now have access to services at ' + bName.toUpperCase() + '.</p></div>'
    };

    transporter.sendMail(mailOptions, function(error, info) {
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
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Bids.find({
      locationId: req.headers.buildingid
    }, (err, docs) => {
      if (!err) {
        res.json(docs);
      } else {
        res.status(400);
        res.send(err);
        console.log(err);
      }
    });
  }
});



//on Page Load
router.post("/onPageLoad", (req, res) => {
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Buildingsite.find({
      locationId: req.headers.buildingid
    }, (err, docs) => {
      if (err) {
        res.status(400);
        res.send("building not found");
      } else {
        res.send(docs);
      }
    });
  }
});



// Delete existing Site of a building
router.post("/deleteSite", (req, res) => {
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    res.set("Access-Control-Allow-Headers", "*");
    Buildingsite.findOne({
      locationId: req.headers.buildingid
    }, (err, docs) => {
      if (!err) {
        if (docs.length == 0) {
          res.status(400);
          res.send("building not found");
        } else {
          var index = -1;
          for (var i = 0; i < docs.buildingSites.length; i++) {
            if (docs.buildingSites[i].Site[0].siteName == req.body.siteName) {
              index = i;
              break;
            }
          }
          if (index >= 0) {
            var arr = [];
            arr = docs.buildingSites;
            arr.splice(index, 1);
            docs.buildingSites = arr;
            newDoc = docs;
            addSite(docs._id, newDoc, res);
          } else {
            res.status(400);
            res.send(" Site not found");
          }
        }
      } else {
        res.status(400);
        res.send(err);
        console.log(err);
      }
    });
  }
});





// Add New Site
router.post("/addSite", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Buildingsite.find({
        locationId: req.headers.buildingid
      },
      null, {
        sort: {
          'date': -1
        },
        limit: 1
      }, (err, docs) => {
        if (!err) {
          if (docs.length == 0) {
            res.status(400);
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
                res.status(400);
                res.send(
                  "Building ID already exists in a different building or site, Enter unique ID or contact KONE "
                );
              }
            }
          }
        } else {
          res.status(400);
          res.send(err);
        }
      });
  }
});




router.post("/listEmployeeSite", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Employee.find({
    sites: req.body.site
  }, function(err, docs) {
    if (!err) {
      res.json(docs);
    } else {
      res.status(400);
      res.send(err);
      console.log(err);
    }
  });
});




// List offices in a particular building
router.post("/Office", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    var officeName = req.body.officeName;
    Buildingsite.find({
        locationId: req.headers.buildingid
      },
      null, {
        sort: {
          'date': -1
        },
        limit: 1
      }, (err, docs) => {
        if (!err) {
          var arr = [];
          for (var i = 0; i < docs[0].buildingSites.length; i++) {
            for (var s = 0; s < docs[0].buildingSites[i].Site[2].OfficeNames.length; s++) {
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
          res.status(400);
          res.send(err);
          console.log(err);
        }
      });
  }
});




//List office IDs of a building
router.get("/listOfficeId", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    let buildingIdList = [];
    let arrbid = [];
    Buildingsite.find({
        locationId: req.headers.buildingid
      },
      null, {
        sort: {
          'date': -1
        },
        limit: 1
      }, (err, docs) => {
        if (!err) {
          for (var i = 0; i < docs[0].buildingSites.length; i++) {
            console.log(docs[0].buildingSites[i].Site[1].buildingId);
            arrbid = arrbid.concat(docs[0].buildingSites[i].Site[1].buildingId);
            buildingIdList = (docs[0].buildingSites[i].Site[1].buildingId);
          }


          console.log(arrbid)
          let pair = [];
          Bids.find({
            locationId: req.headers.buildingid,
            buildingId: arrbid
          }).then(bds => {
            console.log(bds);
            console.log("\n");
            let flag;
            for (var i = 0; i < arrbid.length; i++) {
              flag = false;
              for (var s = 0; s < bds.length; s++) {
                if (arrbid[i] == bds[s].buildingId) {
                  pair[i] = [arrbid[i], bds[s].idName];
                  flag = true;
                }
              }
              if (flag == false) {
                pair[i] = [arrbid[i], "id Not Mapped yet"];
              }
            }
            return pair
          }).then(pair => {
            var arr = [];
            for (var i = 0; i < docs[0].buildingSites.length; i++) {


              for (var s = 0; s < docs[0].buildingSites[i].Site[2].OfficeNames.length; s++) {
                console.log(docs[0].buildingSites[i].Site[1].buildingId);
                let finalPair = [];

                for (var u = 0; u < docs[0].buildingSites[i].Site[1].buildingId.length; u++) {
                  for (var x = 0; x < pair.length; x++) {
                    if (pair[x][0] == docs[0].buildingSites[i].Site[1].buildingId[u]) {
                      finalPair.push(pair[x]);
                      break;
                    }
                  }
                }


                var obj = {
                  OfficeName: docs[0].buildingSites[i].Site[2].OfficeNames[s],
                  Office_SiteAccess: docs[0].buildingSites[i].Site[0].siteName,
                  Office_LocalName: finalPair
                };
                arr.push(obj);
              }
            }
            res.json(arr);

          });




        } else {
          res.status(400);
          res.send(err);
          console.log(err);
        }
      });
  }
});









//List office IDs of a building
router.get("/listOfficeBlock", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Buildingsite.findOne({
      locationId: req.headers.buildingid
    }, (err, docs) => {
      if (!err) {
        if (docs.locationType == "office") {

          let officeBuildingId = new Map();
          let officeSitesId = new Map();
          for (var i = 0; i < docs.buildingSites.length; i++) {
            for (var s = 0; s < docs.buildingSites[i].Site[2].OfficeNames.length; s++) {
              if (officeBuildingId.has(docs.buildingSites[i].Site[2].OfficeNames[s])) {
                officeBuildingId.set(docs.buildingSites[i].Site[2].OfficeNames[s], officeBuildingId.get(docs.buildingSites[i].Site[2].OfficeNames[s]).concat(docs.buildingSites[i].Site[1].buildingId));
                officeSitesId.set(docs.buildingSites[i].Site[2].OfficeNames[s], officeSitesId.get(docs.buildingSites[i].Site[2].OfficeNames[s]).concat(docs.buildingSites[i].Site[0].siteName));
              } else {
                officeBuildingId.set(docs.buildingSites[i].Site[2].OfficeNames[s], docs.buildingSites[i].Site[1].buildingId);
                officeSitesId.set(docs.buildingSites[i].Site[2].OfficeNames[s], [docs.buildingSites[i].Site[0].siteName]);
              }
            }
          }

          //  console.log(officeSitesId);

          let jsonResponse = {
            locationType: docs.locationType
          };
          let arrList = [];

          for (let [key, value] of officeBuildingId) {
            console.log(key + "  " + value);
            let jarr = {
              officeName: key,
              buildingId: value
            }
            arrList.push(jarr);
          }

          let x = 0;
          for (let [key, value] of officeSitesId) {
            arrList[x].sites = value;
            x++;
          }


          jsonResponse.officeGroup = arrList;
          res.send(jsonResponse);

        } else if (docs.locationType == "residential") {

          Buildingsite.findOne({
            locationId: req.headers.buildingid
          }, (err, docs) => {

            let jsonResponse = {
              locationType: docs.locationType
            };

            let arrList = [];
            for (var i = 0; i < docs.buildingSites.length; i++) {
              console.log(docs.buildingSites[i]);

              let siteElement = {
                siteName: docs.buildingSites[i].Site[0].siteName,
                buildingId: docs.buildingSites[i].Site[1].buildingId
              }
              arrList.push(siteElement);
            }

            jsonResponse.flatGroup = arrList;
            res.send(jsonResponse);

          });



        }

      } else {
        res.status(400);
        res.send(err);
        console.log(err);
      }
    });
  }
});









// List (1)Location And Office Names
router.get("/listLocationAndOfficeName", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Buildingsite.find({
        locationId: req.headers.buildingid
      },
      null, {
        sort: {
          'date': -1
        },
        limit: 1
      }, (err, docs) => {
        if (!err) {
          var arr = [];
          for (var i = 0; i < docs[0].buildingSites.length; i++) {
            for (var s = 0; s < docs[0].buildingSites[i].Site[2].OfficeNames.length; s++) {
              var obj = docs[0].buildingSites[i].Site[2].OfficeNames[s];
              arr.push(obj);
            }
          }
          let toSend = {
            locationType: docs[0].locationType,
            officeNames: arr
          };

          res.json(toSend);

        } else {
          res.status(400);
          res.send(err);
          console.log(err);
        }
      });
  }
});






// List all buildingIds of a particular building
router.get("/listBuildingId", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  console.log("header is : " + req.headers.buildingid)
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Buildingsite.find({
        locationId: req.headers.buildingid
      },
      null, {
        sort: {
          'date': -1
        },
        limit: 1
      }, (err, docs) => {
        if (!err) {
          var arr = [];
          for (var i = 0; i < docs[0].buildingSites.length; i++) {
            console.log(docs[0].buildingSites[i].Site[1].buildingId);
            arr = arr.concat(docs[0].buildingSites[i].Site[1].buildingId);
          }
          res.json(arr);
        } else {
          res.status(400);
          res.send(err);
          console.log(err);
        }
      });
  }
});






// List Offices of a Building
router.get("/listOffice", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    var arr = [];
    var officeArr = [];
    async function origanalList() {
      Buildingsite.find({
          locationId: req.headers.buildingid
        },
        null, {
          sort: {
            'date': -1
          },
          limit: 1
        }, (err, docs) => {
          if (!err) {
            for (var i = 0; i < docs[0].buildingSites.length; i++) {
              arr = arr.concat(docs[0].buildingSites[i].Site[2].OfficeNames);
            }
            arr = arr.concat(officeArr);
            arr = [...new Set(arr)];
            res.json(arr);
          } else {
            res.status(400);
            res.send(err);
          }
        });
    }
  }

  function getOfficeList(callback) {
    Offices.find({
      locationId: req.headers.buildingid
    }, (err, docs) => {
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
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Buildingsite.find({
        locationId: req.headers.buildingid
      },
      null, {
        sort: {
          'date': -1
        },
        limit: 1
      }, (err, docs) => {
        if (!err) {
          console.log("complete doc shown to user");

          var arr = [];
          for (var i = 0; i < docs[0].buildingSites.length; i++) {
            console.log(docs[0].buildingSites[i].Site[0].siteName);
            arr.push(docs[0].buildingSites[i].Site[0].siteName);
          }
          res.json(arr);
        } else {
          res.status(400);
          res.send(err);
          console.log(err);
        }
      });
  }
});






// list 1 Building Detail
router.get("/buildingDetails", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    let pair = [];
    Buildingsite.find({
        locationId: req.headers.buildingid
      },
      null, {
        sort: {
          'date': -1
        },
        limit: 1
      }, (err, docs) => {
        if (!err) {

          var arr = [];
          var buildingSet = [];
          for (var i = 0; i < docs[0].buildingSites.length; i++) {
            buildingSet[i] = docs[0].buildingSites[i].Site[1].buildingId;
            arr = arr.concat(docs[0].buildingSites[i].Site[1].buildingId);
          }
          console.log(arr)
          console.log(buildingSet)


          Bids.find({
            locationId: req.headers.buildingid,
            buildingId: arr
          }).then(bds => {
            console.log(bds);
            console.log("\n");
            let flag;
            for (var i = 0; i < arr.length; i++) {
              flag = false;
              for (var s = 0; s < bds.length; s++) {
                if (arr[i] == bds[s].buildingId) {
                  pair[i] = [arr[i], bds[s].idName];
                  flag = true;
                }
              }
              if (flag == false) {
                pair[i] = [arr[i], "id Not Mapped yet"];
              }
            }
            return pair;
          }).then(pair => {

            let pairSet = [];
            for (var u = 0; u < docs[0].buildingSites.length; u++) {
              pairSet = [];
              for (var x = 0; x < docs[0].buildingSites[u].Site[1].buildingId.length; x++) {
                console.log(docs[0].buildingSites[u].Site[1].buildingId[x]);
                for (var t = 0; t < pair.length; t++) {
                  if (docs[0].buildingSites[u].Site[1].buildingId[x] == pair[t][0]) {
                    pairSet.push(pair[t]);
                    break;
                  }
                }
              }
              docs[0].buildingSites[u].Site[1].buildingId = pairSet;
              console.log("\n")
            }


            let sites1 = [];
            for (var tar = 0; tar < docs[0].buildingSites.length; tar++) {
              sites1 = sites1.concat(docs[0].buildingSites[tar].Site[0].siteName);
            }
            let bidspair = [];
            for (var tar = 0; tar < docs[0].buildingSites.length; tar++) {
              bidspair = bidspair.concat(docs[0].buildingSites[tar].Site[1].buildingId);
            }

            let olist = [];
            for (var tar = 0; tar < docs[0].buildingSites.length; tar++) {
              olist = olist.concat(docs[0].buildingSites[tar].Site[2].OfficeNames);
            }

            let obj3arr = {
              Sites: sites1,
              BuildingIdPair: bidspair,
              Offices: olist
            }
            res.json(obj3arr);

          });

        } else {
          res.status(400);
          res.send(err);
          console.log(err);
        }
      });
  }
});




// create New Office
router.post("/createOffice", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    if (req.body._id == null) {
      console.log("inserting new record");
      insertOffice(req, res, bName, req.headers.buildingid);
    } else {
      res.status(400);
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
      res.status(400);
      res.send(err);
      console.log(err);
    }
  });
});







// List Approved and Visitor status
router.get("/listApprovedVisitor", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");

  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Employee.find({
      approval: true,
      permanent: false,
      locationId: req.headers.buildingid
    }, function(err, docs) {
      // expiry date
      // current date
      if (!err) {
        console.log("approved doc shown to user");
        res.json(docs);
      } else {
        res.status(400);
        res.send(err);
        console.log(err);
      }
    });
  }
});




// list Approved and permanent
router.get("/listApprovedPermanent", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Employee.find({
      approval: true,
      permanent: true,
      locationId: req.headers.buildingid
    }, function(err, docs) {
      if (!err) {
        console.log("approved Permanent doc shown to user");
        res.json(docs);
      } else {
        res.status(400);
        res.send(err);
        console.log(err);
      }
    });
  }
});





//list all approved users
router.get("/listApproved", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Employee.find({
    locationId: req.headers.buildingid,
    approval: true
  }, function(err, docs) {
    if (!err) {
      console.log("approved doc shown to user");
      res.json(docs);
    } else {
      res.status(400);
      res.send(err);
      console.log(err);
    }
  });
});





//list all unapproved  and visitor status users
router.get("/listArchived", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Employee.find({
      locationId: req.headers.buildingid,
      archived: true
    }, function(err, docs) {
      if (!err) {
        console.log("complete doc shown to user");
        res.json(docs);
      } else {
        res.status(400);
        res.send(err);
        console.log(err);
      }
    });
  }
});



//list all unapproved  and visitor status users
router.get("/listUnapprovedVisitor", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Employee.find({
      approval: false,
      permanent: false,
      locationId: req.headers.buildingid,
      archived: false
    }, function(err, docs) {
      if (!err) {
        console.log("complete doc shown to user");
        res.json(docs);
      } else {
        res.status(400);
        res.send(err);
        console.log(err);
      }
    });
  }
});





// list UnApproved And Permanent
router.get("/listUnapprovedPermanent", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Employee.find({
      approval: false,
      permanent: true,
      locationId: req.headers.buildingid
    }, function(err, docs) {
      if (!err) {
        console.log("complete doc shown to user");
        res.json(docs);
      } else {
        res.status(400);
        res.send(err);
        console.log(err);
      }
    });
  }
});





// List all Unapproved
router.get("/listUnapproved", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    Employee.find({
      approval: false,
      locationId: req.headers.buildingid
    }, function(err, docs) {
      if (!err) {
        console.log("complete doc shown to user");
        res.json(docs);
      } else {
        res.status(400);
        res.send(err);
        console.log(err);
      }
    });
  }
});





//delete record
router.get("/delete/:id", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
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
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
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
  let bName = req.headers.buildingid != undefined ? to_ascii(res, req.headers.buildingid) : to_ascii(res, "");
  if (bName != -1) {
    let employeeArray = req.body.arr;
    for (var i = 0; i < employeeArray.length; i++) {
      employeeArray[i].buildingName = bName;
      employeeArray[i].archived = false;
      employeeArray[i].createdAt = new Date();
      employeeArray[i].locationId = req.headers.buildingid;


      if (employeeArray[i].sessionId == undefined) {
        if (employeeArray[i].buildingId.length == 0) {
          employeeArray[i].sessionId = "Not mapped yet";
        } else {
          employeeArray[i].sessionId = employeeArray[i].buildingId[0].name;
        }
      }

    }
    console.log("employee Array inserted");
    console.log(employeeArray);
    Employee.collection.insert(employeeArray, {
      ordered: false
    }, function(
      err,
      docs
    ) {
      if (err) {
        console.error(err);
        res.status(400);
        res.send(err);
      } else {
        res.send("Multiple employees inserted to Collection");
      }
    });
  }
});





//check if admin username and password is correct
router.post("/check", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Admin.find({
      username: req.body.username,
      password: req.body.password
    },
    (err, docs) => {
      if (err) {
        res.status(400);
        res.send(err);
      } else if (docs[0] == undefined) {
        res.status(400);
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
  SuperAdmin.find({
      username: req.body.username,
      password: req.body.password
    },
    (err, docs) => {
      if (err) {} else if (docs[0] == undefined) {
        res.status(400);
        res.json({
          message: "user not valid",
          valid: false
        });
      } else {
        console.log(docs[0]);
        var valid = {
          message: "user is valid",
          valid: true
        };

        res.json(valid);
      }
    }
  );
});







// Check if Phone number exists in employee DataBase
router.post("/checkPhone", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Employee.exists({
    phone: req.body.phone
  }, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Exist " + result);
      const valid = {
        exists: result
      };
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
  Employee.find({
    phone: str
  }, function(err, docs) {
    if (!err) {
      console.log(docs);
      if (docs.length != 0) {
        req.body = docs[0];
        ordByPhone(req, res);
      } else {
        res.status(400);
        res.send("number was not found");
      }
    } else {
      res.status(400);
      res.send(err);
      console.log(err);
    }
  });
});





router.post("/test123", (req, res) => {
  res.set("Access-Control-Allow-Headers", "*");
  Bids.find({
    buildingId: ["bhi0", "bhi2"]
  }).then(bidPair => {
    console.log(bidPair);
    let arr = [];
    for (var i = 0; i < bidPair.length; i++) {
      let temp = {
        name: bidPair[i].buildingId,
        localName: bidPair[i].idName
      }
      arr.push(temp);
    }
    let resp = {}
    resp.buildingId = arr;
    res.send(resp);
  }).catch(error => {
    res.status(400);
    res.send(error);
  })

});







// Insert New Office
function insertOffice(req, res, bName, locationId) {
  var office = new Offices();
  office.officeName = req.body.officeName;
  office.buildingName = bName;
  office.locationId = locationId;
  office.save((err, doc) => {
    if (!err) {
      console.log("office added");
      res.send("office added \n" + office);
    } else {
      console.log("error during record insertion : " + err);
      res.status(400);
      res.send("error during record insertion : " + err);
    }
  });
}



//

//
// Insert Employee Record Function
function insertRecord(req, res) {

  var employee = new Employee();


  Bids.find({
    buildingId: req.body.buildingId
  }).then(bidPair => {
    console.log(bidPair);
    let idNamePair = [];
    for (var i = 0; i < bidPair.length; i++) {
      let temp = {
        name: bidPair[i].buildingId,
        localName: bidPair[i].idName
      }
      idNamePair.push(temp);
    }

    let sessionIdHolder;
    if (req.body.sessionId != undefined) {
      sessionIdHolder = req.body.sessionId;
    } else {
      if (req.body.buildingId.length == 0) {
        sessionIdHolder = "Not mapped yet";
      } else {
        sessionIdHolder = req.body.buildingId[0].name;
      }
    }
    employee.fullName = req.body.fullName;
    employee.office = req.body.office;
    employee.officeEmail = req.body.officeEmail;
    //  employee.buildingId = req.body.buildingId;
    employee.buildingId = idNamePair;
    employee.sites = req.body.sites;
    employee.eId = req.body.eId;
    employee.phone = req.body.phone;
    employee.approval = req.body.approval;
    employee.terms = req.body.terms;
    employee.allowMessaging = req.body.allowMessaging;
    employee.permanent = req.body.permanent;
    employee.sessionId = sessionIdHolder;
    employee.archived = false;
    employee.locationId = req.headers.buildingid;
    employee.buildingName = req.body.buildingName;
    employee.createdAt = new Date();

    let isValid = true;
    let hardExpiryDate = new Date();
    hardExpiryDate.setDate(hardExpiryDate.getDate() + 1);
    if (req.body.permanent = false) {
      if (req.body.expiresAt == undefined) {
        employee.expiresAt = hardExpiryDate;
      } else {
        employee.expiresAt = req.body.expiresAt;
      }
    }


    if (isValid) {
      employee.save((err, doc) => {
        if (!err) {
          console.log("New employee created");
          if (req.body.office != null) {
            res.send("employee created ");
          } else {
            res.status(400);
            res.send("employee not created ");
          }
        } else {
          console.log("error during record insertion : " + err);
          res.status(400);
          res.send("error during record insertion : " + err);
        }
      });
    } else {
      res.send("visitors require expiration date");
    }

  }).catch(error => {
    res.status(400);
    res.send(error);
  });


}




// Update existing Record
function updateRecord(req, res) {


  Bids.find({
    buildingId: req.body.buildingId
  }).then(bidPair => {
    console.log(bidPair);
    let idNamePair = [];
    for (var i = 0; i < bidPair.length; i++) {
      let temp = {
        name: bidPair[i].buildingId,
        localName: bidPair[i].idName
      }
      idNamePair.push(temp);

    }
    req.body.buildingId = idNamePair;
    if (validateEmail(req.body.officeEmail)) {
      if (req.body.sessionId == undefined) {
        if (req.body.buildingId.length == 0) {
          req.body.sessionId = "Not mapped yet";
        } else {
          req.body.sessionId = req.body.buildingId[0].name;
        }
      }

      Employee.findOneAndUpdate({
        _id: req.body._id
      }, req.body, {
        new: true
      }, (err, doc) => {
        if (!err) {
          res.send("record updated with  \n" + JSON.stringify(req.body));
        } else {
          if (err.name == "ValidationError") {
            res.status(400);
            res.send("validation error " + err);
          } else {
            res.status(400);
            res.send("Error during record update : " + err);
          }
        }
      });
    } else {
      res.status(400);
      res.send("invalid email");
      console.log("invalid email");
    }

  }).catch(error => {
    res.status(400);
    res.send(error);
  });

}




function updateRecordByPhone(req, res) {
  req.body.apporval = true;
  if (validateEmail(req.body.officeEmail)) {
    Employee.findOneAndUpdate({
        _id: req.body._id
      },
      req.body, {
        new: true
      },
      (err, doc) => {
        if (!err) {
          let message = {
            message: "Phone was validated",
            buildingId: req.body.buildingId
          }
          res.json(message);
        } else {
          if (err.name == "ValidationError") {
            res.status(400);
            console.log("volidation error");
            res.send("validation error " + err);
          } else {
            res.status(400);
            console.log("Error during record update : " + err);
            res.send("Error during record update : " + err);
          }
        }
      }
    );
  } else {
    res.status(400);
    res.send("invalid email");
    console.log("invalid email");
  }
}






function updateRecordInterval(req) {
  Employee.findOneAndUpdate({
    _id: req.body._id
  }, req.body, {
    new: true
  }, (err, doc) => {
    if (!err) {
      console.log("Record Updated");
    } else {
      if (err.name == "ValidationError") {
        console.log("volidation error");
      } else {
        console.log("Error during record update : " + err);
      }
    }
  });
}






// add / Update Existing Site
function addSite(id, newDoc, res) {
  Buildingsite.findOneAndUpdate({
      _id: id
    },
    newDoc, {
      new: true
    },
    (err, doc) => {
      if (!err) {
        res.json(newDoc);
      } else {
        if (err.name == "ValidationError") {
          res.status(400);
          res.send("validation error : " + err);
        } else {
          res.status(400);
          console.log("Error during record update : " + err);
          res.send("Error during record update : " + err);
        }
      }
    }
  );
}

// text => base64
//buildingname:buildingtype:buildingcountry:buildingcity:building
//function base_64(str1, str2) {
//  return Buffer.from((str1 + ":" + str2)).toString('base64');
//}

function base_64(buildingName, locationType, buildingCountry, buildingCity, postalCode) {
  return Buffer.from(buildingName + ":" + locationType + ":" + buildingCountry + ":" + buildingCity + ":" + postalCode + ":" + new Date().valueOf()).toString('base64');
}


console.log("bname:office:india:blore:1003456" + new Date().valueOf());
console.log(Buffer.from("bname:office:india:blore:1003456" + new Date()).toString('base64'));

// base64 => text
function to_ascii(res, str) {
  if (str != "") {
    str = Buffer.from(str, 'base64').toString('ascii');
    if (str.includes(":office") || str.includes(":residential")) {
      return str.split(":")[0];
    } else {
      res.status(400).send("buildingid header is not valid");
      return -1;
    }
  } else {
    res.status(400).send("buildingid is missing");
    return -1;
  }
}



// Custom database search function
function customSearch(str, search, withinBuilding) {
  str = str.toLowerCase();
  search = search.toLowerCase();
  let pushIndex = 0;;
  let idHolder;
  while (pushIndex != -1) {
    pushIndex = str.indexOf("_id", pushIndex);
    if (pushIndex == -1) {
      break;
    }
    idHolder = str.slice(pushIndex, pushIndex + 29);
    str = str.slice(0, pushIndex) + str.slice(pushIndex + 30);
    let res = '';
    let insertIndex;
    for (var i = pushIndex;; i++) {
      pushIndex++;
      res = res + str[i];
      if (str[i] == '}') {
        str = str.slice(0, i) + idHolder + str.slice(i);
        break;
      }
    }
  }
  str = str.replace(/(?!i)(?!d)(?!:)[a-zA-Z]*:/g, '');
  console.log(str);
  let idList = [];
  let index = 0;
  while (index != -1) {
    index = str.indexOf(search, index);
    if (index == -1) {
      break;
    }
    console.log(" index of search : " + index + " word is " + str.slice(index, index + search.length));
    index = str.indexOf("_id", index);
    console.log(" index of _id : " + index + "  id is : " + str.slice(index + 5, index + 29));
    idList.push(str.slice(index + 5, index + 29))
  }
  return idList;
}



// validate Email
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}





function inValidateEmployee() {
  console.log("interval Called");
  let currentDate = new Date();
  Employee.updateMany({
      approval: true,
      permanent: false,
      archived: false,
      $where: function() {
        return currentDate > this.expiresAt
      }
    }, {
      $set: {
        archived: true
      }
    },
    function(err, result) {
      if (err) {
        console.log("interval error : " + err);
      } else {
        console.log("interval update sucess : " + result);
      }
    }
  );

}

setInterval(inValidateEmployee, 3600000);



module.exports = router;





// uncoment to inspect result
//    util.inspect(result, {
//      showHidden: false,
//      depth: null
//    })

/*
console.log("date below");
let dat = new Date();
console.log(dat);
dat.setDate(dat.getDate() + 365);
console.log(dat);
console.log(dat > new Date());
*/
/*
function inValidateEmployee() {
  console.log("interval Called");
  Employee.find({
    approval: true,
    permanent: false
  }, function(err, docs) {
    if (!err) {
      for (var i = 0; i < docs.length; i++) {
        let employeeCreatedAt = docs[i].createdAt;
        let current = new Date();
        if ((current - employeeCreatedAt) < 86500000) {
          console.log(" employee is valid " + (current - employeeCreatedAt))
        } else {
          console.log(" employee is not valid anymore");
          let newBody = docs[i];
          newBody.approval = false;
          if (newBody.body != null) {
            updateRecordInterval(newBody);
          }
        }
      }
    } else {
      console.log(err);
    }
  });
}
setInterval(inValidateEmployee, 3600000);


function inValidateEmployee() {
  console.log("interval Called");
  Employee.updateMany({
    approval: true,
    permanent: false,
    archived: false,
    $where: function() {
      return this.createdAt > this.expiresAt
    }
  }, {
    $set: {
      archived: true
    }
  })
}

setInterval(inValidateEmployee, 360000);

*/