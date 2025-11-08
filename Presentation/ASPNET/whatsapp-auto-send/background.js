chrome.runtime.onMessage.addListener((request, sender) => {
    if (request.action === "closeThisTab" && sender.tab?.id) {
        console.log("🧹 Closing tab:", sender.tab.id);
        chrome.tabs.remove(sender.tab.id);
    }
});