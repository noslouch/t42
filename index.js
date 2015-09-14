process.setMaxListeners(0)
var request = require('request-promise'),
    url = require('url'),
    CartoDB = require('cartodb'),
    secrets = require('./secrets.js'),
    googleJSON = require('./lib/google'),
    Scraper = require('./lib/newyorker'),
    baseUrl = 'http://www.newyorker.com/magazine/tables-for-two',
    cartodbClient = new CartoDB({user: secrets.USER, api_key: secrets.CARTODB_KEY}),
    requestUrl

cartodbClient.connect()

function geoCb(body, ops) {
  if (body.status !== 'OK') {
    console.log(body)
    return
  }
  var results = body.results[0],
      coords = results.geometry.location,
      coordsString = coords.lng + ' ' + coords.lat,
      address = results.formatted_address,
      phoneMatch = ops.address.match(/\((.*)\)/),
      phone = phoneMatch ? phoneMatch[1] : ''

  var data = {
      phone: phone,
      title: ops.title,
      url: ops.href,
      address: address,
      coords: coordsString,
      blurb: ops.blurb,
      author: ops.author,
      publishDate: ops.publishDate
  }

  cartodbClient.query("insert into t42 (the_geom, name, address, state, url, blurb, author, publish_date, phone) values(ST_GeomFromText('POINT({coords})', 4326), '{title}', '{address}', 'NY', '{url}', '{blurb}', '{author}', '{publishDate}', '{phone}')", data, function(err, data) {
      if (err) { console.log(err) } else { console.log(data) }
  })

}

var scraper = new Scraper({
    getLatLng: googleJSON,
    geoCb: geoCb
})

function doScrape(url) {
  console.log('requesting', url)
  request(url).promise().bind(scraper)
    .then(scraper.scrape)
}

for (var i = 1; i <= 65; i++) {
    if (i === 1) {
        requestUrl = baseUrl.slice()
    } else {
        requestUrl = baseUrl.slice() + '/page/' + i
    }

    setTimeout(doScrape.bind(this, requestUrl), i * 5000)
}
