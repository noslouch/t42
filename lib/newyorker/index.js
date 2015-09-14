var request = require('request-promise'),
    cheerio = require('cheerio'),
    Q = require('q')

function getAddress(body) {
    var $ = cheerio.load(body)
    return $('#page-header').find('[itemprop=alternativeHeadline]').text().split(';')[0]
}

function scrape(body) {
  var $ = cheerio.load(body),
    articles = $('.posts').find('article')

  // use .get() to return an actual array instead of a jQuery/cheerio object
  return Q.all(articles.get().map(function(el) {
    var $el = $(el),
      title = $el.find('[itemprop=headline]').text(),
      href = $el.find('a[itemprop=name]').attr('href'),
      // TNY includes a proper timestamp in the DOM. so nice!
      publishDate = $el.find('[itemprop=datePublished]').attr('datetime'),
      blurb = $el.find('[itemprop=description]').text(),
      author = $el.find('span[itemprop=name]').text()

    return request(href).then(function(responseString) {
      var address = getAddress(responseString)
      return {
        address: address,
        title: title,
        href: href,
        publishDate: publishDate,
        blurb: blurb,
        author: author
      }
    })
  }))
}

module.exports = scrape
