const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const Admin = mongoose.model("admin");
const util = require('util')



// Add New Administrator
router.post("/addAdmin", (req, res) => {
  const toLow = req.body.buildingName.replace(/ +/g, "");
  const lowBuildingName = toLow.toLowerCase();
  base64data = base_64(lowBuildingName, req.body.locationType);
  var newAdmin = new Admin();

  newAdmin.username = req.body.username;
  newAdmin.password = req.body.password;
  newAdmin.locationType = req.body.locationType;
  newAdmin.locationName = lowBuildingName;
  newAdmin.locationId = base64data;
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
        res.send("record updated with  \n" + JSON.stringify(req.body));
      } else {
        res.status(400);
        console.log("Error during record update : " + err);
        res.send("Error during record update : " + err);
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




// validate Email
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}




module.exports = router;