(function () {
  'use strict';

  var storageKey = "assembly_params"

  function previouslyStoredParams() {
    if (window.localStorage) {
      var storedParams = localStorage.getItem(storageKey);

      if (storedParams && storedParams.length > 0) {
        return storedParams;
      }
    }

    return undefined;
  }

  function storeParamsLocally(params) {
    if (window.localStorage) {
      localStorage.setItem(storageKey, params);
    }
  }

  // Get the raw string from a search string
  function searchParamsString(search, prefix) {
    // Sanity check
    if (!search || search.length <= 0 || typeof search !== 'string') {
      return;
    }

    var parsedSearch = search;

    // If the browser supports URLSearchParams, use it and 
    // its toString() convenience method (which stripes the
    // question mark from it)
    //
    // If the browser doesn't support it, check to see if
    // the string starts with a question mark -- if it does,
    // remove it. Otherwise, return the search params.
    if (typeof window.URLSearchParams !== 'undefined') {
      parsedSearch = ''
      var searchParams = new window.URLSearchParams(search);

      if (prefix) {
        for (var [key, value] of searchParams) {
          if (key.startsWith(prefix)) {
            parsedSearch += key + '=' + value + '&'
          }
        }
      } else {
        parsedSearch = searchParams.toString()
      }
    } else if (search.startsWith("?")) {
      parsedSearch = search.substring(1);
    }

    return parsedSearch;
  }

  // Merge two searches without duplicating params
  function mergeSearchParams(lhs, rhs) {
    if (!lhs && !rhs) return '';
    if (!lhs) return rhs;
    if (!rhs) return lhs;

    var merged = '';

    if (typeof window.URLSearchParams !== 'undefined') {
      // If the browser supports URLSearchParams, use it.

      var lhsSearchParams = new window.URLSearchParams(lhs);
      var rhsSearchParams = new window.URLSearchParams(rhs);

      // We start with the left-hand side as our base
      var urlSearchParamsResult = new window.URLSearchParams(lhsSearchParams.toString());

      // Loop through the right-side
      for (var param of rhsSearchParams) {
        // Sanity checking the right-side param
        if (!param || !Array.isArray(param) || param.length <= 0) {
          continue;
        }

        // Get the name and the value
        var paramName = param[0];
        var paramValue = param.length > 1 ? param[1] : '';

        // If that param doesn't exist on lhs, add it to the final
        // search params
        if (!lhsSearchParams.get(paramName)) {
          urlSearchParamsResult.set(paramName, paramValue);
        }
      }

      // Convert the final search params into a string and return it
      merged = urlSearchParamsResult.toString();
    } else {
      // If the browser doesn't support URLSearchParams...

      // Get every param from the left- and right-side by splitting
      // the strings on the "&" character
      var lhsSplit = lhs.split("&");
      var rhsSplit = rhs.split("&");

      // Our finalSearchParam starts with a copy of the left-side (our
      // base)
      var finalSearchParams = lhs.slice();

      // Loop through every param of the right-side
      for (var i = 0; i < rhsSplit.length; i++) {
        var shouldMerge = true;

        // Get the right-side name by splitting it on the "=" character
        var newParam = rhsSplit[i];
        var newParamName = newParam.split('=')[0];

        // Loop through the left-side to make sure it doesn't exist there
        for (var j = 0; j < lhsSplit.length; j++) {
          var existingParam = lhsSplit[j];
          var existingParamName = existingParam.split('=')[0];

          // If it exists, break the loop
          if (newParamName === existingParamName) {
            shouldMerge = false;
            break;
          }
        }

        if (!shouldMerge) {
          continue;
        }

        // Add the new param to the existing finalSearchParams
        finalSearchParams = finalSearchParams + '&' + newParam;
      }
      
      merged = finalSearchParams;
    }

    return merged;
  }

  // DOMContentLoaded, unlike onload, will fire only after the
  // DOM's been rendered and analyzed.
  document.addEventListener('DOMContentLoaded', function() {
    // Try getting the params from localStorage
    var prevParams = previouslyStoredParams();

    var additionalParams;

    if (prevParams && prevParams) {
      additionalParams = prevParams;
    } else {
      // We start by getting the current search (?param1=foo&param2=bar)
      var search = typeof location !== 'undefined' ? location.search : window.location.search;
      
      // We then turn it into a string
      additionalParams = searchParamsString(search, "utm_");

      if (additionalParams && additionalParams.length > 0) {
        // And then save them to local storage
        storeParamsLocally(additionalParams);
      }
    }

    if (!additionalParams || typeof additionalParams !== 'string' || additionalParams.length <= 0) {
      return
    }

    // Listing all links available on the page
    var linksCollection = document.getElementsByTagName('a');
    var linksArray;

    // It can be an HTMLCollection, so we must make it an array
    if (typeof Array.from !== 'undefined') {
      // If the browser supports Array.from, we call it just to
      // be sure -- won't hurt. 
      linksArray = Array.from(linksCollection);
    } else {
      // If the browser doesn't support it, we check if it's an
      // array. If it is, do nothing. Otherwise, convert it
      // using slice.call (creating an empty array and then
      // iterating through the collection).
      if (Array.isArray(linksCollection)) {
        linksArray = linksCollection;
      } else {
        linksArray = [].slice.call(linksCollection);
      }
    }

    // If there are no links available, ignore it
    if (!linksArray || linksArray.length <= 0) {
      return;
    }

    // Now that we know that the links are in an array, create 
    // a loop
    for (var i = 0; i < linksArray.length; i++) {
      var link = linksArray[i];
      var href = link.getAttribute('href')

      if (href && href.indexOf('#') > -1) {
        continue;
      }
      
      // There are two pieces for every link: the base and the 
      // existing URL params

      var linkBase = '';
      var existingParams = '';

      if (typeof window.URL !== 'undefined') {
        // If the browser supports URL object, create a new
        // instance and get the base and params from it.

        try {
          var url = new URL(link);
          var linkSearch = url.search;
          linkBase = url.origin + url.pathname;
          existingParams = searchParamsString(linkSearch);
        } catch (error) {
          continue;
        }
      } else {
        // If it doesn't, get those values by splitting the href
        // on the "?" character. The first element will always be
        // the base. The rest, we consider to be the existing
        // params.

        var href = link.getAttribute('href');
        var split = href.split('?');

        if (split && split.length >= 1) {
          linkBase = split[0];

          if (split.length > 1) {
            existingParams = split.slice(1, split.length);
          }
        } else {
          continue;
        }
      }

      // The final params of the link will be the existing params and
      // the additional ones merged together.
      var finalParams = additionalParams;

      if (existingParams) {
        finalParams = mergeSearchParams(additionalParams, existingParams);
      }

      // One final sanity check
      if (!finalParams || finalParams.length <= 0 || !linkBase || linkBase.length <= 0) {
        continue;
      }

      // Update the href attribute to the base + params
      link.setAttribute("href", linkBase.concat('?', finalParams));
    }
  });
})();