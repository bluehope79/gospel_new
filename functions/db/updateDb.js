const express = require('express')
const path = require('path')
const app = express()
const logger = require('morgan')
var Board = require('./model/board')

var mongoose = require('mongoose')
var promise = mongoose.connect('mongodb://soo:fhrmdhs12@ds245532.mlab.com:45532/hymns', {
     
});

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('connected successfully');

  updateDb(316)
})
app.use(logger('dev'))

//app.listen(3003, function() {
//})


function updateDb(startSeq, endSeq) {
  var board = new Board()
  var seq = startSeq
  var updateSeq = seq +1
  console.log('updateDb seq = ' + seq + ', updating Seq = ' + updateSeq)
  //for (var i=startIndex ; i<= ; i++ ) 

  updateData(seq, updateSeq)
}

function updateData(seq, updateSeq) {
  console.log('updateData seq = ' + seq + ', updateSeq = ' + updateSeq)

  return new Promise(function (resolve, reject) {
    Board.findOneAndUpdate({seq: seq}, {$set:{seq: updateSeq}}, function(err, board) {
      if (err){
        console.log(err)
        reject()
      }
      console.log('success update')
      resolve()

    })
  })
}

module.exports = app
