const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const axios = require('axios')
const imageSize = require('image-size')

const googleImage  = require('./http-google')
const path = require('path');
var hymns = require('./routes/hymns')
var port = process.env.PORT || 9000

const mongoose = require('mongoose')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// mongoose connect
mongoose.connect('mongodb://soo:fhrmdhs12@ds245532.mlab.com:45532/hymns', {
  useNewUrlParser: true,
})// option)
mongoose.set('useCreateIndex',true)
var db = mongoose.connection
db.on('error', console.error.bind(console, 'mongoose connection error:'))
db.once('open', async function() {
  console.log('Connected to mongodb server')
})

var Board = require('./db/model/board')
var ori_board = require('./db/model/ori_board')

app.use('/hymns', hymns)

const failMessage = {
  "message": {
    "text" : "입력 텍스트가 포함된 찬송가를 찾을 수 없습니다" 
  } 
};
const _prefix = "장 : ";
const _prefixSeqText = "장"
const FAIL_WRONG_TEXT = "찬송가 번호나 찬송가 가사를 입력해주세요\n 예1) 424 \n 예2) 사철에 봄바람"
const FAIL_WRONG_SEQ = "존재 하는 찬송가 번호가 아닙니다"
const RETRY_SEARCH = "다시 검색합니다"

//초기 상태 get
app.get('/keyboard', function(req, res){
  console.log('keyboard ')
  const menu = {
    "type" : "text",
    "message" : {
      "text" : "샬롬. 찬송가 검색을 위해 찬송가 장수나 가사를 입력해주세요."
    }
  }
  res.set({
    'content-type': 'application/json'
  }).send(JSON.stringify(menu));
});

app.post('/message',async function (req, res) {
  const _obj = {
    user_key: req.body.user_key,
    type: req.body.type,
    content: req.body.content
  };
  var message = ''

  console.log(_obj.content)
  if (_obj.content.indexOf("다시 검색") >= 0) {
    message = {
      "message": {
        "text" : RETRY_SEARCH 
      }
    }
    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(message));
    return
  }

  var text = findNumberInStrings(_obj.content)
  console.log('text = ' + text)
  
  // It use to know as from buttons text received 
  if (_obj.content.indexOf(_prefix) > 0) {
    message = await makeSearching(text)
    responseWithMessage(res, message)
    return
  }

  // If it's only number type,
  if (text) { //number 
    if (text == _obj.content.trim() 
      || (text + _prefixSeqText).trim() == _obj.content.trim()) {

      if (text > 0 && text < 646) { 
        //message = await invokeGospelSearch(text)
        message = await makeSearching(text)
      }
      else {
        message = {
          "message": {
            "text": FAIL_WRONG_SEQ 
          } 
        }
      }
    }
    else {
      message = {
        "message": {
          "text": FAIL_WRONG_TEXT 
        }
      }

    }
  }
  else {
    message = await searchText(_obj)
  }
  responseWithMessage(res, message)

});

function responseWithMessage(res, message) {
  res.set({
    'content-type': 'application/json'
  }).send(JSON.stringify(message));
} 

async function makeSearching(value) {
  const homepage = 'http://ec2-18-217-67-252.us-east-2.compute.amazonaws.com:9000/hymns/'+value
  const link = 'http://ec2-18-217-67-252.us-east-2.compute.amazonaws.com:9000/asset/hymns' + value +'.jpg'
  const dimensions = imageSize('./public/asset/hymns' + value + '.jpg')
  const width = dimensions.width
  const height = dimensions.height
  console.log('width = ' + width + ', height = ' + height)
  console.log('makeSearching / value = ' + value)
  var board = await getLyricsWithSeq(value)
  console.log('makeSearching / board = ' + board.contents)

  return sendLyrics(link, homepage, value, board.contents)
}

const sendImage = (url, homepage, width, height, value)=> {
  const message = {
    "message": {
      "text" : "찬송가 " + value + '장',
      "photo": { "url": url , "width": width, "height": height},
      "message_button": {
        "label": "악보 보기",
        "url": homepage
      }

    } 
  };
  return message
}  
const sendLyrics = (url, homepage, value, text) => {
  const message = {
    "message" : {
      "text" : "찬송가 " + value + "장 \n\n" + text,
      "message_button": {
        "label": "악보 보기",
        "url": homepage
      }
    }
  }
  return message
}

async function searchText(_obj) {
  var message ='' 
  var boards = await getGospelLyrics(_obj.content)
  console.log('boards ======> ' + boards)
  if (boards == null || boards.length == 0) {
    message = failMessage
  }
  else if (boards.length == 1) {
    //message = await invokeGospelSearch(boards[0].seq) 

    message = makeSearching(boards[0].seq)
  } 
  else {
    message = returnOption(boards) 

  }
  return message 
}
const findNumberInStrings= (str) =>  {
  return str.replace(/[^0-9]/g,'')
}

function returnOption(boards) {

  var arr = []
  for (var i=0; i<boards.length ; i++) {
    if (i >= 5) {
      arr.push((boards.length - 5) + " 개 더 있음. 다시 검색")
      break;
    }
    else {
      arr.push(boards[i].seq + _prefix + boards[i].title)
    }
  }

  const buttons = {
    "message": {
      "text": "여러 건이 검색되었습니다"
    },
    "keyboard": {
      "type": "buttons",
      "buttons": arr 
    }
  };
  return buttons
}


async function getLyricsWithSeq(seq) {
  return new Promise(function(resolve, reject) {
    ori_board.find({"seq": seq}, function(err, boards) {
      if (err) {
        console.log('getLyricsWithSeq / error = ', err)
        resolve(null)
      }
      console.log('boards = ', boards)
      resolve(boards[0])
    })
  })
}

async function getGospelLyrics(msg) {
  var message = msg.replace(/ /gi, "")
  console.log(message)
  var board = new Board()
  var startTime = Date.now() 

  return new Promise(function(resolve, reject ) {
    Board.find({ "contents": { $regex: message} }, function(err, boards) {

      console.log('time = > ' + (Date.now() - startTime))
      console.log('getGospelLyrics / error = ' + err)
      console.log('in getGospelLyrics / boards = ', boards)
      if (boards == null || boards.length == 0) {
        resolve(null)
      } 
      else {
        resolve(boards)
      }
    })//.limit(5)
  })

}

function replaceSpace() {
  var board = new Board()
  Board.find({}).then(function(doc) {
    doc.forEach(function(u) {
      var content = u.contents
      var title = u.title
      content = content.replace(/ /gi, "")
      Board.update({_id: u._id}, {"$set": { "contents": content}}, function(err, output) {
      } 
      )
    })
  })
}
app.use(express.static('./public'))
//9000포트 서버 ON
app.listen(port, function() {
  console.log('start server 9000')
});
