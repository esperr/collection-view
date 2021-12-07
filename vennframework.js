overlapcalls = 0;
var totalsets = 0;
var sets = [];
var overlaps = [];
var vennsearches = [];
var termsarray = [];
var search;
var index;
var myOverlap;
var mySet;
var mySearch;
var myIndex;
var waitTime = 50;


//display sharing link
$( "#vennresults" ).on( "click", ".shareLink", function() {
  var currentLocation = location.protocol + '//'+ location.hostname + (location.port ? ':'+location.port: '') + location.pathname;
  searchstr = $("#search").val();
  var shareUrl = currentLocation + "?" + encodeURIComponent(searchstr);
  $( "#printable-stuff" ).append('<p>Copy this link your clipboard to share: <input type="text" id="sharingUrlcontent"></p>');
  //$( "textarea" ).attr( "rows", "width: 40em;" );
  $( "#sharingUrlcontent" ).attr( "style", "width: 40em;" );
  $( "#sharingUrlcontent" ).attr( "value", shareUrl );
  $( "#sharingUrlcontent" ).select();
});



function setOverlapSet(slist, sresults) {
  this.sets = slist;
  this.size = Number(sresults);
}

function setSet(slabel, ssize) {
  this.sets = [sets.length];
  this.label = slabel;
  this.size = Number(ssize);
}

function setSearch(sets, terms) {
  this.sets = sets;
  this.terms = terms;
}

function psearch(searchstr, callback) {
  checktime();

  function checktime() {
    var t1 = performance.now();
    var timediff = t1 - pausetime;
    if (timediff > waitTime) {
      callutils();
    } else {
      setTimeout(checktime, 30);
    }
  }

  function callutils() {
    calltime = performance.now();
    pausetime = calltime;
    $.ajax({
      url: baseURL,
      error: function () {
        waitTime = waitTime+10;
        psearch(searchstr, callback);
        //alert("Oops, something went wrong. Please try again!")
        //return;
      },
      data: {
        all: 'true',
        q: searchstr,
        fo: 'json'
      },
      success: callback
    });
  }

}

function buildOLCounts(search) {
  psearch(search.terms, function( data ) {
    myOverlap = new setOverlapSet(search.sets,getCount(data));
    sets.push(myOverlap);
    if (sets.length == totalsets) {
      drawVennDiagram();
      writeSets();
      if (totalsets > 7)
        $("#vennresults").append('<div class="alert alert-warning" role="alert">Warning, Venn diagram may be inaccurate with more than 3 search terms.</div>');
      //drawPrintable ();
    }
  });
}

function writeSets() {
  var mysets = [];
  mysets = sets.slice(0);
  searches[myIndex].vennsets = mysets;
}

function getOLCounts() {
  //We do it this way instaed of a loop so we can easily throttle the count requests with setTimeout

  mysearch = vennsearches.pop();
  buildOLCounts(mysearch);
  var progressProportion = 1/vennsearches.length;
  $("progress").attr("value", progressProportion*100);
  if (vennsearches.length) {
	  setTimeout(getOLCounts, 30);
  } else {
    return;
  }
}

function getOverlaps() {
  var results;
  var overlapcount = 0;

  // get set indices for each subset
  var indices = [];
  for (i = 0; i < sets.length; i++)
    indices.push(i);
  var subsets = combinations(indices, 2);

  // run through each subset and search it
  for (i = 0; i < subsets.length; i++) {
    search = "(";
    for (j = 0; j < subsets[i].length; j++) {
      search += sets[subsets[i][j]].label;
      if (j < subsets[i].length - 1)
        search += ") AND (";
    }
    search += ")";
    mySearch = new setSearch(subsets[i], search);
    vennsearches.push(mySearch);
  }

  totalsets = vennsearches.length + sets.length;
  getOLCounts();

}

// get all combinations of items in array a that are at least of size min
function combinations(a, min) {
  var fn = function(n, src, got, all) {
    if (n == 0) {
      if (got.length > 0) {
        all[all.length] = got;
      }
      return;
    }
    for (var j = 0; j < src.length; j++) {
      fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
    }
    return;
  }
  var all = [];
  for (var i = min; i < a.length; i++) {
    fn(i, a, [], all);
  }
  all.push(a);
  return all;
}

function getSimpleSets(termsarray, possibles) {
  pausetime = performance.now();
  $.each(termsarray, function (i, term) {
    //for (term of termsarray) {
    psearch(term, function( data ) {
	    var numResults = Number(getCount(data));
	    if (numResults != 0) {
		    mySet = new setSet(term, numResults);
		    sets.push(mySet);
	    }
      if (sets.length >= possibles) { getOverlaps(); }
    });
    //}
  });
}

