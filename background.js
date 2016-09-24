chrome.browserAction.onClicked.addListener(function (activeTab) {
    chrome.tabs.create({
        url: "https://www.yemeksepeti.com/hesabim/onceki-siparislerim"
    });
});
