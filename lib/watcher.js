const { exec } = require('child_process');

/**
 * @param {String} cmd 
 * @returns {Promise}
 * @description Runs a shell command
 * @example
 * // returns a promise that resolves to 'hello'
 * run('echo hello')
 */
const run = cmd => new Promise((resolve, reject) => {
	exec(cmd, (err, stdout, stderr) => {
		if (err) return reject(stderr, err);

		resolve(stdout);
	});
});

/**
 * @returns {Promise}
 * @description Runs a shell command that returns logs of applications with sound
 */
const fetchAudioData = async () => run('pacmd list-sink-inputs | tail -n +2');

/**
 * 
 * @param {Array.String} line 
 * @description Takes a splitted line and returns a trimmed & sanitized version of the key-value pair
 * @returns {Object}
 */
const normalizeDriverProps = ([key, value]) => {
	let cleanKey;
	let cleanValue;

	cleanKey = key.trim()
	cleanValue = value.trim().replace(/\"/g, '');
	return { key: cleanKey, value: cleanValue }
};

/**
 * @typedef {Object} RawApplicationSoundData
 * @property {Object} RawApplicationSoundData.volume
 * @property {String} RawApplicationSoundData.volume.frontLeft
 * @property {String} RawApplicationSoundData.volume.frontRight
 * @property {String} RawApplicationSoundData.name
 * @property {String} RawApplicationSoundData.state
 */

/**
 * 
 * @param {String} data A looong log dump from pulseaudio
 * @description Parses application logs from params in order to find out which app uses how much volume, how many dB and their state
 * @returns {RawApplicationSoundData}
 * */
const parsePulseAudioData = data => {
	return data
		.split('index: ')
		.map(chunk => chunk.split('\n\t'))
		.slice(1)
		.reduce((acc, currentAppData) => {
			const source = {};
			source.index = currentAppData[0];

			currentAppData.slice(1).forEach(line => {
				if (line.includes(':')) {
					if (line.includes('volume')) { //weird line
						const [_, value] = line.split('volume: ');

						source.volume = value;
						return
					}

					const { key, value } = normalizeDriverProps(line.split(':'));
					source[key] = value;

				} else if (line.includes('=')) {
					const { key, value } = normalizeDriverProps(line.split('='));
					source[key] = value;
				}
			});

			acc.push(source);
			return acc;
		}, [])
		.map(data => {
			const volumeData = data.volume.split(', ');

			return {
				volume: {
					frontLeft: volumeData[0].trim(),
					frontRight: volumeData[1].trim()
				},
				name: data['application.name'],
				state: data.state
			};
		});
}


/**
 * @typedef {Object} ApplicationSoundData
 * @property {Object} ApplicationSoundData.left
 * @property {String} ApplicationSoundData.left.percentage
 * @property {String} ApplicationSoundData.left.decibel
 * @property {Object} ApplicationSoundData.right
 * @property {String} ApplicationSoundData.right.percentage
 * @property {String} ApplicationSoundData.right.decibel
 * @property {String} ApplicationSoundData.name
 * @property {String} ApplicationSoundData.state
 */

/**
 * @param {String} log 
 * @description Sanitizes the individual App logs and returns the prettier version
 * @returns {ApplicationSoundData}
 */
const evaluatePulseAudioLog = log => {
	const { volume, name, state } = log;

	const [ _, leftVolumePercentage, leftDecibel ] = volume.frontLeft.split('/').map(a => a.trim());
	const [ __, rightVolumePercentage, rightDecibel ] = volume.frontRight.split('/').map(a => a.trim());

	return {
		left: {
			percentage: leftVolumePercentage,
			decibel: leftDecibel
		},
		right: {
			percentage: rightVolumePercentage,
			decibel: rightDecibel
		},
		name: name.toLowerCase(),
		state
	}
};

module.exports = { fetchAudioData, parsePulseAudioData, evaluatePulseAudioLog };
