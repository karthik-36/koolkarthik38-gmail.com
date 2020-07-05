console.log("Server Start");
const express = require('express');
const bodyparser = require('body-parser');
const logger = require('./helperFunctions/winstonLogger');
require('./models/db');
require('./models/employee.model');
require('./models/admin.model');
require('./models/building.model');
require('./models/office.model');
require('./models/bids.model');
require('./models/superadmin.model');
const employeeController = require('./controller/employeeController');
const buildingController = require('./controller/buildingController');
const adminController = require('./controller/adminController');
const superAdminController = require('./controller/superAdminController');
var app = express();
var cors = require('cors');
app.use(cors());

app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(bodyparser.json());
app.use('/employee', employeeController);
app.use('/building', buildingController);
app.use('/admin', adminController);
app.use('/superAdmin', superAdminController);
//app.use('/users' , require('./routes/users'))
const PORT = process.env.PORT || 5000;
app.listen(PORT, logger.log('info', "server connected to port " + PORT));