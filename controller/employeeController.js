const express = require('express');
const router = express.Router();
// Login Page
router.get('/', (req,res) => {

  res.send('empty response')

});

router.post('/', (req,res) => {

  res.send('create');
  console.log(req.body);

});




module.exports = router;
