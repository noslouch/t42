var request = require('request-promise'),
  Q = require('q'),
  API_KEY = require('../../secrets.js').GOOGLE_KEY,
  baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
  options = {
    bounds: '40.46784549077255,-74.2840576171875|40.92907766380368,-73.6962890625',
    key: API_KEY
  }

function getLLFromGoogle(scrapedArray) {

  if (typeof scrapedArray.map === 'undefined') {
    scrapedArray = [ scrapedArray ]
  }

  return Q.all(scrapedArray.map(function(scrapedData) {
    if (!scrapedData.address) {
      return [scrapedData, {status: 'NO_ADDRESS'}]
    }
    if ( !/,/.test(scrapedData.address) ) {
      scrapedData.address += ', New York, NY'
    }
    options.address = scrapedData.address

    return request({
      url: baseUrl,
      qs: options
    }).then(function(data, responseString) {
      return [data, JSON.parse(responseString)]
    }.bind(null, scrapedData))

  }))
}

module.exports = getLLFromGoogle
