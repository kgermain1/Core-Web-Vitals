var pageSpeedApiKey = 'XXX';

function main() {

  Logger.log("Getting List of Pages...")
  var pages = getPages();

  for (var i = 0; i < pages.length; i++) {
    var url = pages[i];

    Logger.log("Getting " + url + " Speed Data For Desktop...")
    var desktop = callPageSpeed('desktop', url);

    Logger.log("Getting " + url + " Speed Data For Mobile...")
    var mobile = callPageSpeed('mobile', url);

    Logger.log("Putting " + url + " data into Google Sheet...")
    dataToSheet(desktop, mobile, url);
  }
}

function getPages(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('URLs');

  var urls = sheet.getDataRange().getValues();
  var pages = [];

  for (var i = 0; i < urls.length; i++) {
    pages.push(urls[i][0]);
  }
  return pages;
}

function callPageSpeed(device, url) {
  var pageSpeedUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' + url + '&key=' + pageSpeedApiKey + '&strategy=' + device;
  var response = UrlFetchApp.fetch(pageSpeedUrl);
  var json = response.getContentText();
  var parsedJson = JSON.parse(json);

  var pageSpeedObject = {id: parsedJson.id, 
  lcp: parsedJson.originLoadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile / 1000, 
  fid: fid = parsedJson.originLoadingExperience.metrics.FIRST_INPUT_DELAY_MS.percentile / 1000, 
  cls: cls = parsedJson.originLoadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile, 
  psi: parsedJson.lighthouseResult.categories.performance.score * 100};

  return(pageSpeedObject);
}

function dataToSheet (desktop, mobile, url){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('CWV');

  sheet.appendRow([Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd'), url,
                   desktop.psi, desktop.lcp, desktop.fid, desktop.cls,
                   mobile.psi, mobile.lcp, mobile.fid, mobile.cls]);                
}
