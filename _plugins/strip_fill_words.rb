module Jekyll
  module AssetFilter
    def strip_fill_words(original_string)
      original_string
    end
  end
end

Liquid::Template.register_filter(Jekyll::AssetFilter)