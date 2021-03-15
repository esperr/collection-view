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
      console.log(mycomparison);
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
      console.log(mycomparison);
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
               chart.draw(centuryProportionsData, google.charts.Bar.convertOptions(centuryPropOptions));

}

function displayCounts(searchIndex) {
  var percentArray =  [['Subheading', 'Your search percentage', 'Percentage for all records in MEDLINE']];
  var proportionsArray = [['Subheading', 'Proportion',]];
  showDone();
  if(typeof searchIndex == 'undefined') {
    var searchIndex = searches.length - 1;
  }
  if (searchIndex < 1) {
    return;
  }
  showSearches();
  $( "#chart_div" ).empty();
  total = Number(searches[searchIndex].count);
  //if total == 0 {
  //  $( "#chart_div" ).append('<div class="alert alert-danger" role="alert">Nothing found for this search. Please try again</div>.');
  //  return;
//  }
  categories = searches[searchIndex].categories;
  categories = keysrt(categories, 'category');
  $( "#chart_div" ).prepend( "<div class='proportionchart panel panel-default'>" );
  $( "#chart_div" ).prepend( "<div class='percentagechart panel panel-default'>" );
  $( "#chart_div" ).prepend( '<h3>Your search for "' + searches[searchIndex].term + '" returned ' + total + " results</h3>" );
  origcategories = keysrt(searches[0].categories, 'category');
  $.each( categories, function( i, catitem ) {
       category = catitem.category;
       origpercent = origcategories[i].proportion;
       percent =  catitem.proportion;
       comparison = catitem.proportion - origcategories[i].proportion;
       proportionsArray.push([category, comparison]);
       percentArray.push([category, percent, origpercent]);
       });
   var percentOptions = {
       chartArea: {left:20,top:0,width:'50%',height:'75%'},
       chart: {
         title: 'Percentage of results of subjects with a given subheading for "' + searches[searchIndex].term + '"'
              },
       height: myheight,
       width: mywidth,
       fontName: 'sans-serif',
       hAxis: {
         title: 'Percentage',
         format: 'percent',
         minValue: 0,
           },
      legend: { position: 'none' },
       vAxis: {
         title: 'Subheading'
         },
       bars: 'horizontal'
      };

      var compareoptions = {
              bars: 'horizontal',
              height: myheight,
              width: mywidth,
              fontName: 'sans-serif',
              legend: { position: 'none' },

             title: 'Proportion of subheadings for "' + searches[searchIndex].term + '" compared to baseline',
             hAxis: {
               title: 'Proportion',
               maxValue: .5,
               minValue: -.5,
               viewWindow: {
                 max: .6,
                 min: -.6
               }
             },
             vAxis: {
               title: 'Subheading'
             }
           };

  var perdata = google.visualization.arrayToDataTable( percentArray );
  var myPNodes = document.getElementsByClassName("percentagechart");
  var myPNode = myPNodes[0];
  var perchart = new google.charts.Bar( myPNode );
  google.visualization.events.addListener(perchart, 'select', pselect);
  perchart.draw(perdata, google.charts.Bar.convertOptions(percentOptions));
  $(".percentagechart").prepend('<div id="percentkey"><span style="color: #4285F4">Your search</span><br /><span style="color: #DB4437;">All MEDLINE</span></div>');
  $(".percentagechart").append('<a href="#!" class="printMe">Printable version</a></dt>');
  $(".printMe").first().data("type", "percentage");

  var compdata = google.visualization.arrayToDataTable( proportionsArray );
  var myCNodes = document.getElementsByClassName("proportionchart");
  var myCNode = myCNodes[0];
  var chart = new google.charts.Bar( myCNode );
  google.visualization.events.addListener(chart, 'select', cselect);
  chart.draw(compdata, google.charts.Bar.convertOptions(compareoptions));
  $(".proportionchart").append('<a href="#!" class="printMe">Printable version</a></dt>');
  $(".proportionchart").after('<br /><br /><br />');
  $(".printMe").last().data("type", "proportion");

  //var viewBox="0 0 700 400";
  //var resizeMe = document.getElementsByTagName("svg")[0];
  //console.log(resizeMe);
  //resizeMe.setAttributeNS(null,"viewBox",viewBox);
  //resizeMe.removeAttributeNS(null,"width");
  //resizeMe.removeAttributeNS(null,"height");

  function pselect() {
    selectedItem = perchart.getSelection()[0];
    if (selectedItem) {
      var resultsURL = 'https://www.ncbi.nlm.nih.gov/pubmed/';
      var pmCategory = compdata.getValue(selectedItem.row, 0);
      if (selectedItem.column == 1) {
        resultsURL = resultsURL + '?term=medline[sb]+AND+' + searches[searchIndex].term + '+AND+' + pmCategory + '[sh]';
      } else {
        resultsURL = resultsURL + '?term=medline[sb]+AND+' + pmCategory + '[sh]';
      }
      encodeURI(resultsURL);
      window.open(resultsURL,'_blank');
    }
  }

  function cselect() {
    selectedItem = chart.getSelection()[0];
    if (selectedItem) {
      var resultsURL = 'https://www.ncbi.nlm.nih.gov/pubmed/';
      var pmCategory = compdata.getValue(selectedItem.row, 0);
      resultsURL = resultsURL + '?term=medline[sb]+AND+' + searches[searchIndex].term + '+AND+' + pmCategory + '[sh]';
      encodeURI(resultsURL);
      window.open(resultsURL,'_blank');
    }
  }
  //chart.draw(compdata, google.charts.Bar.convertOptions(compareoptions));
}
