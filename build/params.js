(function(){"use strict";function a(){if(window.localStorage){var a=localStorage.getItem("assembly_snippet_params");if(a&&0<a.length)return a}}function b(a){window.localStorage&&localStorage.setItem("assembly_snippet_params",a)}function c(a,b){if(a&&!(0>=a.length)&&"string"==typeof a){var c=a,d=!1;if("undefined"!=typeof window.URLSearchParams){c="";var e=new window.URLSearchParams(a);if(b){for(var[f,g]of e){const a=b.filter(a=>f.startsWith(a));0<a.length&&(c+=f+"="+g+"&",d=!0)}d&&(c=c.slice(0,-1))}else c=e.toString()}else a.startsWith("?")&&(c=a.substring(1));return c}}function d(a,b){if(!a&&!b)return"";if(!a)return b;if(!b)return a;var c="";if("undefined"!=typeof window.URLSearchParams){var d=new window.URLSearchParams(a),e=new window.URLSearchParams(b),f=new window.URLSearchParams(d.toString());for(var g of e)if(g&&Array.isArray(g)&&!(0>=g.length)){var h=g[0],k=1<g.length?g[1]:"";h&&!d.get(h)&&f.set(h,k)}c=f.toString()}else{for(var l=a.split("&"),m=b.split("&"),n=a.slice(),o=0;o<m.length;o++){for(var p=!0,q=m[o],r=q.split("=")[0],s=0;s<l.length;s++){var t=l[s],u=t.split("=")[0];if(r===u){p=!1;break}}p&&q&&(n=n+"&"+q)}c=n}return c}document.addEventListener("DOMContentLoaded",function(){var e,f=a();if(f&&f)e=f;else{var g="undefined"==typeof location?window.location.search:location.search;e=c(g,["utm_","ref"]),e&&0<e.length&&b(e)}if(e&&"string"==typeof e&&!(0>=e.length)){var h,j=document.getElementsByTagName("a");if(h="undefined"==typeof Array.from?Array.isArray(j)?j:[].slice.call(j):Array.from(j),h=h.filter(a=>{var b=a.getAttribute("href");return!!b&&!(-1<b.indexOf("mailto"))&&-1<b.indexOf("assemblyai.com")}),h&&!(0>=h.length))for(var k=0;k<h.length;k++){var l=h[k],m=l.getAttribute("href");if(!(m&&-1<m.indexOf("#"))){var n="",o="";if("undefined"!=typeof window.URL)try{var p=new URL(l),q=p.search;n=p.origin+p.pathname,o=c(q)}catch(a){continue}else{var m=l.getAttribute("href"),r=m.split("?");if(r&&1<=r.length)n=r[0],1<r.length&&(o=r.slice(1,r.length));else continue}var s=e;(o&&(s=d(e,o)),s&&!(0>=s.length)&&n&&!(0>=n.length))&&l.setAttribute("href",n.concat("?",s))}}}})})();