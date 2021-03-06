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
      //console.log(centurybaselines);
      //showTranslation(data.esearchresult.querytranslation);
    }
  });
}
