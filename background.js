// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
	//matches examples
	//na4.salesforce.com
	//cs13.salesforce.com
	//company.my.salesforce.com
	//emea.salesforce.com

    var urlIsValid = false;
	if (tab.url.match(/(ap|eu|na|cs|emea|.*\.my)[0-9]*\.(visual\.force\.com|salesforce\.com)/) !== null) {
        urlIsValid = true;
	}

    if (tab.url.match(/(.*).(lightning\.force\.com)/) !== null) {
        urlIsValid = true;
    }
	if (urlIsValid) {
        chrome.pageAction.show(tabId);
    }
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);