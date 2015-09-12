var request = require('request-promise'),
    querystring = require('querystring'),
    baseUrl = 'http://maps.googleapis.com/maps/api/geocode/json?'
    options = {
        bounds: '40.46784549077255,-74.2840576171875|40.92907766380368,-73.6962890625'
    }

function requestJSON(address, cb, ops) {

    options.address = ops.address
    return request({
        uri: baseUrl,
        qs: options
    }).then(function(responseString){
      cb.call(this, responseString, ops)
    }.bind(this))
}

module.exports = requestJSON
