const dbus = require('dbus-next');
const bus = dbus.sessionBus();

const dbusOptions = {
	service: 'org.mpris.MediaPlayer2.spotify',
	interface: 'org.mpris.MediaPlayer2.Player',
	path: '/org/mpris/MediaPlayer2'
};

let spotifyInterface;

bus.getProxyObject(dbusOptions.service, dbusOptions.path)
	.then(async obj => {
		spotifyInterface = obj.getInterface(dbusOptions.interface);
	})
	.catch(err => {
		throw new Error('Error occured while connecting to Spotify DBus object', err);
	});

/**
 * @description Toggles Spotify's current track via DBus
 * @returns {Promise}
 */
const toggleSpotify = () => {
	const d = new Date();
	console.log('Toggling spotify', d.toTimeString());
	return spotifyInterface.PlayPause();
}

module.exports = { toggleSpotify };
