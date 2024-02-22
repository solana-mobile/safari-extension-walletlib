#
# Be sure to run `pod lib lint safari-extension-walletlib-swift.podspec' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  s.name             = 'safari-extension-walletlib-swift'
  s.version          = '0.1.0'
  s.summary          = 'A short description of safari-extension-walletlib-swift.'

# This description is used to generate tags and improve search results.
#   * Think: What does it do? Why did you write it? What is the focus?
#   * Try to keep it short, snappy and to the point.
#   * Write the description between the DESC delimiters below.
#   * Finally, don't worry about the indent, CocoaPods strips it!

  s.description      = <<-DESC
TODO: Add long description of the pod here.
                       DESC

  s.homepage         = 'https://github.com/michaelsulistio/safari-extension-walletlib-swift'
  # s.screenshots     = 'www.example.com/screenshots_1', 'www.example.com/screenshots_2'
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { 'michaelsulistio' => 'michaelsulistio@gmail.com' }
  s.source           = { :git => 'https://github.com/michaelsulistio/safari-extension-walletlib-swift.git', :tag => s.version.to_s }
  # s.social_media_url = 'https://twitter.com/<TWITTER_USERNAME>'

  s.ios.deployment_target = '15.0'

  s.source_files = 'safari-extension-walletlib-swift/Classes/**/*'
  s.module_name = 'SafariExtensionWalletlibSwift'
  
  # s.resource_bundles = {
  #   'safari-extension-walletlib-swift' => ['safari-extension-walletlib-swift/Assets/*.png']
  # }

  # s.public_header_files = 'Pod/Classes/**/*.h'
  # s.frameworks = 'UIKit', 'MapKit'
  # s.dependency 'AFNetworking', '~> 2.3'
end
