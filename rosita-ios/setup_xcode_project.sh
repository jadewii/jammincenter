#!/bin/bash

# Rosita iOS Xcode Project Setup Script
# This script creates a complete Xcode project structure

echo "🎹 Setting up Rosita iOS Project..."

# Create project directory structure
PROJECT_NAME="Rosita"
BUNDLE_ID="com.jadewii.rosita"
PROJECT_DIR="RositaXcode"

# Remove old project if exists
rm -rf "$PROJECT_DIR"

# Create directories
mkdir -p "$PROJECT_DIR/$PROJECT_NAME"
mkdir -p "$PROJECT_DIR/$PROJECT_NAME.xcodeproj"

# Copy source files
echo "📁 Copying source files..."
cp -r RositaSynthiOS/* "$PROJECT_DIR/$PROJECT_NAME/" 2>/dev/null || true

# Create project.pbxproj file
cat > "$PROJECT_DIR/$PROJECT_NAME.xcodeproj/project.pbxproj" << 'EOF'
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {

/* Begin PBXBuildFile section */
		1A0000001 /* RositaApp.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1A0000011 /* RositaApp.swift */; };
		1A0000002 /* ContentView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1A0000012 /* ContentView.swift */; };
		1A0000003 /* AudioEngine.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1A0000013 /* AudioEngine.swift */; };
		1A0000004 /* InstrumentSelectorView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1A0000014 /* InstrumentSelectorView.swift */; };
		1A0000005 /* ADSRControlsView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1A0000015 /* ADSRControlsView.swift */; };
		1A0000006 /* SequencerGridView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1A0000016 /* SequencerGridView.swift */; };
		1A0000007 /* SequencerControlsView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1A0000017 /* SequencerControlsView.swift */; };
		1A0000008 /* EffectsControlsView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1A0000018 /* EffectsControlsView.swift */; };
		1A0000009 /* PianoKeyboardView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1A0000019 /* PianoKeyboardView.swift */; };
		1A000000A /* AudioKit in Frameworks */ = {isa = PBXBuildFile; productRef = 1A000001A /* AudioKit */; };
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		1A0000010 /* Rosita.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = Rosita.app; sourceTree = BUILT_PRODUCTS_DIR; };
		1A0000011 /* RositaApp.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = RositaApp.swift; sourceTree = "<group>"; };
		1A0000012 /* ContentView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = ContentView.swift; sourceTree = "<group>"; };
		1A0000013 /* AudioEngine.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Audio/AudioEngine.swift; sourceTree = "<group>"; };
		1A0000014 /* InstrumentSelectorView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/InstrumentSelectorView.swift; sourceTree = "<group>"; };
		1A0000015 /* ADSRControlsView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/ADSRControlsView.swift; sourceTree = "<group>"; };
		1A0000016 /* SequencerGridView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/SequencerGridView.swift; sourceTree = "<group>"; };
		1A0000017 /* SequencerControlsView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/SequencerControlsView.swift; sourceTree = "<group>"; };
		1A0000018 /* EffectsControlsView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/EffectsControlsView.swift; sourceTree = "<group>"; };
		1A0000019 /* PianoKeyboardView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/PianoKeyboardView.swift; sourceTree = "<group>"; };
		1A000001B /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		1A000000B /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
				1A000000A /* AudioKit in Frameworks */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		1A000000C = {
			isa = PBXGroup;
			children = (
				1A000000D /* Rosita */,
				1A000000E /* Products */,
			);
			sourceTree = "<group>";
		};
		1A000000D /* Rosita */ = {
			isa = PBXGroup;
			children = (
				1A0000011 /* RositaApp.swift */,
				1A0000012 /* ContentView.swift */,
				1A000001C /* Audio */,
				1A000001D /* Views */,
				1A000001B /* Info.plist */,
			);
			path = Rosita;
			sourceTree = "<group>";
		};
		1A000000E /* Products */ = {
			isa = PBXGroup;
			children = (
				1A0000010 /* Rosita.app */,
			);
			name = Products;
			sourceTree = "<group>";
		};
		1A000001C /* Audio */ = {
			isa = PBXGroup;
			children = (
				1A0000013 /* AudioEngine.swift */,
			);
			path = Audio;
			sourceTree = "<group>";
		};
		1A000001D /* Views */ = {
			isa = PBXGroup;
			children = (
				1A0000014 /* InstrumentSelectorView.swift */,
				1A0000015 /* ADSRControlsView.swift */,
				1A0000016 /* SequencerGridView.swift */,
				1A0000017 /* SequencerControlsView.swift */,
				1A0000018 /* EffectsControlsView.swift */,
				1A0000019 /* PianoKeyboardView.swift */,
			);
			path = Views;
			sourceTree = "<group>";
		};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		1A000000F /* Rosita */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = 1A000001E /* Build configuration list for PBXNativeTarget "Rosita" */;
			buildPhases = (
				1A0000020 /* Sources */,
				1A000000B /* Frameworks */,
				1A0000021 /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = Rosita;
			packageProductDependencies = (
				1A000001A /* AudioKit */,
			);
			productName = Rosita;
			productReference = 1A0000010 /* Rosita.app */;
			productType = "com.apple.product-type.application";
		};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		1A0000022 /* Project object */ = {
			isa = PBXProject;
			attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 1500;
				LastUpgradeCheck = 1500;
				TargetAttributes = {
					1A000000F = {
						CreatedOnToolsVersion = 15.0;
					};
				};
			};
			buildConfigurationList = 1A0000023 /* Build configuration list for PBXProject "Rosita" */;
			compatibilityVersion = "Xcode 14.0";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
				Base,
			);
			mainGroup = 1A000000C;
			packageReferences = (
				1A0000024 /* XCRemoteSwiftPackageReference "AudioKit" */,
			);
			productRefGroup = 1A000000E /* Products */;
			projectDirPath = "";
			projectRoot = "";
			targets = (
				1A000000F /* Rosita */,
			);
		};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		1A0000021 /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
		1A0000020 /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				1A0000001 /* RositaApp.swift in Sources */,
				1A0000002 /* ContentView.swift in Sources */,
				1A0000003 /* AudioEngine.swift in Sources */,
				1A0000004 /* InstrumentSelectorView.swift in Sources */,
				1A0000005 /* ADSRControlsView.swift in Sources */,
				1A0000006 /* SequencerGridView.swift in Sources */,
				1A0000007 /* SequencerControlsView.swift in Sources */,
				1A0000008 /* EffectsControlsView.swift in Sources */,
				1A0000009 /* PianoKeyboardView.swift in Sources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
		1A0000025 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_ENABLE_OBJC_WEAK = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_COMMA = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = dwarf;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_TESTABILITY = YES;
				ENABLE_USER_SCRIPT_SANDBOXING = YES;
				GCC_C_LANGUAGE_STANDARD = gnu17;
				GCC_DYNAMIC_NO_PIC = NO;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_OPTIMIZATION_LEVEL = 0;
				GCC_PREPROCESSOR_DEFINITIONS = (
					"DEBUG=1",
					"$(inherited)",
				);
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 15.0;
				LOCALIZATION_PREFERS_STRING_CATALOGS = YES;
				MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;
				MTL_FAST_MATH = YES;
				ONLY_ACTIVE_ARCH = YES;
				SDKROOT = iphoneos;
				SWIFT_ACTIVE_COMPILATION_CONDITIONS = "DEBUG $(inherited)";
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
			};
			name = Debug;
		};
		1A0000026 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_ENABLE_OBJC_WEAK = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_COMMA = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
				ENABLE_NS_ASSERTIONS = NO;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_USER_SCRIPT_SANDBOXING = YES;
				GCC_C_LANGUAGE_STANDARD = gnu17;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 15.0;
				LOCALIZATION_PREFERS_STRING_CATALOGS = YES;
				MTL_ENABLE_DEBUG_INFO = NO;
				MTL_FAST_MATH = YES;
				SDKROOT = iphoneos;
				SWIFT_COMPILATION_MODE = wholemodule;
				VALIDATE_PRODUCT = YES;
			};
			name = Release;
		};
		1A0000027 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				DEVELOPMENT_TEAM = "";
				ENABLE_PREVIEWS = YES;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_FILE = Rosita/Info.plist;
				INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;
				INFOPLIST_KEY_UILaunchStoryboardName = "";
				INFOPLIST_KEY_UIRequiredDeviceCapabilities = armv7;
				INFOPLIST_KEY_UIRequiresFullScreen = YES;
				INFOPLIST_KEY_UIStatusBarHidden = YES;
				INFOPLIST_KEY_UISupportedInterfaceOrientations = "UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone = "UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.jadewii.rosita;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
		1A0000028 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				DEVELOPMENT_TEAM = "";
				ENABLE_PREVIEWS = YES;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_FILE = Rosita/Info.plist;
				INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;
				INFOPLIST_KEY_UILaunchStoryboardName = "";
				INFOPLIST_KEY_UIRequiredDeviceCapabilities = armv7;
				INFOPLIST_KEY_UIRequiresFullScreen = YES;
				INFOPLIST_KEY_UIStatusBarHidden = YES;
				INFOPLIST_KEY_UISupportedInterfaceOrientations = "UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone = "UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.jadewii.rosita;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Release;
		};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		1A0000023 /* Build configuration list for PBXProject "Rosita" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				1A0000025 /* Debug */,
				1A0000026 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		1A000001E /* Build configuration list for PBXNativeTarget "Rosita" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				1A0000027 /* Debug */,
				1A0000028 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
