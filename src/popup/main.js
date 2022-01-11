import Vue from 'vue';
import Chakra, { CThemeProvider, CReset } from '@chakra-ui/vue';
import theme from './theme.js';
import App from './App.vue';
import {
	faMicrophone,
	faMicrophoneSlash,
	faVolumeUp,
	faVolumeMute,
	faVideo,
	faVideoSlash,
	faUsers,
	faShareSquare,
	faGhost,
} from '@fortawesome/free-solid-svg-icons';
/* eslint-disable no-new */

Vue.use(Chakra, {
	icons: {
		iconPack: 'fa',
		iconSet: {
			faMicrophone,
			faMicrophoneSlash,
			faVolumeUp,
			faVolumeMute,
			faVideo,
			faVideoSlash,
			faUsers,
			faShareSquare,
			faGhost,
		},
	},
	extendTheme: theme,
});

new Vue({
	el: '#app',
	render: (h) => h(CThemeProvider, [h(CReset), h(App)]),
}).$mount();
