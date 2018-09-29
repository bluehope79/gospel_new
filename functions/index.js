const functions = require('firebase-functions');
const express = require('express')
//const firebase = require('firebase-admin')
const bodyParser = require('body-parser')
const app = express()

// dialogflow
const api_credentials = "AIzaSyBMQQkHxrcsbaeznNQYB4z-J64WZd5_Frw";
let sessionId = '6ac7bd60-96a7-11e8-aaf1-2be61153eaa1'
const axios = require('axios')

const googleImage  = require('./http-google')
const bot = require('./bot')

const mongoose = require('mongoose')

const gospelIntent = '찬송가찾기'


 // parse application/json
app.use(bodyParser.json());
  // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// mongoose connect
mongoose.connect('mongodb://soo:fhrmdhs12@ds245532.mlab.com:45532/hymns', {
  useNewUrlParser: true,
})// option)
mongoose.set('useCreateIndex',true)
var db = mongoose.connection
db.on('error', console.error.bind(console, 'mongoose connection error:'))
db.once('open', function() {
  console.log('Connected to mongodb server')
  //getGospelLyrics()
})

var Board = require('./db/model/board')


const failMessage = {
  "message": {
    "text" : "죄송합니다. 찾지 못했습니다"
  } 
};
  //초기 상태 get
app.get('/keyboard', function(req, res){
    /*
  const menu = {
      "type": 'buttons',
      "buttons": ["안녕", "메롱"]
  };

*/

  console.log('req = ',req)
  const menu = {
    "type" : "text"
  }
  res.set({
    'content-type': 'application/json'
  }).send(JSON.stringify(menu));
});

const initialize = (result) => {
}

const findIntent = (result) => {
  // 배열로 오게 되어 있는데 여러 인텐트가 한꺼번에 올거 같지 않아서 일단은
  // 1번째 인덱스에 있는 것으로만 처리.
  // [TODO] 인텐트가 배열로 온다.
  if (result[0].queryResult.intent.displayName == gospelIntent) {
    return invokeGospelSearch(result[0].queryResult.parameters.fields.number.numberValue)
  }
  return failMessage

}

async function invokeGospelSearch(value) {
  const result = await googleImage.getImageUrl("찬송가 " + value + "장")
  console.log('get Image =>>>>> ',result.data.items)
    
  if (result.data.items && result.data.items[0].image) {

    const homepage = result.data.items[0].image.contextLink
    const width = result.data.items[0].image.width 
    const height = result.data.items[0].image.height
    return sendImage(result.data.items[0].link, homepage, width, height, value) 
  }

  return failMessage 
}
const sendImage = (url, homepage, width, height, value)=> {
  const message = {
    "message": {
      "text" : "찬송가 " + value + '장',
      "photo": { "url": url, "width": width, "height": height},
      "message_button": {
        "label": "link",
        "url": homepage
      }
    } 
  };
  return message
}  
  // 메시지 처리
  
app.post('/message',async function (req, res) {

  const _obj = {
    user_key: req.body.user_key,
    type: req.body.type,
    content: req.body.content
  };
  //console.log('req = > ', req)
  console.log(_obj.content)
  //let message = '1'
  // comment out using dialogflow. because it gonna use later.
  //const result = await bot.sendToDialogFlow(_obj.content)
  //console.log('result => ', JSON.stringify(result))
  //message = await findIntent(result)
   
  //test() 
  var text = findNumberInStrings(_obj.content)
  console.log('text = ' + text)
  var message = ''
  if (text) { // charicter
    message = await invokeGospelSearch(text)
  }
  else {
    message = await getGospelLyrics(_obj.content)
    message = message ? message : failMessage
  }

  res.set({
    'content-type': 'application/json'
  }).send(JSON.stringify(message));
});
const findNumberInStrings= (str) =>  {
  return str.replace(/[^0-9]/g,'')
}


async function getGospelLyrics(message) {
  message = "\""+ message + "\""
  console.log(message)
  var board = new Board()
  //Board.index({'$**': 'text'})
  var startTime = Date.now() 
    /*
  Board.find({ $or: [{ "title": { $regex: message}}, {"contents": { $regex: message}} ] }, function(err, boards) {
    console.log('time = > ' + (Date.now() - startTime))
    console.log('boards = ', boards)
  })
   
   */
    var tt = Date.now()
  await Board.find({ $text: { $search: message }}, {score : { $meta: "textScore"}}).sort( {
    score: { $meta: 'textScore'} 
  }).exec(function(err, boards) {
      console.log('------------------------------------------\n---------------------\n' + (Date.now() - tt))
      console.log('boards ==> ', boards)
      return boards.length > 0 ? boards[0].seq : null
    }) 


}
  /*
 else if (_obj.content === '100') {
    let message = {
      "message": {
        "text" : "이미지다.",
        "photo": { "url": "https://godpeople.or.kr/files/attach/images/3064898/443/353/003/818f24b2bbb6b73c366ac84cbae28428.png", "width": 1200, "height": 800}
      }
    };
    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(message));
  }
  */

//9000포트 서버 ON
//app.listen(9000, function() {
//});
//"message_button": { "label": "주유 쿠폰 받기","url": "https://naver.com"}
//

exports.app = functions.https.onRequest(app)
