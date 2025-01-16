// Button to trigger download

var downloadUrl = null;
var fileName = null;
var doi = null;
var selectedText = null;
// From https://www.crossref.org/blog/dois-and-matching-regular-expressions/
var doiRegex = /10.\d{4,9}\/[-._;()\/:A-Z0-9]+/i;

function getIEEEDownloadUrl() {
    var el = document.getElementsByTagName("iframe");

    console.log(el);
    if (el.length > 0) {
        for (var i = 0; i < el.length; i++) {
            if ("src" in el[i] && el[i].src.includes("ieeexplore.ieee.org")) {
                console.log(`returning: ${el[i].src}`);
                return el[i].src;
            }
        }
    }
}

function getMDPIDownloadUrlAndDOI() {
    var doiUrl = document.querySelector(".bib-identity > a").href;
    var downloadUrl = document.querySelector(".UD_ArticlePDF").href;
    return { doiUrl: doiUrl, downloadUrl: downloadUrl };
}

function downloadFile(tab) {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
    }).then(selection => {
        selectedText = selection[0].result;
        if (doi === null) {
            let match = (downloadUrl.match(doiRegex) || ((typeof selectedText === 'string' || selectedText instanceof String) && selectedText.match(doiRegex)));
            if (match)
                doi = match[0];
        }

        console.log("Downloading: " + downloadUrl);
        chrome.downloads.download({
            url: downloadUrl,
            // filename: filename
            // conflictAction: 'overwrite'
        }, function (_downloadId) {
            //
        });
    });
}

// Save the current tab as a file
function downloadCopy(tab) {
    console.log(tab);
    downloadUrl = tab.url;
    if (downloadUrl.includes("ieeexplore.ieee.org/stamp/stamp.jsp")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getIEEEDownloadUrl,
        }).then(result => {
            downloadUrl = result[0].result;
            var arnumber = (downloadUrl.match(/arnumber=(\d+)/) || downloadUrl.match(/\/document\/(\d+)/))[1];
            if (arnumber)
            {
                let bibtexURL = "https://ieeexplore.ieee.org/rest/search/citation/format?recordIds=" + arnumber + "&fromPage=&citations-format=citation-abstract&download-format=download-bibtex";
                fetch(bibtexURL//, { headers: { Referer: url } }
                ).then(results => results.json().then(json => {
                    doi = json.data.match(doiRegex)[0];
                    downloadFile(tab);
                }));
            }
            else
            {
                downloadFile(tab);
            }
        })
    }
    else if (downloadUrl.includes("link.springer.com")) {
        doi = downloadUrl.match(doiRegex)[0];
        downloadUrl = downloadUrl.replace("article", "content/pdf") + ".pdf";
        downloadFile(tab);
    }
    else if (downloadUrl.includes("mdpi.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getMDPIDownloadUrlAndDOI,
        }).then((results) => {
            downloadUrl = results[0].result.downloadUrl;
            doi = results[0].result.doiUrl.match(doiRegex)[0];
            downloadFile(tab);
        });
    }
    else if (downloadUrl.includes("tandfonline.com/doi")) {
        doi = downloadUrl.match(doiRegex)[0];
        downloadUrl = downloadUrl.replace("epdf", "pdf") + "?download=true";
        console.log(doi, downloadUrl);
        downloadFile(tab);
    }
    else {
        downloadFile(tab);
    }
}

// copy provided string to the clipboard
/* function copyString(str) {
*     var textArea = document.createElement("textarea");
*     textArea.value = str;
*     document.body.appendChild(textArea);
*     textArea.select();
*     document.execCommand("copy");
*     textArea.remove();
* } */

chrome.action.onClicked.addListener(downloadCopy);

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
        const orgProtocolHref = `org-protocol:///add-doi-pdf?url=${downloadUrl}&filename=${fileName}&doi=${doi}&selectedText=${selectedText}`;
        console.log(`Opening: ${orgProtocolHref}`);
        /* window.open(orgProtocolHref); */
        chrome.tabs.create({ url: orgProtocolHref });
        /* copyString(orgProtocolHref); */
        downloadUrl = null;
        fileName = null;
        doi = null;
    }
});

chrome.commands.onCommand.addListener(function(command) {
    if (command == 'download-copy') {
	downloadCopy();
    }
});
