// Button to trigger download

var downloadUrl = null;
var fileName = null;

// Save the current tab as a file
function downloadCopy() {
    chrome.tabs.query({
	currentWindow: true,
	active: true
    }, function(tab) {
	// var filename = tab.title.replace(/\.pdf$/, "") + ".pdf";
        downloadUrl = tab[0].url;
        chrome.downloads.download({
            url: downloadUrl,
            // filename: filename
            // conflictAction: 'overwrite'
        }, function (_downloadId) {
            //
        });
    });
}

// copy provided string to the clipboard
function copyString(str) {
    var textArea = document.createElement("textarea");
    textArea.value = str;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
}

chrome.browserAction.onClicked.addListener(downloadCopy);

// This allows any pdf file downloaded to be copied out and trigger org-protocol
chrome.downloads.onChanged.addListener(function (e) {
    if (downloadUrl == null)
        return;

    if (typeof e.filename !== 'undefined') {
	console.log("detected file being downloaded", e.filename);
        if (e.filename.current.endsWith(".pdf")) {
            fileName = e.filename.current;
        }
        else if (downloadUrl.includes("ieeexplore.ieee.org/stamp/stamp.jsp")) {
            chrome.tabs.query({
	    currentWindow: true,
	    active: true
            }, function(tab) {
                chrome.tabs.executeScript({file: "redirectIEEE.js"});
            });
        }
    }

    if (fileName != null && "state" in e && e.state.current === 'complete') {
        const orgProtocolHref = `org-protocol:///add-doi-pdf?url=${downloadUrl}&filename=${fileName}`;
        console.log(`Opening: ${orgProtocolHref}`);
        window.open(orgProtocolHref);
        copyString(orgProtocolHref);
        downloadUrl = null;
        fileName = null;
    }
});

chrome.commands.onCommand.addListener(function(command) {
    if (command == 'download-copy') {
	downloadCopy();
    }
});
