# frozen_string_literal: true

require_relative "lib/broadcast_policy/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "broadcast_policy"
  s.version     = BroadcastPolicy::VERSION
  s.authors     = ["Ethan Vizitei"]
  s.email       = ["ethan@instructure.com"]
  s.homepage    = "http://www.instructure.com"
  s.summary     = "Notification management for ActiveRecord models in Canvas"

  s.files = Dir["{lib}/**/*"]

  s.add_dependency "activesupport"
  s.add_dependency "after_transaction_commit"
end
