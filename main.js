#!/usr/bin/env node

const { toggleSpotify } = require('./lib/dbus');
const { fetchAudioData, parsePulseAudioData, evaluatePulseAudioLog } = require('./lib/watcher');
const { hasSound } = require('./lib/soundCheck');

const states = {
  running: "RUNNING",
  corked: "CORKED"
}

const toggleStack = [];
let isToggleInProgress = false;

console.log('Listening for audio changes');

setInterval(() => {
  fetchAudioData()
    .then(val => {
      const runningApps = [];
      const logBatch = parsePulseAudioData(val);

      logBatch.forEach(log => {
        const {name, left, right, state, mono} = evaluatePulseAudioLog(log);
        const sound = hasSound({ left, right, state });
        const currentAppData = {
          name,
          left,
          right,
          state,
          hasSound: sound,
          mono
        };
        const findCurrentApp = app => app.name === name && app.state === state;

        if (!runningApps.some(findCurrentApp)) {
          runningApps.push(currentAppData);
        } else {
          const currentAppIndex = runningApps.findIndex(findCurrentApp);
          runningApps.splice(currentAppIndex, 1, currentAppData);
        }
      });

      //doesn't work on chrome just yet!
      if (runningApps.some(app => app.hasSound && app.name === 'firefox')) {
        const spotifyInstance = runningApps.find(app => app.name == 'spotify' && app.state == states.running);

        if (spotifyInstance && spotifyInstance.hasSound) {
          toggleSpotify()
            .then(() => {
              toggleStack.push(spotifyInstance.name)
            })
            .catch(err => {
              console.error(err, 'Could not pause spotify');
            });
        }
      }

      const mutedFirefoxInstances = runningApps.filter(app => app.name == 'firefox' && !app.hasSound).length;
      const noFirefoxInstances = runningApps.findIndex(app => app.name == 'firefox') == -1

      if (!isToggleInProgress && toggleStack.length && (
        noFirefoxInstances || mutedFirefoxInstances == runningApps.filter(app => app.name == 'firefox').length
      )) {
        isToggleInProgress = true;
        setTimeout(async () => {
          const firefoxInstance = runningApps.find(app => app.name == 'firefox');
          if (firefoxInstance && firefoxInstance.hasSound) {
            console.log('Firefox played sound before timeout');
            return
          };

          toggleStack.pop();
          await toggleSpotify();
          isToggleInProgress = false;
        }, 1000);
      }
    })
    .catch(err => {
      console.error(err, 'Error occured within main app logic');
      process.exit(1);
    });
}, 1 * 1000);
