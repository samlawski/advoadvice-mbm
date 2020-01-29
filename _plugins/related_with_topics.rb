module Jekyll
  module AssetFilter
    def related_with_topics(original_post_hash)
      all_posts = @context.registers[:site].posts.docs
      original_post_topics = original_post_hash["topics"] || []

      if original_post_topics.count > 0
        result = all_posts.select{|post|
          ((post.data["topics"] || []) & original_post_topics).length > 0
        }.reject{|post| 
          post["title"] == original_post_hash["title"]
        }.last(3).reverse
      else 
        result = all_posts.reject{|post| 
          post["title"] == original_post_hash["title"]
        }.last(3).reverse
      end

      result
    end
  end
end

Liquid::Template.register_filter(Jekyll::AssetFilter)