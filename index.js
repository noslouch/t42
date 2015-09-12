var request = require('request-promise'),
    url = require('url'),
    CartoDB = require('cartodb'),
    secrets = require('./secrets.js'),
    googleJSON = require('./lib/google'),
    Scraper = require('./lib/newyorker'),
    baseUrl = 'http://www.newyorker.com/magazine/tables-for-two',
    cartodbClient = new CartoDB({user: secrets.USER, api_key: secrets.API_KEY}),
    requestUrl

function geoCb(b, ops) {
  console.log(body.results)
    var body = JSON.parse(b),
        results = body.results[0],
        coords = results ? results[0].geometry.location : '',
        coordsString = coords ? coords.lng + ',' + coords.lat : ''

    this.dataSet.push({
        title: ops.title,
        url: ops.href,
        address: ops.address,
        coords: coordsString
    })
}

function sendToCarto() {
  var data = scraper.dataSet
    console.log(data)

  cartodbClient.on('connect', function() {
    data.forEach(function(d) {
      cartodbClient.query("insert into t42 (address, state) values('{address}', 'NY')", {address: address[0]}, function(err, data) {
          if (err) { console.log(err) } else { console.log(data) }
      })
      cartodbClient.query("update t42 set name = '{title}', url = '{href}' where address = '{address}'", {title: title, href: href, address: address[0]}, function(err, data) {
         //if (err) { console.log(err) } else { console.log(data) }
      })
    })
})
//cartodbClient.connect()
}

var scraper = new Scraper({
    getLatLng: googleJSON,
    geoCb: geoCb
})

for (var i = 1; i <= 2; i++) {
    if (i === 1) {
        requestUrl = baseUrl.slice()
    } else {
        requestUrl = baseUrl.slice() + '/page/' + i
    }

    request(requestUrl).promise().bind(scraper)
      .then(scraper.scrape)
      .finally(sendToCarto)

}
