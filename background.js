// Button to trigger download

// Save the current tab as a file
function downloadCopy() {
    chrome.tabs.query({
	currentWindow: true,
	active: true
    }, function(tab) {
	// var filename = tab.title.replace(/\.pdf$/, "") + ".pdf"; 
        chrome.downloads.download({
            url: tab[0].url,
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

// The renaming url function
function renameURLToInstitute(){
    chrome.tabs.query({
	currentWindow: true,
	active: true
    }, function(tab) {
        var splitURL = tab[0].url.split("/");
        splitURL.forEach(function(val, i){
	    if (val.endsWith(".org") || val.endsWith(".com")) {
    	        val = val.replace(".", "-") + ".uml.idm.oclc.org";
            }
            splitStr[i] = val;
        });
        url = splitURL.join("/");
        
        updateProperties = new Object();
        updateProperties.url = url;
        chrome.tabs.update(tab[0], updateProperties);
    });
}

chrome.browserAction.onClicked.addListener(downloadCopy);
chrome.browserAction.onClicked.addListener(renameURLToInstitute);

// This allows any pdf file downloaded to be copied out
chrome.downloads.onChanged.addListener(function (e) {
    if (typeof e.filename !== 'undefined') {
	console.log("detected file being downloaded", e.filename);
        if (e.filename.current.endsWith(".pdf")) {
            copyString(e.filename.current);
        }
    }
    console.log("An event happened for downloads.onChanged");
    console.log(e);
});

chrome.commands.onCommand.addListener(function(command) {
    if (command == 'download-copy') {
	downloadCopy();
    }
});
