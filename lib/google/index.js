var request = require('request-promise'),
    API_KEY = require('../../secrets.js').GOOGLE_KEY,
    baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
    options = {
      bounds: '40.46784549077255,-74.2840576171875|40.92907766380368,-73.6962890625',
      key: API_KEY
    }

function requestJSON(cb, ops) {

  function processData(responseString) {
    var response = JSON.parse(responseString)
    cb.call(this, response, ops)
  }

  if (!ops.address) {
    console.log('no address:', ops)
    return
  }
  if ( !/,/.test(ops.address) ) {
    ops.address += ', New York, NY'
  }
  options.address = ops.address

  return request({
    url: baseUrl,
    qs: options
  }).then(processData.bind(this))
}

module.exports = requestJSON
