var request = require('request-promise'),
    cheerio = require('cheerio'),
    Q = require('q')

function scrapeCB(body, ops) {
    var $ = cheerio.load(body)
    ops.address = $('#page-header').find('[itemprop=alternativeHeadline]').text().split(';')[0]

    return this.getLatLng(this.geoCb, ops)

}

function scrape(body) {
    var $ = cheerio.load(body),
        articles = $('.posts').find('article'),
        scraper = this

    return Q.all(articles.map(function(i, el) {
        var $el = $(el),
          title = $el.find('[itemprop=headline]').text(),
          href = $el.find('a[itemprop=name]').attr('href'),
          publishDate = $el.find('[itemprop=datePublished]').attr('datetime'),
          blurb = $el.find('[itemprop=description]').text(),
          author =$el.find('span[itemprop=name]').text()

        return request(href).then(function(responseString){
          scrapeCB.call(scraper, responseString, {
            title: title,
            href: href,
            publishDate: publishDate,
            blurb: blurb,
            author: author
          })
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