function startVenn(searchkey, term) {
  myIndex = searchkey;
  //clear the decks
  $("#vennresults").empty();
  $( "#vennresults" ).append('<div class="vennMsg"><p>Loading your diagram. Please wait...</p><progress id="fetchresults" value="1" max="100"></progress></div> ');

  while (sets.length) { sets.pop(); }
  while (vennsearches.length) { vennsearches.pop(); }
  while (overlaps.length) { overlaps.pop(); }

  //check for parentheses in our search string
  var termsarray = [];
  var parensdex = 0;
  //console.log("term: " + term);
  findParens(term);

  function findParens() {
    if ((term.lastIndexOf(")")) > -1) {
      var n = term.indexOf("(");
      for(var i=n; i < term.length; i++){
        if(term.charAt(i) == '(') { parensdex+=1 }
        if(term.charAt(i) == ')') { parensdex-=1 }
        if( parensdex == 0 && /\(/g.test(term) ) {
          parenTerm = term.slice(n,i+1);
          termsarray.push(parenTerm);
          termPartone = term.slice(0,n);
          termParttwo = term.slice(i+1);
          term = termPartone + termParttwo;
          findParens(term);
        }
      }
    } else { return; }
  }
  //console.log("Termsarray: " + termsarray);
  var termsarray2 = term.split(/ and | or | not /i);
  termsarray.push.apply(termsarray, termsarray2);
  termsarray = partCleaner(termsarray);
  var termsarray = termsarray.filter(function(val) {
    return !(val === " " || val === "" || typeof val == "undefined" || val === null || val == " AND " || val == " OR " || val == " NOT ");
  });
  //console.log("Termsarray: " + termsarray);

  var possibleTerms = termsarray.length;
  //if (data.esearchresult.errorlist) {
  //	possibleTerms = possibleTerms - Number(data.esearchresult.errorlist.phrasesnotfound.length);
  //}
  if (possibleTerms<2) {
	  $("#vennresults").empty();
	  $("#vennresults").append('<p class="vennMsg">Only one valid search term entered</p><p class="vennMsg">Use Boolean opeartors or <em>combine</em> multiple searches using the menu on the right to see a Venn diagram</p>');
    searches[myIndex].vennsets = [];
  } else {
	  getSimpleSets(termsarray, possibleTerms);
    //shareLinks([term], "venn");
  }
}

function partCleaner(parts) {
  cleanedTerms = [];
  for (var i = 0; i < parts.length; i++) {
    var str = parts[i];
    str = str.replace(/(^\(|\)$)/g, '');
    cleanedTerms.push(str);
  }
  return cleanedTerms;
}

function compVenn(comparisons) {
  //clear the decks
  $("#vennresults").empty();
  $( "#vennresults" ).append('<div class="vennMsg"><p>Loading your diagram. Please wait...</p><progress id="fetchresults" value="1" max="100"></progress></div> ');

  while (sets.length) { sets.pop(); }
  while (vennsearches.length) { vennsearches.pop(); }
  while (overlaps.length) { overlaps.pop(); }
  var compareterms = [];
  for (i=0; i<comparisons.length; i++) {
    compareterms.push(searches[comparisons[i]].term);
  }
  possibleTerms = compareterms.length;
  getSimpleSets(compareterms, possibleTerms);
  setNickname();

  function setNickname() {
    if (sets.length < compareterms.length) {
    	setTimeout(setNickname, 300);
    } else {
      for (i=0; i<comparisons.length; i++) {
        if (searches[comparisons[i]].nickname) {
          for (n=0; n<comparisons.length; n++) {
            var origterm = searches[comparisons[i]].term;
            var setlabel = sets[n].label.replace(/\\/g, '');
            if ( origterm == setlabel ) {
              sets[n].label = '"' + searches[comparisons[i]].nickname + '"';
            }
          }
        }
      }
      drawVennDiagram();
    }
  }
}

function drawVennDiagram() {
  $("#vennresults").empty();
  var chart = venn.VennDiagram()
      .width(vennwidth)
      .height(vennwidth);

  var div = d3.select("#vennresults")
  div.datum(sets).call(chart);

  //var fixtext = d3.selectAll("text")
  //         .attr("font-size","1.25em");

  //var svg = d3.select("svg").call(zoom);

  var tooltip = d3.select("body").append("div")
      .attr("class", "venntooltip");

  div.selectAll("path")
    .style("stroke-opacity", 0)
    .style("stroke", "#fff")
    .style("stroke-width", 0)

  div.selectAll("g")
    .on("mouseover", function(d, i) {
      // sort all the areas relative to the current item
      venn.sortAreas(div, d);

      // Display a tooltip with the current size
      tooltip.transition().duration(400).style("opacity", .9);
      tooltip.text(d.size + " citations");

      // highlight the current path
      var selection = d3.select(this).transition("tooltip").duration(400);
      selection.select("path")
        .style("stroke-width", 3)
        .style("fill-opacity", d.sets.length == 1 ? .4 : .1)
        .style("stroke-opacity", 1);
    })

    .on("mousemove", function() {
      tooltip.style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })

    .on("mouseout", function(d, i) {
      tooltip.transition().duration(400).style("opacity", 0);
      var selection = d3.select(this).transition("tooltip").duration(400);
      selection.select("path")
        .style("stroke-width", 0)
        .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
        .style("stroke-opacity", 0);
    })

    .on("click", function(d, i) {
      vennresults(d);
    })
}

function vennresults (d) {
  if (d.sets.length > 1) {
	  var newsearchterms = d.sets.map(function(term) {
	    return sets[term].label;
	  });
    searchterms = newsearchterms.join(" AND ");
  } else {
	  searchterms = d.label;
  }
  var vennlocurl = LOCstem + searchterms;
  window.open(vennlocurl,'_vennsearch');
}
