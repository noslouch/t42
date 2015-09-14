if ( global.v8debug) {
   global.v8debug.Debug.setBreakOnUncaughtException()
}

process.setMaxListeners(0)

var request = require('request-promise'),
  url = require('url'),
  CartoDB = require('cartodb'),
  askGoogleForAddress = require('./lib/google'),
  scrape = require('./lib/newyorker'),
  secrets = require('./secrets.js'),
  cartodbClient = new CartoDB({user: secrets.USER, api_key: secrets.CARTODB_KEY}),
  baseUrl = 'http://www.newyorker.com/magazine/tables-for-two',
  requestUrl

// open the connection once
cartodbClient.connect()

function doScrape(url) {
  console.log('requesting', url)
  request(url)
    .then(scrape)
    .then(askGoogleForAddress)
    .then(function(data) { data.forEach(sendToCarto) })
}

function sendToCarto(incoming) {
  var scrapedData = incoming[0],
    googleResponse = incoming[1]

  if (googleResponse.status !== 'OK') {
    if (googleResponse.status === 'OVER_QUERY_LIMIT') {
      // wait a couple seconds and try again with the scraped data
      setTimeout(function(s) { askGoogleForAddress(s) }.bind(null, scrapedData), 2000)
    } else {
      console.log(googleResponse)
    }
    return
  }

  var results = googleResponse.results[0],
    coords = results.geometry.location,
    coordsString = coords.lng + ' ' + coords.lat,
    // address from google is more complete
    address = results.formatted_address,
    hasPhoneNumber = scrapedData.address.match(/\((.*)\)/),
    phoneNumber = hasPhoneNumber ? hasPhoneNumber[1] : ''

  var data = {
    phone: phoneNumber,
    title: scrapedData.title,
    url: scrapedData.href,
    address: address,
    coords: coordsString,
    blurb: scrapedData.blurb,
    author: scrapedData.author,
    publishDate: scrapedData.publishDate
  }

  cartodbClient.query("insert into t42 (the_geom, name, address, state, url, blurb, author, publish_date, phone) values(ST_GeomFromText('POINT({coords})', 4326), '{title}', '{address}', 'NY', '{url}', '{blurb}', '{author}', '{publishDate}', '{phone}')", data, function(err, data) {
    if (err) { console.log(err) } else { console.log(data) }
  })
}

for (var i = 1; i <= 65; i++) {
  if (i === 1) {
    requestUrl = baseUrl.slice()
  } else {
    requestUrl = baseUrl.slice() + '/page/' + i
  }

  setTimeout(doScrape.bind(this, requestUrl), i * 1000)
}
