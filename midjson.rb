module MidJSON

  class Writer
    # Main method to write Ruby data structures/objects
    # to JSON format
    # TODO: probably need a formatting method to break into newlines for complicated/long
    #       JSON docs
    # @param [Object] any object/data structure
    # @return [String] returns JSON string
    def to_json(v)
      if v.is_a? Array
        a2j(v)
      elsif v.is_a? Hash
        h2j(v)
      elsif v.is_a? Numeric
        v
      else
        gen2j(v)
      end
    end

    def s2j(v)
      %Q{"#{v.to_s.gsub("=>", ":")}"}
    end

    def gen2j(v)
      if (v.instance_variables.empty?)
        s2j(v)
      else
        j = ''
        v.instance_variables.each do |iv|
          if v.instance_variable_defined? iv
            j << iv.to_s.sub('@', '') << ':' << v.instance_variable_get(iv) << ','
          end
        end
        if j.empty? then s2j(v)
        else "{#{j.chomp(',')}}"
        end
      end
    end

    def a2j(a)
      j = '['
      a.each do |v|
        j << to_json(v).to_s + ','
      end
      j.chomp!(',') << ']'
    end
    
    def h2j(h)
      j = '{'
      h.each_pair do |k,v|
        j << to_json(k).to_s + ":" + to_json(v).to_s + ","
      end
      j.chomp!(',') << '}'
    end    
  end

  # recursive descent parser
  class Parser
    require "strscan"
    AST = Struct.new(:value)

    def parse(s)
      @scnr = StringScanner.new(s)      
      handle_starts_with_string(s)      
      parse_value(AST.new).value
    ensure
      unless @scnr.eos?
        raise "Cannot match rest of JSON string: #{@scnr.rest}"
      end
    end

    def handle_starts_with_string(s)
      parse_whitespace
      if parse_string(AST.new)
        if @scnr.check(/\s*:/)
          # wrap it in a hash/object notation if starts with string
          # and reset the StringScanner
          @scnr.string = "{#{s}}"
        else
          @scnr.reset
        end
      end
    end

    def parse_value(ast)
      parse_whitespace
      r = (parse_null(ast) or
        parse_bool(ast)    or
        parse_num(ast)     or
        parse_string(ast)  or
        parse_array(ast)   or
        parse_hash(ast))

      if r
        ast
      else 
        raise "Cannot match rest of JSON string: #{@scnr.rest}"
      end      
    end

    def parse_whitespace
      @scnr.scan(/\s+/)
      true
    end

    def parse_null(ast)
      if s = @scnr.scan(/null/)
        ast.value = nil
        true
      else
        false
      end
    end

    def parse_bool(ast)
      if s = @scnr.scan(/true|false/)
        ast.value = eval s
        true
      else
        false
      end
    end
        
    def parse_num(ast)
      if s = @scnr.scan(/[+-]?\d+\.?\d*[Ee]?[+-]?\d*/)
        ast.value = eval s
        true
      else
        false
      end
    end

    def parse_string(ast)
      parse_whitespace
      if @scnr.scan(/""/)
        ast.value = ""
        return true
      end
      if (s = @scnr.scan(/".*?[^\\]"/)) && s !~ /\\[^"ntrfu]/
        # ast.value = s.sub(/^"/, '')
        # ast.value = ast.value.sub(/"$/, '')
        # ast.value = String.new(ast.value.gsub(/\([^trfu])/, '\\1'))
        ast.value = eval s
        true
      else
        false
      end
    end

    def parse_array(ast)
      return false unless @scnr.scan(/\[/)
      ast.value = []
      tmpast = AST.new
      until @scnr.scan(/\s*\]\s*/) do  # TODO: change to while true later?
        tmpast.value = nil
        parse_value(tmpast)
        raise "Badly formatted array" unless tmpast.value
        ast.value << tmpast.value
        unless @scnr.check(/\s*\]/) or @scnr.scan(/\s*,\s*/)
          raise "Bad array in JSON format (missing comma)" 
        end
      end
      ast.value
    end

    def parse_hash(ast)
      return false unless @scnr.scan(/\{/)
      ast.value = {}
      tmpast = AST.new
      until @scnr.scan(/\s*}\s*/) do
        tmpast.value = nil
        # parse the key
        parse_string(tmpast)
        unless (k = tmpast.value) && @scnr.scan(/\s*:\s*/)
          raise "Badly formatted hash/object - key and ':' separator not found" 
        end

        # parse the value
        tmpast.value = nil
        parse_value(tmpast)
        unless (v = tmpast.value) && (@scnr.check(/\s*\}/) or @scnr.scan(/\s*,\s*/))
          raise "Badly formatted hash/object: value not present or correct" 
        end
        ast.value[k] = v
      end
      ast
    end

    def safely_change_keyval_separator(s)
      in_str_b = false
      tmps = ""
      newstr = ""
      scan2 = StringScanner.new(s)
      until scan2.eos? do
        tmps = scan2.scan(/[^"]*"?/)
        tmps = tmps.gsub(/:/, "=>") unless in_str_b
        newstr << tmps
        in_str_b = !in_str_b
      end
      newstr
    end
  end
end


if __FILE__ == $0
  # puts MidJSON::Parser.debug
  # MidJSON::Parser.debug = true
  # puts MidJSON::Parser.debug
  # jw = MidJSON::Writer.new
  # puts jw.to_json("hi")
  # puts jw.to_json 1
  # puts jw.to_json [1,2,3]
  # puts jw.to_json [1,2, [:a,:b,"c"], 3]
  # puts jw.to_json [1,2, {:a => :b}, 3]
  # puts jw.to_json(true)
  # puts jw.to_json({:a => :b})
  # puts jw.to_json({Time.now => true})


  jp = MidJSON::Parser.new
  jp.parse(%Q{["JSON", 3.1415, true]})
  # v = jp.parse('"Nested \"String\" Thing"')
  # v = jp.parse('"nested \"quotes\""')
  # puts "#{v}  :: class = #{v.class}"
  # v = jp.parse("false").value
  # puts "#{v}  :: class = #{v.class}"
  # v = jp.parse("null").value
  # puts "#{v}  :: class = #{v.class}"
  # v = jp.parse("1").value
  # puts "#{v}  :: class = #{v.class}"
end
