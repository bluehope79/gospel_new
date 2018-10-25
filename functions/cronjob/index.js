const express = require('express')
const router = express.Router();
const request = require('request')

const url = "https://www.prayertents.com/bible/hymns?nh=1"
request(url, function(error, response, body) {
  console.log('body = ', body)

}
)
