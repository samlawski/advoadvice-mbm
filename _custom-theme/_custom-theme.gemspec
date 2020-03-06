# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "custom-theme"
  spec.version       = "0.1.0"
  spec.authors       = ["Samuel Boguslawski"]
  spec.email         = ["mail@samuelboguslawski.com"]

  spec.summary       = %q{Custom Website Theme}
  spec.homepage      = "https://samuelboguslawski.com"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(assets|_layouts|_includes|_sass|LICENSE|README)!i) }

  spec.add_runtime_dependency "jekyll", "~> 4.0"

  spec.add_development_dependency "bundler", "~> 1.16"
  spec.add_development_dependency "rake", "~> 12.0"
end
