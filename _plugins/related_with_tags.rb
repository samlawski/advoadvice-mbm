module Jekyll
  module AssetFilter
    def related_with_tags(original_post_hash)
      all_posts = @context.registers[:site].posts.docs
      original_post_tags = original_post_hash["tags"]

      # Given a single post with "tags" in its frontmatter,
      # Add to each existing post in the system a number of tags matching the tags of the given post ("suggested_matches_count")
      # Then, sort all posts by that number
      # Then, select only the top 4
      # Then, reverse for relevance (most matches will be first now)
      # Then, drop the first as that's the actual post.

      result = all_posts.map{|post|
        post.data["suggested_matches_count"] = (post.data["tags"] & original_post_tags).length
        post
      }.sort{|post1, post2| 
        post1.data["suggested_matches_count"] <=> post2.data["suggested_matches_count"] 
      }.last(4).reverse.drop(1)

      result
    end
  end
end

Liquid::Template.register_filter(Jekyll::AssetFilter)