/* End XCConfigurationList section */

/* Begin XCRemoteSwiftPackageReference section */
		1A0000024 /* XCRemoteSwiftPackageReference "AudioKit" */ = {
			isa = XCRemoteSwiftPackageReference;
			repositoryURL = "https://github.com/AudioKit/AudioKit";
			requirement = {
				kind = upToNextMajorVersion;
				minimumVersion = 5.6.0;
			};
		};
/* End XCRemoteSwiftPackageReference section */

/* Begin XCSwiftPackageProductDependency section */
		1A000001A /* AudioKit */ = {
			isa = XCSwiftPackageProductDependency;
			package = 1A0000024 /* XCRemoteSwiftPackageReference "AudioKit" */;
			productName = AudioKit;
		};
/* End XCSwiftPackageProductDependency section */
	};
	rootObject = 1A0000022 /* Project object */;
}
EOF

# Create workspace settings
mkdir -p "$PROJECT_DIR/$PROJECT_NAME.xcodeproj/project.xcworkspace/xcshareddata"
cat > "$PROJECT_DIR/$PROJECT_NAME.xcodeproj/project.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>IDEDidComputeMac32BitWarning</key>
	<true/>
</dict>
</plist>
EOF

cat > "$PROJECT_DIR/$PROJECT_NAME.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved" << 'EOF'
{
  "pins" : [
    {
      "identity" : "audiokit",
      "kind" : "remoteSourceControl",
      "location" : "https://github.com/AudioKit/AudioKit",
      "state" : {
        "revision" : "7e0c690b190e3aa642d7d7d91c4a2e83248290a5",
        "version" : "5.6.0"
      }
    }
  ],
  "version" : 2
}
EOF

echo "✅ Xcode project structure created!"
echo ""
echo "📱 Now opening Xcode..."
echo ""

# Open the project in Xcode
open "$PROJECT_DIR/$PROJECT_NAME.xcodeproj"

echo "🎉 DONE! Xcode should now be opening with your Rosita project!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. When Xcode opens, it will prompt to download AudioKit package - click 'Resolve'"
echo "2. Select your development team in Signing & Capabilities"
echo "3. Select an iPhone/iPad simulator from the top bar"
echo "4. Press ⌘R to run!"
echo ""
echo "The app will launch in landscape mode with the full synthesizer interface!"