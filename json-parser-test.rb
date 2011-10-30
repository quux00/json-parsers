require "test/unit"
require "./midjson"

class TestJSONParser < Test::Unit::TestCase
  def setup
    @parser = MidJSON::Parser.new
  end

  def test_keyword_parsing
    assert_equal(true,  @parser.parse("true"))
    assert_equal(false, @parser.parse("false"))
    assert_equal(nil,   @parser.parse("null"))
  end

  def test_number_parsing
    assert_equal(42,      @parser.parse("42"))
    assert_equal(-13,     @parser.parse("-13"))
    assert_equal(3.1415,  @parser.parse("3.1415"))
    assert_equal(-0.01,   @parser.parse("-0.01"))

    assert_equal(0.2e1,   @parser.parse("0.2e1"))
    assert_equal(0.2e+1,  @parser.parse("0.2e+1"))
    assert_equal(0.2e-1,  @parser.parse("0.2e-1"))
    assert_equal(0.2E1,   @parser.parse("0.2e1"))
  end

  def test_string_parsing
    assert_equal(String.new,          @parser.parse(%Q{""}))
    assert_equal("JSON",              @parser.parse(%Q{"JSON"}))
    
    assert_equal( %Q{nested "quotes"},
                  @parser.parse('"nested \"quotes\""') )
    assert_equal("\n",                @parser.parse(%Q{"\\n"}))
    assert_equal( "a",
                  @parser.parse(%Q{"\\u#{"%04X" % ?a.codepoints.first}"}) )
  end

  def test_array_parsing
    assert_equal(Array.new, @parser.parse(%Q{[]}))
    assert_equal( ["JSON", 3.1415, true],
                  @parser.parse(%Q{["JSON", 3.1415, true]}) )
    assert_equal([1, [2, [3]]], @parser.parse(%Q{[1, [2, [3]]]}))
    assert_equal([1, [2, [3], [4,5] ]], @parser.parse(%Q{[1, [2, [3], [4,5] ]]}))
  end

  def test_safely_change_keyval_separator
    assert_equal('=>',
                 @parser.safely_change_keyval_separator(':'))
    assert_equal('{ "hi:mom"=>2, "dad"=> 3, ":donuts" => ":doughnuts" }',
                 @parser.safely_change_keyval_separator('{ "hi:mom":2, "dad": 3, ":donuts" : ":doughnuts" }'))
  end

  def test_object_parsing_starts_with_string
    assert_equal( {"cyborg" => "data"},
                  @parser.parse(%Q{"cyborg": "data"}) )
    assert_equal( {"cyborg" => {"JSON" => 3.1415, "data" => true}},
                  @parser.parse(%Q{"cyborg": {"JSON": 3.1415, "data": true}}) )
    assert_equal( {"cyborg:1" => {"JSON" => 3.1415, "data" => true}},
                  @parser.parse(%Q{ "cyborg:1": {"JSON": 3.1415, "data": true} }) )
  end

  def test_object_parsing
    assert_equal(Hash.new, @parser.parse(%Q({})))
    assert_equal( {"JSON" => 3},
                  @parser.parse(%Q{{"JSON": 3}}) )
    assert_equal( {"JSON" => 3.1415, "data" => true},
                  @parser.parse(%Q{{"JSON": 3.1415, "data": true}}) )
    assert_equal( { "Array"  => [1, 2, 3],
                    "Object" => {"nested" => "objects"} },
                  @parser.parse(<<-END_OBJECT) )
        {"Array": [1, 2, 3], "Object": {"nested": "objects"}}
        END_OBJECT
    assert_equal({"JSON" => 3.1459,
                   "one" => 1,
                   "two:three" => {"hi"=> "mom"}
                 },
                 @parser.parse(DATA.readlines.join))
  end

  def test_parse_errors
    assert_raise(RuntimeError) { @parser.parse("{") }
    assert_raise(RuntimeError) { @parser.parse(%q{{"key": true false}}) }

    assert_raise(RuntimeError) { @parser.parse("[") }
    assert_raise(RuntimeError) { @parser.parse("[1,,2]") }

    assert_raise(RuntimeError) { @parser.parse(%Q{"\\i"}) }

    assert_raise(RuntimeError) { @parser.parse("$1,000") }

    assert_raise(RuntimeError) { @parser.parse("1_000") }
    assert_raise(RuntimeError) { @parser.parse("1K") }

    assert_raise(RuntimeError) { @parser.parse("unknown") }
    assert_raise(RuntimeError) { @parser.parse('"') }
  end
end

__END__
{
  "JSON": 3.1459,
  "one" : 1,
  "two:three":
  {"hi": "mom"}
}
