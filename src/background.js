browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.type === 'getTabId') {
		sendResponse({ tabId: sender.tab.id });
	} else if (request.type === 'disconnected') {
		removeTab(sender.tab.id);
	}
});

browser.tabs.onRemoved.addListener(function (tabId) {
	removeTab(tabId);
});

browser.commands.onCommand.addListener(async function (command) {
	const result = await chrome.storage.local.get(['meetingTabs']);
	const meetingTabs = result.meetingTabs;
	const tabId = Object.keys(meetingTabs).find(
		(key) => meetingTabs[key].isShortcutEnabled === true
	);

	if (!tabId) {
		return;
	}
	if (meetingTabs[tabId][command].isDisabled) {
		return;
	}

	meetingTabs[tabId][command].isMuted = !meetingTabs[tabId][command].isMuted;
	const statusText = meetingTabs[tabId][command].isMuted ? 'muted' : 'unmuted';

	if (command === 'sound') {
		browser.tabs.update(parseInt(tabId), {
			muted: meetingTabs[tabId][command].isMuted,
		});
	}

	await browser.tabs.sendMessage(parseInt(tabId), {
		type: 'update',
		payload: meetingTabs[tabId],
		action: command,
		shouldUpdate: true,
	});

	await browser.notifications.clear('command');
	await browser.notifications.create('command', {
		iconUrl: 'icons/48.png',
		title: 'Meeting Manager',
		type: 'basic',
		message: `The ${command} of meeting "${meetingTabs[tabId].name}" is now ${statusText}.`,
	});
});

async function removeTab(tabId) {
	const result = await chrome.storage.local.get(['meetingTabs']);
	const allTabs = result.meetingTabs;
	tabId = parseInt(tabId);
	if (tabId in allTabs) {
		delete allTabs[tabId];
		await chrome.storage.local.set({ meetingTabs: allTabs });
		await browser.runtime.sendMessage({
			type: 'update',
			payload: allTabs,
		});
	}
}
