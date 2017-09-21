var request = require('request');
const querystring = require('querystring');
const cheerio = require('cheerio');

var baseUrl = 'https://www.incnjp.com/forum.php';
var queryObject = {
  mod: 'forumdisplay',
  fid: '591',
  filter: 'sortid',
  sortid: '6',
  searchsort: '1',
  goods_area: '2.6',
  goods_type: '3',
  page: '1'
};

var queryParamsString = querystring.stringify(queryObject);
var url = baseUrl + '?' + queryParamsString;
console.log(url);

// fake headers
var headers = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS\
    X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko)\
    Chrome/60.0.3112.113 Safari/537.36',
  'upgrade-insecure-requests': 1,
  'refer': url
};

var options = {
  url: url,
  method: 'GET',
  headers: headers
};

request(options, function(error, response, body){
  if (!error && response.statusCode==200){
    // console.log(body);
    // make soup
    const $ = cheerio.load(body);
    var blogLists = $('table.tb1', 'div.kkzhonggu').find('tr');
    console.log(blogLists.length);

    itemInfoLists = [];
    var re = /.*(\d{4}-\d{1,2}-\d{1,2}).*/;
    for (var i=0; i<blogLists.length;i++){
      var p1 = $('p.p1', 'td.td2', blogLists[i]);
      var p2 = $('p.p2', 'td.td2', blogLists[i]).text().split(',');
      var p3 = $('p.p3', 'td.td2', blogLists[i]);
      var p4 = $("p[class='p4 f1']", 'td.td2', blogLists[i]);
      var a = $('a', p1);
      var time;
      if ($('span', p4).length!=0){
        time = $('span', p4).attr('title');
      }
      else{
        time = p4.not('a').text();
        result = re.exec(time);
        if (result != null){
          time = result[1];
        }
      }

      var itemInfo = {
        title: a.text(),
        internalUrl: a.attr('href'),
        location: p2[0].trim(),
        catogary: p2[1].trim(),
        hownew: p2[2].trim(),
        description: p3.text().trim(),
        author: $('a', p4).text(),
        time: time,
        price: $('span', 'td.td4', blogLists[i]).first().text()
      };
      itemInfoLists.push(itemInfo);
      // console.log(itemInfo);
    }

    // to determine how many pages in total
    var footerDiv = $("div[class='bm bw0 pgs cl']");
    var pagesString = $('label', 'div.pg', footerDiv).text();
    // console.log(pagesString);
    // regex matching
    const regex = /.*\/ (\d+) [\u4e00-\u9fa5].*/;
    var pagesRes  = regex.exec(pagesString);
    if (pagesRes != null){
      var pagesIntotal = pagesRes[1];
    }
    console.log('total: ' + pagesIntotal + ' page(s)');
  }
  else{
    console.log('something wrong.');
    console.log(response.statusCode);
  }
});
