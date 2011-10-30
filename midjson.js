var MidJSON = (function() {
  
  /* --------------------- */
  /* ---[ JSON WRITER ]--- */
  /* --------------------- */

  function toJSON(v) {
    var r = (doBoolean(v) || 
             doString(v)  ||
             doNumber(v)  ||
             doArray(v)   ||
             doObject(v)  ||
             doNull(v));
    if (r) return r;
    else throw "Invalid param to serialize to JSON";
  }

  function doBoolean(v) {
    if (typeof(v) === 'boolean') {
      return (v ? '"true"' : '"false"');
    } else {
      return null;
    }
  }

  function doString(v) {
    if (typeof(v) === 'string') return '"' + v + '"';
    else return null;
  }

  function doNumber(v) {
    if (typeof(v) === 'number') return String(v);
    else return null;
  }

  function doArray(v) {
    if (v instanceof Array) {
      var toks = [];
      v.forEach( function(e) {
        toks.push(toJSON(e));
      });
      return '[' + toks.join() + ']'
    } else {
      return null;
    }
  }

  function doObject(v) {
    if (v && typeof(v) === 'object') {
      var keys = [], vals = [];
      for (k in v) {
        keys.push( toJSON(k) );
        vals.push( toJSON(v[k]) );
      }
      var json = '{';
      for (var i = 0; i < keys.length; i++) {
        json += keys[i] + ": " + vals[i];
        if (i != keys.length - 1) json += ", ";
      }
      return json + '}';
      
    } else {
      return null;
    }
  }

  function doNull(v) {
    if (!v && typeof(v) === 'object') return '"null"';
    else null;
  }

  /* --------------------- */
  /* ---[ JSON PARSER ]--- */
  /* --------------------- */

  function parse(s) {
    if (s === "true") return true;
    else if (s === "false") return false;
    else return null;
  }

  return {toJSON: toJSON, parse: parse};  
})();


exports.parse = MidJSON.parse;
exports.toJSON = MidJSON.toJSON;


// console.log( MidJSON.toJSON(true) );
// console.log( MidJSON.toJSON("foo") );
// console.log( MidJSON.toJSON(-445.2) );
// console.log( MidJSON.toJSON([-445.2, "foo", true, null]) );
// console.log( MidJSON.toJSON( { bar: [-445.2, "foo", true],
//                                 "quux:": "deluxe"} ) );
// var jjj = null;
// console.log( MidJSON.toJSON(jjj) );

// var kkk;
// console.log( MidJSON.toJSON(kkk) );
