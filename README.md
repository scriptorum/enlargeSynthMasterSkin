# SMBigSkin
[SynthMaster](http://www.synthmaster.com/) is a soft-synth VST instrument. I felt that that SynthMaster's screen size is a bit too small. Rather than creating my own skin by hand, I wrote a script to resize an existing skin. This is a non-destructive resize - a new skin is created at the desired size which you can select from inside the VST.

##CAVEATS
  - Images may be a little blurry, that's normal. Don't panic.
  - If text labels (that is, not images with text) become too large, you can try supplying a negative value to fontAdjust.
  - There are still some alignment issues due to rounding. This may make some of the seams between layout elements visible.
  - Your SynthMaster skins folder must be have read/write access.
  - You may need to reboot your DAW to see skin changes.
  - Hasn't been tested on PC. Or really, you know, much at all. Caveat Emptor, No Guarantees, Use At Your Own Risk, Etc.
  - There are some skins this might not work on; if your DAW crashes, you win! 

##USAGE
  - Download the two js and json files into a folder. If you have git, you can do this with ```git clone https://github.com/scriptorum/SMBigSkin.git```.
  - Configure your settings in the SMBigSkin.js script. 
  
    ```javascript
    const sourceName = "sT-Tranquil Blue";
    const magnification = 1.5;
    const fontAdjust = -0.10;
    const skinsFolder = "/Library/Application Support/KV331 Audio/SynthMaster/Resources/Skins";
    ```
    
    - Set *skinsFolder* to the location of your SynthMaster skins. On Windows this is probably `C:\Program Files\KV331 Audio\SynthMaster\Resources\Skins` and OSX `/Library/Application Support/KV331 Audio/SynthMaster/Resources/Skins`.    
    - Set *sourceName* to the name of the folder containing the skin you want to resize.
    - Set *magnification* to your desired scaling amount. 1.0 is no change, 1.2 is 120% or 20% bigger. Less than 1.0 will shrink things, which now that I think of it is completely untested.
    - Set *fontAdjust* to 0.0 if you want text labels to scale evenly with the everything else. Otherwise supply a percentage adjustment. -0.10, for instance, will set text labels to 10% less magnification than you specified as your desired scaling amount.    
  - This script requires [NodeJS](https://nodejs.org/en/), so install it if needed. Also install NPM if NodeJS for some wacky reason didn't include it.
  - Install dependency [Graphics Magick](http://www.graphicsmagick.org/). You can install it manually, use homebrew ```brew install graphicsmagick```, or MacPorts ``` port install GraphicsMagick```. Make sure the application is added to your PATH so you can run it from the command line.
  - Install NPM dependencies ```npm install``` This creates a node_modules subfolder
  - Run the script! ```./enlargeSynthMasterSkin.js```. The new folder should magically appear in your SynthMaster skins skinsFolder.

##TIPS
 - There are some skins in there in folders with unhelpful names (New Skin ###). Rename them to match the skin name. The skin name is in the first line of interface.xml in the folder. ```<InterfaceDefinition name="Default Skin-Blue"/>```
