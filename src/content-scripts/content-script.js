let tabId;
const errorMessage = 'ELEMENT_NOT_FOUND';
let meetingDetails = {
	name: /[^/]*$/.exec(window.location.toString())[0].substring(0, 12),
	isShortcutEnabled: false,
	mic: {
		isMuted: false,
		selector: '[role="button"][aria-label*="microphone"][data-is-muted]',
		isDisabled: false,
	},
	camera: {
		isMuted: false,
		selector: '[role="button"][aria-label*="camera"][data-is-muted]',
		isDisabled: false,
	},
	sound: {
		isMuted: false,
	},
};

const mutationObservers = {};

const waitUntilElementExists = (DOMSelector, MAX_TIME = 5000) => {
	let timeout = 0;

	const waitForContainerElement = (resolve, reject) => {
		const container = document.querySelector(DOMSelector);
		timeout += 100;

		if (timeout >= MAX_TIME) reject(errorMessage);

		if (!container || container.length === 0) {
			setTimeout(waitForContainerElement.bind(this, resolve, reject), 100);
		} else {
			resolve(container);
		}
	};
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			waitForContainerElement(resolve, reject);
		}, 1000);
	});
};

async function updateMeeting(isExtensionUpdate) {
	const result = await browser.storage.local.get('meetingTabs');
	const newMeetingTabs = result.meetingTabs || {};
	newMeetingTabs[tabId] = meetingDetails;
	if (isExtensionUpdate) {
		await browser.extension.sendMessage({
			type: 'update',
			payload: newMeetingTabs,
		});
	}

	await browser.storage.local.set({ meetingTabs: newMeetingTabs });
}

async function waitForMuteButton() {
	try {
		console.log('aila me change huya');
		const micEl = await waitUntilElementExists(meetingDetails['mic'].selector);
		const cameraEl = await waitUntilElementExists(
			meetingDetails['camera'].selector
		);
		console.log('start huya just');
		const micDetails = getElementDetails(micEl);
		const cameraDetails = getElementDetails(cameraEl);

		meetingDetails['mic'].isDisabled = micDetails.isDisabled;
		meetingDetails['mic'].isMuted = micDetails.isMuted;
		watchIsMuted('mic', micEl);

		meetingDetails['camera'].isDisabled = cameraDetails.isDisabled;
		meetingDetails['camera'].isMuted = cameraDetails.isMuted;
		watchIsMuted('camera', cameraEl);
		updateMeeting(true);
	} catch (error) {
		console.log(error);
		browser.runtime.sendMessage({ type: 'disconnected' });
	}
}

function getElementDetails(element) {
	const result = {
		isMuted: element.getAttribute('data-is-muted') === 'true',
		isDisabled: element.disabled === true,
	};

	return result;
}

function watchIsMuted(action, el) {
	if (mutationObservers[action]) {
		mutationObservers[action].disconnect();
	}

	mutationObservers[action] = new MutationObserver((mutations) => {
		const newValue = getElementDetails(mutations[0].target);

		if (newValue.isMuted !== meetingDetails[action].isMuted) {
			meetingDetails[action].isMuted = newValue.isMuted;
			updateMeeting(true);
		}

		if (newValue.isDisabled !== meetingDetails[action].isDisabled) {
			meetingDetails[action].isDisabled = newValue.isDisabled;
			updateMeeting(true);
		}
	});
	mutationObservers[action].observe(el, {
		attributes: true,
		attributeFilter: ['data-is-muted', 'disabled'],
	});
}

function watchBodyClass() {
	const bodyClassObserver = new MutationObserver((mutations) => {
		const newClass = mutations[0].target.getAttribute('class');

		if (mutations[0].oldValue !== newClass) {
			waitForMuteButton();
		}
	});
	bodyClassObserver.observe(document.querySelector('body'), {
		attributes: true,
		attributeFilter: ['class'],
		attributeOldValue: true,
	});
}

function toggleMuted(action) {
	document.querySelector(meetingDetails[action].selector).click();
}

browser.runtime.onMessage.addListener(function (request) {
	if (request.type === 'update') {
		meetingDetails = request.payload;
		if (request.action === 'mic' || request.action === 'camera') {
			toggleMuted(request.action);
		}
		const shoudUpdate = request.shouldUpdate === true;
		updateMeeting(shoudUpdate);
	}
});

browser.runtime
	.sendMessage({ type: 'getTabId' })
	.then((res) => {
		tabId = res.tabId;
	})
	.then(() => {
		watchBodyClass();
	});

window.onbeforeunload = () => {
	browser.runtime.sendMessage({ type: 'disconnected' });
};
