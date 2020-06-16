const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const SuperAdmin = mongoose.model("superadmin");
const util = require('util')



router.post("/addSuperAdmin", (req, res) => {
  var newAdmin = new SuperAdmin();
  if (validateEmail(req.body.username) && req.body.password.length > 0) {
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
  } else {
    res.status(400);
    res.send("error during insertion: email not valid");

  }


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

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}




module.exports = router;