var request = require('request'),
    cheerio = require('cheerio'),
    CartoDB = require('cartodb'),
    secrets = require('./secrets.js'),
    baseUrl = 'http://www.newyorker.com/magazine/tables-for-two',
    cartodbClient = new CartoDB({user: secrets.USER, api_key: secrets.API_KEY}),
    requestUrl

cartodbClient.on('connect', function() {
    for (var i = 1; i < 10; i++) {
        if (i === 1) {
            requestUrl = baseUrl.slice()
        } else {
            requestUrl = baseUrl.slice() + '/page/' + i
        }

        request(requestUrl, function(error, response, body) {
            if (error) {
                console.log('That\'s an error:', error)
                return
            }

            var $ = cheerio.load(body),
                articles = $('.posts').find('article')

            articles.each(function(i, el) {
                var title = $(el).find('[itemprop=headline]').text(),
                    href = $(el).find('[itemprop=name]').attr('href'),
                    address

                request(href, function(error, response, body) {
                    if (error) {
                        console.log('error getting post:', error)
                        return
                    }
                    var $ = cheerio.load(body),
                        address = $('#page-header').find('[itemprop=alternativeHeadline]').text().split(';')

                    // cartodbClient.query("insert into t42 (address, state) values('{address}', 'NY')", {address: address[0]}, function(err, data) {
                    //     if (err) { console.log(err) } else { console.log(data) }
                    // })
                    cartodbClient.query("update t42 set name = '{title}', url = '{href}' where address = '{address}'", {title: title, href: href, address: address[0]}, function(err, data) {
                         if (err) { console.log(err) } else { console.log(data) }
                    })
                })
            })
        })
    }
})
cartodbClient.connect()
