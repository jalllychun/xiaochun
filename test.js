var request = require('request');
const querystring = require('querystring');
var JSSoup = require('jssoup').default;

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
    var soup = new JSSoup(body);
    var divTable = soup.find('div', 'kkzhonggu');
    var table = divTable.nextElement;
    var blogLists = table.findAll('tbody');

    itemInfoLists = [];
    for (var i=0; i<blogLists.length;i++){
      var tdLists = blogLists[i].findAll('td');
      var pLists = tdLists[1].findAll('p');
      var infoStrings = pLists[1].find('span').text.trim().split(',');
      var itemInfo = {
        internalUrl: pLists[0].find('a').attrs.href,
        location: pLists[1].contents[0]._text,
        catogary: infoStrings[0].trim(),
        consumtion: infoStrings[1].trim(),
        moreDescrip: pLists[2].text,
        bloger: pLists[3].text.split('发表于')[0].trim(),
        timeStamp: pLists[3]
      };
      itemInfoLists.push(itemInfo);
    }

    // to determine how many pages in total
    var divTableFooter = soup.find('div', 'bm bw0 pgs cl');
    var pagesString = divTableFooter.find('label').find('span').attrs.title;
    // regex matching
    const regex = /[\u4e00-\u9fa5]* (\d+) [\u4e00-\u9fa5]*/;
    var pagesRes  = regex.exec(pagesString);
    if (pagesRes != null){
      var pagesIntotal = pagesRes[1];
    }
    console.log('total: ' + pagesIntotal + ' page(s)');
    //
    for (var i=0; i<itemInfoLists.length; i++){
      var blog = itemInfoLists[i];
      //console.log(blog);
    }

    console.log(itemInfoLists[itemInfoLists.length-1].timeStamp.contents[0].contents[0]);
  }
  else{
    console.log('something wrong.');
    console.log(response.statusCode);
  }
});
