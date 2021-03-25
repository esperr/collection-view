getbaselines();

function getbaselines() {
  pausetime = performance.now();
  $.ajax({
    url: 'https://www.loc.gov/search/',
    error: function () {
      startOver();
      return;
    },
    data: {
      all: 'true',
      fo: 'json'
    },
    success: function( data ) {
      var totalcount = data.search.hits;
      var formatfacets = data.facets.filter(obj => {
        return obj.type === "original-format";
      });
      var datefacets = data.facets.filter(obj => {
        return obj.type === "dates";
      });
      var formats = formatfacets[0].filters
      var dates = datefacets[0].filters
      $.each( formats, function( key, value ) {
        var format = { 'format': value.title, 'count': value.count, 'proportion': value.count/totalcount };
        formatbaselines.push(format);
      });
      $.each( dates, function( key, value ) {
        var format = { 'century': value.title, 'count': value.count, 'proportion': value.count/totalcount };
        centurybaselines.push(format);
      });
      console.log(formatbaselines);
    }
  });
}

function showFormatBaselineComps(searchkeys) {
  var allformats = [];
  var formatProportionsArray =  [['Format']];
  //grab all our search terms and formats first
  for (i = 0; i < searchkeys.length; i++) {
    var searchterm = searches[searchkeys[i]].term;
    formatProportionsArray[0].push(searchterm);
    var formatcounts = searches[searchkeys[i]].formatcounts;
    for (c = 0; c < formatcounts.length; c++) {
      if(allformats.indexOf(formatcounts[c].format) === -1){
        allformats.push(formatcounts[c].format);
      }
    }
  }
  allformats.sort();

  for (i=0; i<allformats.length; i++) {
    var formatvalues = [];
    formatvalues.push(allformats[i]);
    for (m=0; m<searchkeys.length; m++) {
      var mysearchformat = searches[searchkeys[m]].formatcounts.filter(obj => {
        return obj.format === allformats[i];
      });
      baselinecomp = formatbaselines.filter(obj => {
        return obj.format === allformats[i];
      });
      if (typeof mysearchformat[0] !== "undefined") {
        var mycomparison = mysearchformat[0].proportion - baselinecomp[0].proportion;
      } else {
        var mycomparison = 0;
      }
      formatvalues.push(mycomparison);
    }
    formatProportionsArray.push(formatvalues);
  }
  console.log(searches);
  var formatProportionsData = google.visualization.arrayToDataTable( formatProportionsArray );
  var chartheight = (formatProportionsArray.length * 20) * searchkeys.length;
  if (chartheight < 120) { chartheight = 120}
  var formatPropOptions = {
          bars: 'horizontal',
          height: chartheight,
          //width: mywidth,
          fontName: 'sans-serif',

         hAxis: {
           title: 'Proportion',
           maxValue: .7,
           minValue: -.7,
           viewWindow: {
             max: .9,
             min: -.9
           }
         },
         vAxis: {
           title: 'Format'
         }
       };

       var chart = new google.charts.Bar(document.getElementById('format_proportions'));
       //Here comes the clicky bit...
       function selectHandler() {
         var selectedItem = chart.getSelection()[0];
         if (selectedItem && selectedItem.row != null) {
           console.log(selectedItem);
           var format = formatProportionsData.getValue(selectedItem.row, 0);
           console.log(format);
           var term = formatProportionsData.getColumnLabel(selectedItem.column);
           console.log(term);
           var searchroot = getSearchRoot(format);
           var locurl = searchroot + term;
           window.open(locurl,'_formatsearch');
          }
       }
       console.log(searches);
       google.visualization.events.addListener(chart, 'select', selectHandler);

       chart.draw(formatProportionsData, google.charts.Bar.convertOptions(formatPropOptions));

}

