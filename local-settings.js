//change according to local system -- these are the defaults for Library of Congress

const baseURL = "https://www.loc.gov/search/";

const proportionfacets = [
  {typedesc: "original-format", type: "format" },
  {typedesc: "dates", type: "century" },
];

function getCount(data) {
  let myTotalCount = data.search.hits;
  return myTotalCount;
}

function getFacets(data, typedesc, systemtype) {
  let facetsRoot;
  if (systemtype=="lc") {
    facetsRoot = data.facets;
  } else {
    alert("Not lc!");
  }
  let filteredFacets = facetsRoot.filter(obj => {
    return obj.type === typedesc;
  });
  if (systemtype=="lc") {
    finalCounts = filteredFacets[0].filters;
  } else {
    alert("Not lc!");
  }
  return finalCounts;
}
