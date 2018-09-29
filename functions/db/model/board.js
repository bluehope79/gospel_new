const mongoose = require('mongoose')
var Schema = mongoose.Schema

var boardSchema = new Schema({
  title: String,
  contents: String,
  seq: Number
})

//boardSchema.index({ 'title': 'text', 'contents': 'text'})
console.log('boardSchema')
module.exports = mongoose.model('hymndata', boardSchema)
