require 'reverse_markdown' # Turn HTML into Markdown
require 'rinku' # Autolink
require 'yaml' # Load YAML
require 'time' # Interpret time

content = YAML.load_file('file.yml')

content.each do |post|
  post.each do |key, value|
    title = value["title"]
    body = value["body"]
    permalink = value["permalink"]
    date = Time.parse(value["published_at"])
    categories = value["tags"]
    author = value["author"]
    layout = "post"

    # Body formatting
    body = Rinku.auto_link(body, mode=:all, link_attr=nil, skip_tags=nil)
    body = ReverseMarkdown.convert body

    file = File.new("#{date.strftime("%Y-%m-%d")}-#{permalink}.md", "w") #a
    file.puts("---")
    file.puts("title: \"#{title}\"")
    # file.puts("permalink: /blog/#{permalink}")
    file.puts("date: #{date}")
    file.puts("layout: #{layout}")
    file.puts("categories: #{categories}")
    file.puts("team_member: #{author}")
    file.puts("---")
    file.puts("")
    file.puts(body)
    file.close

  end
  # break # Run this only once
end

p "done"
