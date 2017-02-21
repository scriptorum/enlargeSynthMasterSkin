# enlargeSynthMasterSkin
SynthMaster is a "soft-synth" VST instrument. This is a versatile synth, but the supplied skins are a bit small, and it's not easy to reskin. This is a script to enlarge an existing skin by any amount.

##CAVEATS
  - Images may be a little blurry, that's normal. Don't panic.
  - If text labels (that is, not images with text) become too large, you can try supplying a negative value to fontAdjust.
  - There are still some alignment issues due to rounding. This may make some of the seams between layout elements visible.
  - Your SynthMaster skins folder must be have read/write access.
  - You may need to reboot your DAW to see skin changes.
  - Hasn't been tested on PC. Or really, you know, much at all. Caveat Emptor, No Guarantees, Use At Your Own Risk, Etc.
  - There are some skins this might not work on; if your DAW crashes, you win! 

##USAGE
  - Download the two js and json files into a folder.
  - Configure your settings in the enlargeSynthMasterSkin.js script.
  - This script requires NodeJS, so install it if needed. Also install NPM if NodeJS for some wacky reason didn't include it.
  - Install the dependencies shown below.
  - Run the script! The new folder should magically appear in your SynthMaster skins skinsFolder.

##DEPENDENCIES
```code  
  port install GraphicsMagick 		# or brew, or install manually; also add executable to path
  npm install						# loads node dependies into a node_modules subfolder
```