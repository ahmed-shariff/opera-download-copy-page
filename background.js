chrome.browserAction.onClicked.addListener(function(tab) {
    var filename = tab.title.replace(/\.pdf$/, "") + ".pdf"; 
    chrome.downloads.download({
        url: tab.url,
        filename: filename,
        conflictAction: 'overwrite'
    }, function (downloadId) {
        // chrome.downloads.search({id: downloadId}, function (downloadItem) {
        //     console.log("filename with absolute local path " , downloadItem.filename);
        // });
    });
    copyURL(filename);
});

// chrome.downloads.onChanged.addListener(function (e) {
//     if (typeof e.state !== 'undefined') {
//         console.log('Download ID ' + e.id + 'boop' + e.filename);
// 	if (e.state.current === 'complete') {
// 	    console.log('Download ID ' + e.id + ' has completed  ' + e.filename);
// 	}
//     }
// });

function copyURL(url) {
    var textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
}
