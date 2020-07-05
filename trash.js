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


/*
let options = {
  tls: true,
  tlsCAFile: `/certificate.txt`,
  useUnifiedTopology: true
};
mongoose.connect(process.env.MONGOCREDS, options, {
  useNewUrlParser: true
}, (err) => {
  if (!err) {
    console.log("Connection to db successful");
  } else {
    console.log("DB error : " + err);
  }
});
*/


//const MongoClient = require("mongodb").MongoClient;

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


router.post("/addAdminHash", async (req, res) => {
  const toLow = req.body.buildingName.replace(/ +/g, "");
  const lowBuildingName = toLow.toLowerCase();
  var newAdmin = new Admin();


  let hashedPassword;
  try {
    console.log(req.body.password);
    hashedPassword = await bcrypt.hash(req.body.password.toString(), 10);
  } catch (err) {
    console.log(err);
  }
  console.log(hashedPassword);


  try {
    if (await bcrypt.compare("koffice1", hashedPassword)) {
      console.log("yes yes yes");
      res.send("yes yes yes");
    } else {
      console.log("no no no");
      res.send("no no no");
    }
  } catch (err) {
    console.log(err);
  }


  newAdmin.username = req.body.username;
  newAdmin.password = req.body.password;
  newAdmin.locationType = req.body.locationType;
  newAdmin.locationName = lowBuildingName;
  newAdmin.locationId = req.body.locationId;
  newAdmin.serviceList = req.body.serviceList;

  if (req.body._id == undefined) {

    console.log("no id");

    /*
    newAdmin.save((err, doc) => {
      if (!err) {
        res.send("admin added \n" + newAdmin);
      } else {
        res.status(400);
        res.send("error during insertion: " + err);
      }
    });
    */
  } else {
    console.log("yes id");
    newAdmin._id = req.body._id;

    /*
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
    */
  }
});



*/