const express = require('express')
const path = require('path')
const app = express()
const logger = require('morgan')
var Board = require('./model/board')
var Board_ori = require('./model/ori_board')

var mongoose = require('mongoose')
var promise = mongoose.connect('mongodb://soo:fhrmdhs12@ds245532.mlab.com:45532/hymns', {
  useNewUrlParser: true   

});

const tmp = "1.홀로 한 분 하나님께 천하만민 경배하라 만국왕을 다스리고 온 세상 만민 기르신다 만국 왕을 다스리고 온 세상 만민 기르신다 2.독생성자 예수님께 모든 죄인 회개하라 세상 만민 구원하고 놀라운 은혜 베푸신다 세상 만민 구원하고 놀라운 은혜 베푸신다 3.보혜사 성령님께 모든 삶을 맡기어라 말씀으로 도우시고 죄악을 이길 힘주신다 말씀으로 도우시고 죄악을 이길 힘주신다"

const numberSeperator = ['2.', '3.', '4.', '5.']

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
  // we're connected!
  console.log('connected successfully');

  for (var i=500; i<646; i++) {
    //await updateReturn(i)
    await removeSpace(i)
  }

})
app.use(logger('dev'))


function removeSpace(seq) {

  return new Promise( function (resolve, reject) {
    Board.find({seq:seq}).then(function(docs) {
      docs.forEach( function (data) {
        var content = data.contents
        var newContent = content.replace(/ /gi, "")
        Board.update({seq: seq}, {"$set": { "contents": newContent}}, function(err, output) {
          if (err) {
            console.err(err)
            reject()
          }
          console.log('output = ' , output)
          resolve()
        })
      })
    })
  })
}


function findAndPutInReturn(text) {
  var result = text 
  for (var i=0 ; i<numberSeperator.length ; i++) {
    var delimeter = numberSeperator[i]
    var index = result.indexOf(delimeter)
    console.log('delimeter = ' + delimeter + ', index = ' + index)
    if (index >= 0) {
      var newText = result.slice(0,index) + '\n\n' + result.slice(index)
      //console.log('newText = ', newText)
      result = newText
    }
  }
  console.log('result = ' + result)
  return result
}


function updateReturn(seq) {
  return new Promise( function (resolve, reject) {
    Board_ori.find({seq:seq}).then(function(docs) {
      docs.forEach( function (data) {
        var content = data.contents
        var newContent = findAndPutInReturn(content)
        Board_ori.update({seq: seq}, {"$set": { "contents": newContent}}, function(err, output) {
          if (err) {
            console.err(err)
            reject()
          }
          resolve()
        })
      })
    })
  })
}



    

/*
function updateOriDB(seq) {

  return new Promise(function (resolve, reject) {
    Board.find({})
    Board.findOneAndUpdate({seq: seq}, {$set:{contents: findAndPutInReturn()}}, function(err, board) {
      if (err){
        console.log(err)
        reject()
      }
      console.log('success update')
      resolve()

    })
  })
}
*/

module.exports = app
