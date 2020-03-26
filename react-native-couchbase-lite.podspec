require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-couchbase-lite"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/mxth/react-native-couchbase-lite.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"

  s.dependency "React"
  s.dependency "CouchbaseLite-Swift-Enterprise", "2.7.0"
  s.dependency "Bow", "0.7.0"
end
