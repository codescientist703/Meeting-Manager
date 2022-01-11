<template>
	<c-box p="3" bg="bg" height="500px" width="350px" overflow-y="auto">
		<c-heading size="md" mb="3">
			<c-icon name="users" size="22px" mr="3" color="primary" />
			{{ defaultText }}
		</c-heading>
		<c-divider mx="-3" border-color="secondary" />
		<NotFound :isEmpty="isEmpty" />
		<MeetingCard
			v-for="(value, key) in meetingTabs"
			:key="key"
			:meetingDetails="value"
			@toggle-mute="toggleMute"
			@switch-tab="switchTab"
			@change-name="changeName"
			@toggle-shortcut="toggleShortcut"
			:id="key"
		/>
	</c-box>
</template>

<script>
import MeetingCard from './components/MeetingCard.vue';
import NotFound from './components/NotFound.vue';
import {
	CButton,
	CBox,
	CHeading,
	CIcon,
	CDivider,
	CFlex,
	CText,
} from '@chakra-ui/vue';
export default {
	name: 'App',
	data() {
		return {
			meetingTabs: {},
		};
	},
	components: {
		MeetingCard,
		NotFound,
		CButton,
		CBox,
		CHeading,
		CIcon,
		CDivider,
		CFlex,
		CText,
	},
	methods: {
		toggleMute(id, action) {
			if (
				action !== 'sound' &&
				this.meetingTabs[id][action].isDisabled === true
			) {
				return;
			}

			id = parseInt(id);
			this.meetingTabs[id][action].isMuted =
				!this.meetingTabs[id][action].isMuted;

			if (action === 'sound') {
				this.muteTab(id);
			}

			browser.tabs.sendMessage(id, {
				type: 'update',
				payload: this.meetingTabs[id],
				action: action,
			});
		},
		muteTab(id) {
			browser.tabs.update(parseInt(id), {
				muted: this.meetingTabs[id].sound.isMuted,
			});
		},
		switchTab(id) {
			browser.tabs.update(parseInt(id), { selected: true });
		},
		changeName(id, newName) {
			this.meetingTabs[id].name = newName;
			browser.tabs.sendMessage(parseInt(id), {
				type: 'update',
				payload: this.meetingTabs[id],
				action: 'name',
			});
		},
		async toggleShortcut(id) {
			Object.keys(this.meetingTabs).forEach((key) => {
				if (key !== id) {
					this.meetingTabs[key].isShortcutEnabled = false;
				}
			});
			browser.tabs.sendMessage(parseInt(id), {
				type: 'update',
				payload: this.meetingTabs[id],
				action: 'shortcut',
			});

			await browser.storage.local.set({ meetingTabs: this.meetingTabs });
		},
		async fetchExistingTabs() {
			const result = await browser.storage.local.get('meetingTabs');
			this.meetingTabs = result.meetingTabs || {};
		},
	},
	computed: {
		defaultText() {
			return browser.i18n.getMessage('extensionName');
		},
		isEmpty() {
			return Object.keys(this.meetingTabs).length === 0;
		},
	},
	mounted() {
		const me = this;
		this.fetchExistingTabs();
		browser.runtime.onMessage.addListener(function (request) {
			if (request.type === 'update') {
				me.meetingTabs = request.payload;
			}
		});
	},
};
</script>
