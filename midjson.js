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
      else return null;
    }
  }


  /* --------------------- */
  /* ---[ JSON PARSER ]--- */
  /* --------------------- */

  // entry point for parsing JSON text
  function parse(s) {
    var escapee = {         // valid symbols after a backslash
      '"':  '"',            //   and translation table for vivifying
      '\\': '\\',
      '/':  '/',
      b:    '\b',
      f:    '\f',
      n:    '\n',
      r:    '\r',
      t:    '\t'
    };
    
    /* ---[ main ]--- */
    var r;                      // result: vivified JavaScript entites from JSON
    var ast = {val: undefined}; // holder of return value from recursive descent parsing
                                //   it needs a wrapper to let naked null/false indicate non-match
    var scnr = makeStrScanner(s);
    r = pvalue();
    pwhite();
    // DEBUG
    console.log("DEBUG 2: " + ast.val)
    console.log("DEBUG 3: " + scnr.eos())
    // END DEBUG
    //~TODO: may not need all these checks ...
    if (r && ast.val !== undefined && scnr.eos()) return ast.val;
    else perror("Unable to fully parse JSON text");
    
    
    /* ---[ Parser Functions ]--- */
    
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

    /**
     * Compares the characters in the string +chars+ one at a time
     * each with a call to scnr.next(), thus advancing the scanner pointer.
     * @param [String] chars - one of more chars (in a string) expected
     *        next in the JSON text
     * @return true if all match
     * @throws SyntaxError if mismatch found
     */
    function expect(chars) {
      var i;
      for (i = 0; i < chars.length; i++) {
        var exp = chars.charAt(i);
        var act = scnr.next();
        console.log("exp-ch: " + exp + "; act-ch: " + act);
        if (exp !== act) perror("Expected chars not seen");
        // if (chars.charAt(i) != scnr.next()) perror("Expected chars not seen");
      }
      return true;
    }

    /**
     * Advances scanner pointer through any whitespace
     * at the current pointer.
     * @return void
     */
    function pwhite() {
      var ch;
      // this assumes UTF-8 or compatible charset for 'whitespace' chars
      while ( (ch = scnr.next() && ch <= ' ') ) {}
    }
    
    function pkeyword() {
      switch (scnr.curr()) {
      case 't':
        expect('rue');
        ast.val = true;
        return ast;
      case 'f':
        expect('alse');
        ast.val = false;
        return ast;
      case 'n':
        expect('ull');
        ast.val = null;
        return ast;
      default:
        perror("Unexpected char: " + scnr.curr());
      }
    }
    
    function pnumber() {
      //      /[+-]?\d+\.?\d*[Ee]?[+-]?\d*/
      var numstr = '';
      var ch = scnr.curr();
      if (ch === '-') {
        numstr = '-';
        ch = scnr.next();
      }
      while (ch >= '0' && ch <= '9') {
        numstr += ch;
        ch = scnr.next();
      }
      if (ch === '.') {
        ///~TODO: LEFT OFF HERE
      }
      
      //~TODO: remove this bogus return val
      return false;
    }

    function pstring() {
      return false;
    }

    function parray() {
      return false;
    }

    function pobject() {
      return false;
    }

    function perror(msg) {
      var s = msg + " at pos: " + scnr.at() + "\nfor json text: " + scnr.fulltext();
      throw new SyntaxError(s);
    }

    /* ---[ StringScanner ]--- */

    // factory method for a StringScanner
    function makeStrScanner(str) {
      var json = s;           // the text to parse
      var at   = 0;           // current pos in json text
      var ch = ' ';           // current char

      function next() {
        // this returns '' if ask for char after end of the string
        // so no need to do bounds checking here with eos()
        ch = json.charAt(at);
        at++;
        return ch;
      }

      function curr() {
        return ch;
      }

      function pos() {
        return at;
      }

      function eos() {
        return at >= json.length;
      }

      function fulltext() {
        return json;
      }

      return {at: pos, next: next, curr: curr, eos: eos, fulltext: fulltext};
    }

  } // end parse function
  
  return {toJSON: toJSON, parse: parse};  
})();


exports.parse = MidJSON.parse;
exports.toJSON = MidJSON.toJSON;

console.log( MidJSON.parse("false") );

// var kkk;
// console.log( MidJSON.toJSON(kkk) );
