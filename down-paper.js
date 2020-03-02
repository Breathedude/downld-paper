'use strict'
const pdfcrowd = require('pdfcrowd')
let scholar = (function () {
  let request = require('request')
  let cheerio = require('cheerio')
  const throttledQueue = require('throttled-queue')

  const perSecThrottle = throttledQueue(5, 1000)
  const perMinThrottle = throttledQueue(200, 60 * 1000)
  const GOOGLE_SCHOLAR_URL = 'https://scholar.google.com/scholar?hl=en&q='
  const STATUS_CODE_FOR_RATE_LIMIT = 503
  const STATUS_MESSAGE_FOR_RATE_LIMIT = 'Service Unavailable'
  const STATUS_MESSAGE_BODY = 'This page appears when Google automatically detects requests coming from your computer network which appear to be in violation of the <a href="//www.google.com/policies/terms/">Terms of Service</a>. The block will expire shortly after those requests stop.'

  function scholarResultsCallback (resolve, reject) {
    return function (error, response, html) {
      if (error) {
        reject(error)
      } else if (response.statusCode !== 200) {
        if (response.statusCode === STATUS_CODE_FOR_RATE_LIMIT && response.statusMessage === STATUS_MESSAGE_FOR_RATE_LIMIT && response.body.indexOf(STATUS_MESSAGE_BODY) > -1) {
          reject(new Error('Too many requests!'))
        } else {
          reject(new Error(response.statusCode))
        }
      } else {
        let $ = cheerio.load(html)
        let results = $('.gs_r')
        let processedResults = []
        results.each((i, r) => {
          $(r).find('.gs_ri h3 span').remove()
          let title = $(r).find('.gs_ri h3').text().trim()
          let pdfUrl = $($(r).find('.gs_ggsd a')[0]).attr('href')
          if((title!=='') && (pdfUrl!==undefined)){
            processedResults.push({
                title: title,
                pdf:pdfUrl
              })
          }
        })
        resolve({
          results: processedResults,
        })
      }
    }
  }

  function search (query) {
    let p = new Promise(function (resolve, reject) {
      perMinThrottle(() => {
        perSecThrottle(() => {
          var requestOptions = {
            jar: true
          }
          requestOptions.url = encodeURI(GOOGLE_SCHOLAR_URL + query)
          request(requestOptions, scholarResultsCallback(resolve, reject))
        })
      })
    })
    return p
  }
  return {
    search: search,
  }
})()

scholar.search('VR')
  .then(resultsObj => {
    download(resultsObj)
  })

var client = new pdfcrowd.HtmlToPdfClient("demo", "ce544b6ea52a5621fb9d55f8b542d14d");
var i = 0
function download(res){
    const a = res
    while(i < 5){
        console.log(a["results"][i].title)
        // run the conversion and write the result to a file
        client.convertUrlToFile(a["results"][i].pdf, a["results"][i].title+'.pdf',
            function(err, fileName) {
                if (err) return console.error("Pdfcrowd Error: " + err);
                console.log("Success: the file was created " + fileName);
                });
            i=i+1
        }
    }