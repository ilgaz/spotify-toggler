/**
 * @param {import("./watcher").ApplicationSoundData} appVolumeStats
 * @description From the given application stats, figures out whether it's playing AND making sound.
 * Doesn't return true when the app is playing without sound
 * @returns {Boolean}
 */
const hasSound = appVolumeStats => {
  const { left, right, state } = appVolumeStats;
  let volume;

  if ([left.decibel, right.decibel].some(data => data.includes('-inf')) || state == 'CORKED') {
    return false;
  }

  if (left.percentage !== right.percentage) {
    volume = getBiggerDecibel([left.decibel, right.decibel]);
  } else {
    volume = parseFloat(left.decibel);
  }

  // Pulseaudio goes from 0 to -inf as you decrease volume
  const fullVolumeCondition = Math.abs(volume) == 0 && (parseInt(left.percentage) > 0 && parseInt(right.percentage) > 0);
  return Math.abs(volume) !== 0 || fullVolumeCondition;
};

/**
 * @param {Array} dBPair
 * @description Takes in an array that contains two strings, returns which one has higher dB
 * In case of muted applications, the parameter has '-inf' in it, when that happens it returns the other element
 * @returns {Number}
 */
const getBiggerDecibel = (dBPair) => {
  if (dBPair.some(el => el.includes('-inf'))) {
    return dBPair.find(el => !el.includes('-inf'));
  }

  const [bigger, smaller] = dBPair.map(el => parseFloat(el)).sort((a, b) => a + b);
  return bigger;
};

module.exports = { hasSound };
