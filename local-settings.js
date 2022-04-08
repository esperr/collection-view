//change according to local system -- these are the defaults for Library of Congress
const systemtype = "lc";
const baseURL = "https://www.loc.gov/search/";

//Which facets are you going to compare?
const proportionfacets = [
  {typedesc: "original-format", type: "format" },
  {typedesc: "dates", type: "century" },
];

//This only gets edited if you're adding a new system (or something breaks)
function getCount(data) {
  let myTotalCount;
  if (systemtype=="lc") {
    myTotalCount = data.search.hits;
  } else if (systemtype=="primo") {
    myTotalCount = data.info.total;
  }
  return myTotalCount;
}

function getFacets(data, typedesc) {
  let facetsRoot;
  let finalCounts;
  if (systemtype=="lc") {
    facetsRoot = data.facets;
    let filteredFacets = facetsRoot.filter(obj => {
      return obj.type === typedesc;
    });
    finalCounts = filteredFacets[0].filters;
  } else if (systemtype=="primo") {
    facetsRoot = data.facets;
    let filteredFacets = facetsRoot.filter(obj => {
      return obj.name === typedesc;
    });
    finalCounts = filteredFacets[0].values;
  }
  return finalCounts;
}
