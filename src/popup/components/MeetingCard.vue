<template>
	<c-box
		border-width="1px"
		rounded="lg"
		overflow="hidden"
		p="3"
		my="2"
		bg="cardBg"
		border="1px"
		borderColor="primary"
	>
		<c-flex mb="10">
			<c-editable
				:defaultValue="meetingDetails.name"
				fontSize="lg"
				w="50%"
				mr="auto"
				@change="onNameChange"
			>
				<c-editable-preview />
				<c-editable-input />
			</c-editable>
			<c-flex align="center">
				<c-tooltip label="Go to this meeting" placement="left">
					<c-box @click="$emit('switch-tab', id)" cursor="pointer" mr="3">
						<c-icon name="share-square" size="20px" />
					</c-box>
				</c-tooltip>
				<c-tooltip label="Enable shortcut" placement="left">
					<c-checkbox
						v-model="meetingDetails.isShortcutEnabled"
						@change="$emit('toggle-shortcut', id)"
					/>
				</c-tooltip>
			</c-flex>
		</c-flex>
		<c-flex justify="flex-end" align="center">
			<c-grid template-columns="repeat(3, 1fr)" gap="3">
				<c-box @click="$emit('toggle-mute', id, 'mic')">
					<c-icon
						:name="
							meetingDetails.mic.isMuted ? `microphone-slash` : `microphone`
						"
						size="24px"
						cursor="pointer"
					/>
				</c-box>
				<c-box @click="$emit('toggle-mute', id, 'camera')">
					<c-icon
						:name="meetingDetails.camera.isMuted ? `video-slash` : `video`"
						size="24px"
						bg="tranparent"
						cursor="pointer"
					/>
				</c-box>
				<c-box @click="$emit('toggle-mute', id, 'sound')">
					<c-icon
						:name="meetingDetails.sound.isMuted ? `volume-mute` : `volume-up`"
						size="24px"
						bg="tranparent"
						cursor="pointer"
					/>
				</c-box>
			</c-grid>
		</c-flex>
	</c-box>
</template>

<script>
import {
	CBox,
	CEditable,
	CEditableInput,
	CEditablePreview,
	CIcon,
	CFlex,
	CGrid,
	CTooltip,
	CCheckbox,
} from '@chakra-ui/vue';
export default {
	name: 'MeetingCard',
	props: ['meetingDetails', 'id'],
	emits: ['toggle-mute', 'switch-tab', 'change-name', 'toggle-shortcut'],
	components: {
		CBox,
		CEditable,
		CEditableInput,
		CEditablePreview,
		CIcon,
		CFlex,
		CGrid,
		CTooltip,
		CCheckbox,
	},
	methods: {
		onNameChange(newName) {
			if (typeof newName === 'string') {
				this.$emit('change-name', this.id, newName);
			}
		},
	},
};
</script>
