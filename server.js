const mongodb = require('mongodb')
const url = 'mongodb://localhost:27017'
const dbName = 'edx-course-db'
const customers = require('./m3-customer-data.json')
const customerAddress = require('./m3-customer-address-data.json')
const async = require('async')

let tasks = []
const limit = parseInt(process.argv[2], 10) || 1000
mongodb.MongoClient.connect(url, (error, client) => {
if (error) return process.exit(1)
const db= client.db(dbName)
customers.forEach((customer, index, list) => {
customers[index] = Object.assign(customer, customerAddress[index])
 
if (index % limit == 0) {
const start = index
const end = (start+limit > customers.length) ? customers.length-1: start+limit
tasks.push((done) => {
console.log(`Processing ${start}-${end} out of ${customers.length}`)
db.collection('customers').insert(customers.slice(start, end), (error, results) => {
done(error, results)
})
})
}
})
console.log(`Launching ${tasks.length} parallel task(s)`)
const startTime = Date.now()
async.parallel(tasks, (error, results) => {
if (error) console.error(error)
const endTime = Date.now()
console.log(`Execution time: ${endTime-startTime}`)
client.close()
})
})