var assert = require("assert");
var MidJSON = require("./midjson.js");
//var print   = process.stdout.write;
var println = console.log;
var stdout = process.stdout;

/* ---[ WRITER TESTS ]--- */
println("Writer Tests");

(function test_keyword_writing() {
  assert.strictEqual(MidJSON.toJSON(true),  '"true"');
  assert.strictEqual(MidJSON.toJSON(false), '"false"');
  assert.strictEqual(MidJSON.toJSON(null),  '"null"');
  stdout.write('.');
})();

(function test_number_writing() {
  assert.strictEqual(MidJSON.toJSON(1),     "1");
  assert.strictEqual(MidJSON.toJSON(1.2),   "1.2");
  assert.strictEqual(MidJSON.toJSON(-0.33), "-0.33");
  stdout.write('.');
})();

(function test_array_writing() {
  assert.strictEqual(MidJSON.toJSON([1,2,3]), "[1,2,3]");
  assert.strictEqual(MidJSON.toJSON([1,2,"a",[4,5,"b"]]), '[1,2,"a",[4,5,"b"]]');
  assert.strictEqual(MidJSON.toJSON([1,2,"a",{"foo": "bar", "quux": 5}]), '[1,2,"a",{"foo": "bar", "quux": 5}]');
  stdout.write('.');
})();

(function test_object_writing() {
  assert.strictEqual(MidJSON.toJSON({a:1, b:2, c:3}), '{"a": 1, "b": 2, "c": 3}');
  assert.strictEqual(MidJSON.toJSON({a:1, b:[2,33,"a"], c:3}), 
                     '{"a": 1, "b": [2,33,"a"], "c": 3}');
  assert.strictEqual(MidJSON.toJSON({a:{dog :    "whisperer", ary: [11]}, b:[2,33,"a"], c:3}), 
                     '{"a": {"dog": "whisperer", "ary": [11]}, "b": [2,33,"a"], "c": 3}');
  stdout.write('.');
})();


/* ---[ PARSER TESTS ]--- */

println("\nParser Tests");

(function test_keyword_parsing() {
  assert.strictEqual(MidJSON.parse("true"),  true);
  assert.strictEqual(MidJSON.parse("false"), false);
  assert.strictEqual(MidJSON.parse("null"),  null);
  stdout.write('.');
})();

(function test_number_parsing() {
  assert.strictEqual(MidJSON.parse("42"),     42);
  assert.strictEqual(MidJSON.parse("-13"),    -13);
  assert.strictEqual(MidJSON.parse("3.1415"), 3.1415);
  assert.strictEqual(MidJSON.parse("-0.01"),  -0.01);
  stdout.write('.');
})();

//     assert_equal(0.2e1,   @parser.parse("0.2e1"))
//     assert_equal(0.2e+1,  @parser.parse("0.2e+1"))
//     assert_equal(0.2e-1,  @parser.parse("0.2e-1"))
//     assert_equal(0.2E1,   @parser.parse("0.2e1"))
//   end

//   def test_string_parsing
//     assert_equal(String.new,          @parser.parse(%Q{""}))
//     assert_equal("JSON",              @parser.parse(%Q{"JSON"}))

//     assert_equal( %Q{nested "quotes"},
//                   @parser.parse('"nested \"quotes\""') )
//     assert_equal("\n",                @parser.parse(%Q{"\\n"}))
//     assert_equal( "a",
//                   @parser.parse(%Q{"\\u#{"%04X" % ?a.codepoints.first}"}) )
//   end

//   def test_array_parsing
//     assert_equal(Array.new, @parser.parse(%Q{[]}))
//     assert_equal( ["JSON", 3.1415, true],
//                   @parser.parse(%Q{["JSON", 3.1415, true]}) )
//     assert_equal([1, [2, [3]]], @parser.parse(%Q{[1, [2, [3]]]}))
//   end

//   def test_object_parsing
//     assert_equal(Hash.new, @parser.parse(%Q{{}}))
//     assert_equal( {"JSON" => 3.1415, "data" => true},
//                   @parser.parse(%Q{{"JSON": 3.1415, "data": true}}) )
//     assert_equal( { "Array"  => [1, 2, 3],
//                     "Object" => {"nested" => "objects"} },
//                   @parser.parse(<<-END_OBJECT) )
//    {"Array": [1, 2, 3], "Object": {"nested": "objects"}}
//    END_OBJECT
//   end

