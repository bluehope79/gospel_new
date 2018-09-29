const firebaseAdmin = require('firebase-admin')
const databaseSecrets = require('./gospel-85861-firebase-adminsdk-mlsmt-046b724001.json')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(databaseSecrets),
  databaseURL: "https://gospel-85861.firebaseio.com"
})

const db = firebaseAdmin.firestore()
db.settings({timestampsInSnapshots: true})
db.collection('db').where("seq", "==", "100").get().then(function(querySnapshot) {
  console.log('then = ', querySnapshot._docs)
  querySnapshot.forEach(function(doc) {
    console.log('doc.data() = ', doc.data())
  })
}).catch(function(error) {
    console.log('error ', error)
  })
  /*
db.collection('db').get().then(snapshot => {
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data())
  })
})
  .catch(err => {
    console.error(err)
  })
  */
  /*
const fs = require('fs')
const csvSync = require('csv-parse/lib/sync')
const file = 'hymn.csv'
let data = fs.readFileSync(file)
let responses = csvSync(data)

// convert CSV data into objects
let objects = []
var i =0;
responses.forEach(function(response) {
  if (i < 400) {
    i++;
    return ;
  }
  objects.push({
    seq: response[0],
    title: response[1],
    contents: response[2],
    amem: response[3]
  })
  i++
}, this)

// set the data from objects
return db.runTransaction(function(transaction) {
  return transaction.get(db.collection('db')).then(doc => {
    objects.forEach(function(object) {
      transaction.set(db.collection('db').doc(), object)
    }, this)
  })
}).then(function() {
  console.log('Success!')
}).catch(function(error) {
  console.log('Failed', error)
})
*/
