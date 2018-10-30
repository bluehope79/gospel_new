var fs = require('fs'), request = require('request')
var path = require('path');
var download = function(uri, filename, callback) {

    return new Promise((resolve, reject) => {
  console.log('download / uri = ' + uri);
  request.head(uri, function(err, res, body) {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length'])

    
    request(uri)
        .pipe(
          fs.createWriteStream(
            path.join(__dirname + '/asset', filename)
          ).on('close', ()=> {
            resolve()
            }
          )
        )
    }
    )
  })
}
//
//
const go = async () =>  {
  for (var i=240; i<646; i++) { 
    var name = 'hymns' + i + '.jpg';
    var path1 ='https://prayertents-yjnsqvzy.netdna-ssl.com/bible/newhymnsdata/' + make000Text(i) + '.jpg'
    console.log('path = ' + path1)
    
    var value = await download(path1, name)
    console.log('done ' + i)
    
    
  }
}
const make000Text= (i) => {
  console.log('make000Text i = ' + i)
  var result = ''
  if (i < 10) {
    result = '00'
  }
  else if (i < 100) {
    result = '0'
  }
  result = result + i
  console.log('result = ' + result);
  return result
}
//make000Text(1)
//make000Text(11)
//make000Text(645)
//make000Text(350)
go()
/*
download('https://prayertents-yjnsqvzy.netdna-ssl.com/bible/newhymnsdata/001.jpg', '1.jpg', () => {
  console.log('done');
})
*/

