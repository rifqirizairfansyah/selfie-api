const mongoose = require('mongoose')

const rawRequestSchema = new mongoose.Schema({
  raw_request: {
    type: String
  }
}, {
  versionKey: false,
  collection: 'raw_request'
})

module.exports = mongoose.model('raw_request', rawRequestSchema)
