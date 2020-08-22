# Spotify Toggler

## What's the use case?

Imagine a situation where you're just chilling and listening to some fine beats on Spotify, then all of a sudden a video on your browser peaks your attention

Now you need to pause the song on Spotify first, and open the video, yeah?

Well no more!

With this app running in the background, you can listen to your cool 90s fine beats playlist and if you happen to see some amazing video on the internet, just hit play. **This app will pause the song for ya!**

Well not only that, when you're done watching the thing, few seconds after the sound stops, your song will continue right away!

## Prerequisites and General Information

* You need `PulseAudio` installed on your system
	* This is preinstalled on most Linux distros, on Mac it seems to be available on brew via `brew install pulseaudio` (NOT TESTED)
* You need to have NodeJS installed on your computer.
* Currently this is tested on both Firefox and Google Chrome
* As `pulseaudio` does not reflect sound changes for Chrome, it only works on Firefox for now

## Installation

`npm i -g spotify-toggler`

## Usage

Simply run `spotify-toggler` after you globally install the package.

