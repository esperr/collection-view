getbaselines();

const proportionfacets = [
  {typedesc: "original-format", type: "format" },
  {typedesc: "dates", type: "century" },
];

const baselines = [];

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
      let totalcount = data.search.hits;

      for (var i = 0; i < proportionfacets.length; i++) {
        let typefacets = data.facets.filter(obj => {
          return obj.type === proportionfacets[i].typedesc;
        });
        let types = typefacets[0].filters
        baselines.push([]);
        let typename = proportionfacets[i].type;
        $.each( types, function( key, value ) {
          let typeconst = { 'count': value.count, 'proportion': value.count/totalcount };
          typeconst[typename] = value.title;
          baselines[i].push(typeconst);
        });

        //Build our target div...
        $("#charts").append('<div class="card mb-3 facet-chart">');
        $(".facet-chart").last().append('<div class="card-header">');
        $(".facet-chart .card-header").last().append('Proportion of each <strong>' + capitalizeFirstLetter(typename) + '</strong> compared to that in the entire collection');
        $(".facet-chart").last().append('<div class="card-body">');
        $(".facet-chart .card-body").last().append('<div id="' + typename + '_proportions">');

      }
      console.log(baselines);
    }
  });
}

function showFormatBaselineComps(searchkeys) {
  for (p = 0; p < proportionfacets.length; p++) {
    let type = proportionfacets[p].type
    var alltypes = [];
    var typeProportionsArray =  [[type]];
    let counttype = type + 'counts';
    //grab all our search terms and formats first
    for (i = 0; i < searchkeys.length; i++) {
      var searchterm = searches[searchkeys[i]].term;
      typeProportionsArray[0].push(searchterm);
      var typecounts = searches[searchkeys[i]][counttype];
      for (c = 0; c < typecounts.length; c++) {
        if(alltypes.indexOf(typecounts[c][type]) === -1){
          alltypes.push(typecounts[c][type]);
        }
      }
    }
    alltypes.sort();

    for (i=0; i<alltypes.length; i++) {
      var typevalues = [];
      typevalues.push(alltypes[i]);
      for (m=0; m<searchkeys.length; m++) {
        var mysearchtype = searches[searchkeys[m]][counttype].filter(obj => {
          return obj[type] === alltypes[i];
        });
        baselinecomp = baselines[p].filter(obj => {
          return obj[type] === alltypes[i];
        });
        if (typeof mysearchtype[0] !== "undefined") {
          console.log(baselinecomp);
          var mycomparison = mysearchtype[0].proportion - baselinecomp[0].proportion;
        } else {
          var mycomparison = 0;
        }
        typevalues.push(mycomparison);
      }
      typeProportionsArray.push(typevalues);
    }
    var typeProportionsData = google.visualization.arrayToDataTable( typeProportionsArray );
    console.log(typeProportionsData);
    var chartheight = (typeProportionsArray.length * 20) * searchkeys.length;
    if (chartheight < 120) { chartheight = 120}
    var typePropOptions = {
            bars: 'horizontal',
            height: chartheight,
            //width: mywidth,
            fontName: 'sans-serif',

           hAxis: {
             title: 'Relative Proportion',
             maxValue: .7,
             minValue: -.7,
             viewWindow: {
               max: .9,
               min: -.9
             }
           },
           vAxis: {
             title: capitalizeFirstLetter(type)
           }
         };

         var chart = new google.charts.Bar(document.getElementById(type + '_proportions'));
         //Here comes the clicky bit...
         function selectHandler() {
           var selectedItem = chart.getSelection()[0];
           if (selectedItem && selectedItem.row != null) {
             var format = typeProportionsData.getValue(selectedItem.row, 0);
             var term = typeProportionsData.getColumnLabel(selectedItem.column);
             var searchroot = getSearchRoot(format);
             var locurl = searchroot + term;
             window.open(locurl,'_formatsearch');
            }
         }
         google.visualization.events.addListener(chart, 'select', selectHandler);

         chart.draw(typeProportionsData, google.charts.Bar.convertOptions(typePropOptions));
  }
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
  var centuryProportionsData = google.visualization.arrayToDataTable( centuryProportionsArray );
  var chartheight = (centuryProportionsArray.length * 25) * searchkeys.length;
  if (centuryProportionsArray < 5) { chartheight = 130 }
  var centuryPropOptions = {
          bars: 'horizontal',
          height: chartheight,
          //width: mywidth,
          fontName: 'sans-serif',

         hAxis: {
           title: 'Relative Proportion',
           maxValue: .7,
           minValue: -.7,
           viewWindow: {
             max: .9,
             min: -.9
           }
         },
         vAxis: {
           title: 'Century'
         }
       };

       var chart = new google.charts.Bar(document.getElementById('century_proportions'));
       //Here comes the clicky bit...
       function selectHandler() {
         var selectedItem = chart.getSelection()[0];
         if (selectedItem && selectedItem.row != null) {
           var century = centuryProportionsData.getValue(selectedItem.row, 0);
           var term = centuryProportionsData.getColumnLabel(selectedItem.column);
           var centurysearchpart = century.replace(" to ", "/");
           var searchroot = "https://www.loc.gov/search/?dates="
           var locurl = searchroot + centurysearchpart + "&q=" + term;
           window.open(locurl,'_datesearch');
          }
       }
       google.visualization.events.addListener(chart, 'select', selectHandler);
       chart.draw(centuryProportionsData, google.charts.Bar.convertOptions(centuryPropOptions));

}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getSearchRoot(format) {
  const formatlabels = [
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

  const origformatlabels = [
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
