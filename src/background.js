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
	const result = await browser.storage.local.get('meetingTabs');
	const meetingTabs = result.meetingTabs;
	const tabId = Object.keys(meetingTabs).find(
		(key) => meetingTabs[key].isShortcutEnabled === true
	);

	if (!tabId) {
		return;
	}
	meetingTabs[tabId][command].isMuted = !meetingTabs[tabId][command].isMuted;
	const statusText = meetingTabs[tabId][command].isMuted ? 'muted' : 'unmuted';

	if (command === 'sound') {
		browser.tabs.update(parseInt(tabId), {
			muted: meetingTabs[tabId][command].isMuted,
		});
	}

	browser.tabs.sendMessage(parseInt(tabId), {
		type: 'update',
		payload: meetingTabs[tabId],
		action: command,
		shouldUpdate: true,
	});
	browser.notifications.create('command', {
		iconUrl: 'icons/48.png',
		title: 'Command invoked!',
		type: 'basic',
		message: `The ${command} of meeting "${meetingTabs[tabId].name}" is now ${statusText}.`,
	});
});

async function removeTab(tabId) {
	const result = await browser.storage.local.get('meetingTabs');
	const allTabs = result.meetingTabs;
	tabId = parseInt(tabId);
	if (tabId in allTabs) {
		delete allTabs[tabId];
		await browser.storage.local.set({ meetingTabs: allTabs });
		await browser.extension.sendMessage({
			type: 'update',
			payload: allTabs,
		});
	}
}
