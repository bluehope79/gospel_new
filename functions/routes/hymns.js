var express = require('express')
var router = express.Router();

router.get('/:seq', function (req, res) {
  console.log('hymns');
  res.render('index', {seq: req.params.seq})
})

module.exports = router