function showCenturyBaselineComps(searchkeys) {
  var allcenturies = [];
  var centuryProportionsArray =  [['Century']];
  //grab all our search terms and centuries first
  for (i = 0; i < searchkeys.length; i++) {
    var searchterm = searches[searchkeys[i]].term;
    centuryProportionsArray[0].push(searchterm);
    var centurycounts = searches[searchkeys[i]].centurycounts;
    for (c = 0; c < centurycounts.length; c++) {
      if(allcenturies.indexOf(centurycounts[c].century) === -1){
        allcenturies.push(centurycounts[c].century);
      }
    }
  }

  for (i=0; i<allcenturies.length; i++) {
    var centuryvalues = [];
    centuryvalues.push(allcenturies[i]);
    for (m=0; m<searchkeys.length; m++) {
      var mysearchcentury = searches[searchkeys[m]].centurycounts.filter(obj => {
        return obj.century === allcenturies[i];
      });
      baselinecomp = centurybaselines.filter(obj => {
        return obj.century === allcenturies[i];
      });
      if (typeof mysearchcentury[0] !== "undefined") {
        var mycomparison = mysearchcentury[0].proportion - baselinecomp[0].proportion;
      } else {
        var mycomparison = 0;
      }
      centuryvalues.push(mycomparison);
    }
    centuryProportionsArray.push(centuryvalues);
  }
  console.log(centuryProportionsArray);
  var centuryProportionsData = google.visualization.arrayToDataTable( centuryProportionsArray );
  var chartheight = (centuryProportionsArray.length * 25) * searchkeys.length;
  if (centuryProportionsArray < 5) { chartheight = 130 }
  var centuryPropOptions = {
          bars: 'horizontal',
          height: chartheight,
          //width: mywidth,
          fontName: 'sans-serif',

         hAxis: {
           title: 'Proportion',
           maxValue: .7,
           minValue: -.7,
           viewWindow: {
             max: .9,
             min: -.9
           }
         },
         vAxis: {
           title: 'Format'
         }
       };

       var chart = new google.charts.Bar(document.getElementById('century_proportions'));
       //Here comes the clicky bit...
       function selectHandler() {
         var selectedItem = chart.getSelection()[0];
         if (selectedItem && selectedItem.row != null) {
           console.log(selectedItem);
           var century = centuryProportionsData.getValue(selectedItem.row, 0);
           var term = centuryProportionsData.getColumnLabel(selectedItem.column);
           var centurysearchpart = century.replace(" to ", "/");
           console.log(centurysearchpart);
           var searchroot = "https://www.loc.gov/search/?dates="
           var locurl = searchroot + centurysearchpart + "&q=" + term;
           window.open(locurl,'_datesearch');
          }
       }
       google.visualization.events.addListener(chart, 'select', selectHandler);
       chart.draw(centuryProportionsData, google.charts.Bar.convertOptions(centuryPropOptions));

}

function getSearchRoot(format) {
  var formatlabels = [
    {formatlabel: "newspaper", rootpart: "newspapers" },
    {formatlabel: "manuscript/mixed material", rootpart: "manuscripts" },
    {formatlabel: "book", rootpart: "books" },
    {formatlabel: "photo, print, drawing", rootpart: "photos" },
    {formatlabel: "archived web site", rootpart: "websites" },
    {formatlabel: "film, video", rootpart: "film-and-videos" },
    {formatlabel: "sound recording", rootpart: "audio" },
    {formatlabel: "map", rootpart: "maps" },
    {formatlabel: "notated music", rootpart: "notated-music" },
  ];
  var selectedformat = formatlabels.filter(obj => {
    return obj.formatlabel === format;
  });
  if (selectedformat.length > 0) {
    var searchroot = "https://www.loc.gov/" + selectedformat[0].rootpart + "/?q=";
  }

  var origformatlabels = [
    {formatlabel: "periodical", rootpart: "periodical" },
    {formatlabel: "legislation", rootpart: "legislation" },
    {formatlabel: "web page", rootpart: "web+page" },
    {formatlabel: "event", rootpart: "event" },
    {formatlabel: "personal narrative", rootpart: "personal+narrative" },
    {formatlabel: "3d object", rootpart: "3d+object" },
    {formatlabel: "software, e-resource", rootpart: "software,+e-resource" },
  ];
  var selectedorigformat = origformatlabels.filter(obj => {
    return obj.formatlabel === format;
  });
  if (selectedorigformat.length > 0) {
    var searchroot = "https://www.loc.gov/search/?fa=original-format:" + selectedorigformat[0].rootpart + "&q=";
  }
  return searchroot;
}
