var MidJSON = (function() {
  
  /* --------------------- */
  /* ---[ JSON WRITER ]--- */
  /* --------------------- */

  function toJSON(v) {
    var r = (strBoolean(v) || 
             strString(v)  ||
             strNumber(v)  ||
             strArray(v)   ||
             strObject(v)  ||
             strNull(v));
    if (r) return r;
    else throw "Invalid param to serialize to JSON";
  }

  function strBoolean(v) {
    if (typeof(v) === 'boolean') {
      return String(v);
    } else {
      return null;
    }
  }

  function strString(v) {
    if (typeof(v) === 'string') return '"' + v + '"';
    else return null;
  }

  function strNumber(v) {
    if (typeof(v) === 'number' && isFinite(v)) return String(v);
    else return null;
  }

  function strArray(v) {
    // note the instanceof Array test can fail in some browser circumstances
    // Crockford instead uses the ugly:
    //    if (Object.prototype.toString.apply(value) === '[object Array]') {
    // to handle this problem but it may be fragile to future ECMAScript changes
    if (v instanceof Array) {
      var toks = [];
      v.forEach( function(e) {
        toks.push(toJSON(e));
      });
      return '[' + toks.join() + ']';
    } else {
      return null;
    }
  }

  function strObject(v) {
    if (v && typeof(v) === 'object') {
      var keys = [], vals = [];
      for (k in v) {
        // ensure serialize direct properties, not inherited ones
        if (Object.prototype.hasOwnProperty.call(v, k)) {
          keys.push( toJSON(k) );
          vals.push( toJSON(v[k]) );
        }
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

  function strNull(v) {
    if (!v && typeof(v) === 'object') return 'null';
    else null;
  }


  /* --------------------- */
  /* ---[ JSON PARSER ]--- */
  /* --------------------- */

  //~TODO: need to prototype creating a enclosed
  // StringScanner that is created each time parse is called
  // similar to the Ruby model ...
  // practice with somethign simple first to get the JS structure right

  var json;          // the text to parse
  var pos;           // current pos in json text
  var ch;            // current char
  var escapee = {    // valid symbols after a backslash
    '"':  '"',       //   and translation table for vivifying
    '\\': '\\',
    '/':  '/',
    b:    '\b',
    f:    '\f',
    n:    '\n',
    r:    '\r',
    t:    '\t'
  };

  // main entry point for parsing JSON text
  function parse(s) {
    var r;    // result: vivified JavaScript entites from JSON
    json = s;
    pos  = -1;
    ch   = ' ';
    var ast = {val: null};  // holder of return value from recursive descent parsing
                            // it needs a wrapper to let naked null/false indicate non-match

    r = pvalue();
    //~TODO: probably need to churn through whitespace and check if "eos"
  }
  
  function next(c) {
    if (c && c != ch) {
      throw "Expected char '" + c + "' does not match current char: " + ch;
    }
    pos++;
    ch = json.charAt(pos);  // charAt returns '' if pos is beyond end of string
    return ch; //~TODO: do we need to return char here - who uses it?
  }

  function pwhite() {
    // this assumes UTF-8 or compatible charset for 'whitespace' chars
    while (ch && ch <= ' ') next();
  }

  //~TODO: should we just move this function into parse?
  function pvalue() {
    pwhite();  // when returns will be at the char after the last white space
    return (parray()   ||
            pobject()  ||
            pstring()  ||
            pnumber()  ||
            pkeyword() ||
            perror("Unable to parse next value")
           );
  }

  function perror(msg) {
    var s = msg + " at pos: " + pos + "\nfor json text: " + json;
    throw new SyntaxError(s);
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
