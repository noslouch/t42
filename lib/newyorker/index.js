var request = require('request-promise'),
    cheerio = require('cheerio'),
    Q = require('q')

function scrapeCB(body, ops) {
    var $ = cheerio.load(body)
    ops.address = $('#page-header').find('[itemprop=alternativeHeadline]').text().split(';')[0]

    return this.getLatLng(this.address, this.geoCb, ops)

}

function scrape(body) {
    var $ = cheerio.load(body),
        articles = $('.posts').find('article'),
        scraper = this

    return Q.all(articles.map(function(i, el) {
        var title = $(el).find('[itemprop=headline]').text(),
          href = $(el).find('[itemprop=name]').attr('href')

        return request(href).then(function(responseString){
          return scrapeCB.call(scraper, responseString, {title: title, href: href})
        })
    }))
}

var Scraper = function(ops) {
    this.geoCb = ops.geoCb
    this.getLatLng = ops.getLatLng
    this.dataSet = []
}
Scraper.prototype.scrape = scrape
Scraper.prototype.cb = scrapeCB

module.exports = Scraper