//   def test_parse_errors
//     assert_raise(RuntimeError) { @parser.parse("{") }
//     assert_raise(RuntimeError) { @parser.parse(%q{{"key": true false}}) }

//     assert_raise(RuntimeError) { @parser.parse("[") }
//     assert_raise(RuntimeError) { @parser.parse("[1,,2]") }

//     assert_raise(RuntimeError) { @parser.parse(%Q{\"}) }
//     assert_raise(RuntimeError) { @parser.parse(%Q{"\\i"}) }

//     assert_raise(RuntimeError) { @parser.parse("$1,000") }
//     assert_raise(RuntimeError) { @parser.parse("1_000") }
//     assert_raise(RuntimeError) { @parser.parse("1K") }

//     assert_raise(RuntimeError) { @parser.parse("unknown") }
//   end

//   def test_int_parsing
//     assert_same(0,     @parser.parse("0"))
//     assert_same(42,      @parser.parse("42"))
//     assert_same(-13,     @parser.parse("-13"))
//   end

//   def test_more_numbers
//     assert_equal(5, @parser.parse("5"))
//     assert_equal(-5, @parser.parse("-5"))
//     assert_equal 45.33, @parser.parse("45.33")
//     assert_equal 0.33, @parser.parse("0.33")
//     assert_equal 0.0, @parser.parse("0.0")
//     assert_equal 0, @parser.parse("0")
//     assert_raises(RuntimeError) { @parser.parse("-5.-4") }
//     assert_raises(RuntimeError) { @parser.parse("01234") }
//     assert_equal(0.2e1, @parser.parse("0.2E1"))
//     assert_equal(42e10, @parser.parse("42E10"))
//   end

//   def test_more_string
//     assert_equal("abc\befg", @parser.parse(%Q{"abc\\befg"}))
//     assert_equal("abc\nefg", @parser.parse(%Q{"abc\\nefg"}))
//     assert_equal("abc\refg", @parser.parse(%Q{"abc\\refg"}))
//     assert_equal("abc\fefg", @parser.parse(%Q{"abc\\fefg"}))
//     assert_equal("abc\tefg", @parser.parse(%Q{"abc\\tefg"}))
//     assert_equal("abc\\efg", @parser.parse(%Q{"abc\\\\efg"}))
//     assert_equal("abc/efg", @parser.parse(%Q{"abc\\/efg"}))
//   end

//   def test_more_object_parsing
//     assert_equal({'a' => 2,'b' => 4}, @parser.parse(%Q{{   "a" : 2 , "b":4 }}))
//     assert_raises(RuntimeError) { @parser.parse(%Q{{   "a" : 2, }}) }
//     assert_raises(RuntimeError) { @parser.parse(%Q{[   "a" , 2, ]}) }
//   end

//   def test_alexander
//     assert_raise(RuntimeError) { @parser.parse(%Q{"a" "b"}) }
//   end

//   def test_thomas
//     assert_raise(RuntimeError) { @parser.parse(%{p "Busted"}) }
//     assert_raise(RuntimeError) { @parser.parse(%{[], p "Busted"}) }
//     assert_raise(RuntimeError) { @parser.parse(%{[p "Busted"]}) }
//     assert_raise(RuntimeError) { @parser.parse(%{{1 STDOUT.puts("Busted")}})}
//     assert_raise(RuntimeError) { @parser.parse(%{"\u0022; p 123;  \u0022Busted"}) }
//     assert_raise(RuntimeError) { @parser.parse(%{"" p 123; ""}) }
//     assert_equal('#{p 123}', @parser.parse(%q{"#{p 123}"}))
//     assert_equal(['#{`ls -r`}'], @parser.parse(%q{["#{`ls -r`}"]}))
//     assert_equal('#{p 123}', @parser.parse(%q{"\\u0023{p 123}"}))
//     assert_equal('#{p 123}', @parser.parse(%q{"\u0023{p 123}"}))
//   end

//   def test_thomas2
//     assert_raise(RuntimeError) { @parser.parse(%{[], p "Foo"}) }
//     assert_raise(RuntimeError) { @parser.parse(%{""; p 123; "Foo"}) }
//     assert_raise(RuntimeError) { @parser.parse(%{"" p 123; ""}) }

//     assert_raises(RuntimeError) { @parser.parse("-5.-4") }
//     assert_raises(RuntimeError) { @parser.parse(%Q{{   "a" : 2, }}) }
//     assert_raise(RuntimeError) { @parser.parse(%q{true false}) }
//   end

// end

println("\nALL TESTS PASSED");
