var pageSpeedApiKey = 'XXX';

function main() {

  Logger.log("Getting List of Pages...")
  var pages = getPages();

  Logger.log("Getting Speed Data for Desktop...")
  var desktopObjects = callPageSpeed("desktop", pages);

  Logger.log("Getting Speed Data for Mobile...")
  var mobileObjects = callPageSpeed("mobile", pages);

  Logger.log("Putting data into Google Sheet...")
  dataToSheet(desktopObjects, mobileObjects);
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

function callPageSpeed(device, pages) {

  //Creates the JSON to send to URLFetchApp
  var requests = [];  
  
  for (var i = 0; i < pages.length; i++) {
    var url = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' + pages[i] + '&key=' + pageSpeedApiKey + '&strategy=' + device;
    var requestObject = {'url': url, 'muteHttpExceptions': true, 'followRedirects':false};
    requests.push(requestObject);
  }
  
  var response = UrlFetchApp.fetchAll(requests);
  var pageSpeedObjects = [];

  for (var i = 0; i < response.length; i++) {
    var json = response[i].getContentText();
    var parsedJson = JSON.parse(json);

    try{
      var sPSI = parsedJson["lighthouseResult"]["categories"]["performance"]["score"]*100;
      var sTTI = parsedJson["lighthouseResult"]["audits"]["interactive"]["displayValue"].slice(0, -2);
      var sLCP = parsedJson["lighthouseResult"]["audits"]["largest-contentful-paint"]["displayValue"].slice(0, -2);
      var sFID = parsedJson["lighthouseResult"]["audits"]["max-potential-fid"]["displayValue"].slice(0, -2)/1000;
      var sCLS = parsedJson["lighthouseResult"]["audits"]["cumulative-layout-shift"]["displayValue"];
    }

    catch{
      var sLCP = '';
      var sFID = '';
      var sCLS = '';
      var sPSI = '';
      var sTTI = '';
      }

    var pageSpeedObject = {id: pages[i], lcp: sLCP, fid: sFID, cls: sCLS, psi: sPSI, tti: sTTI};
    pageSpeedObjects.push(pageSpeedObject);
  }
  return(pageSpeedObjects);
}

function dataToSheet (desktopObjects, mobileObjects){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('CWV');

  for (var i = 0; i < desktopObjects.length; i++) {
    sheet.appendRow([Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd'), desktopObjects[i].id, 
                      desktopObjects[i].psi, desktopObjects[i].tti, desktopObjects[i].lcp, 
                      desktopObjects[i].fid, desktopObjects[i].cls,
                      mobileObjects[i].psi, mobileObjects[i].tti, mobileObjects[i].lcp, 
                      mobileObjects[i].fid, mobileObjects[i].cls]); 
  }               
}
