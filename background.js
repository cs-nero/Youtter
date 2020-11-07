var activate;
let instance;

window.addEventListener("load",function(){
	browser.runtime.getPlatformInfo().then(function(item){
		// OS Android?
		if(item.os=="android"){
			activateBlocker();
		}
		else{
			// Wiederherstellen des Status des Blockers
			browser.storage.local.get("activated").then(function(item){
				console.log(item);
				if (item.activated==undefined){
					browser.storage.local.set({activated: true});
					activate=true
				}else{
					activate=item.activated
				}
				if(activate) activateBlocker();
				else deactivateBlocker();
			},function(e){
			console.log(e);
		})
		}
	})
});

// Auf Veränderungen prüfen

browser.storage.onChanged.addListener(function (changes) {
  if ("instance" in changes) {
    instance = changes.instance.newValue || "yotter.xyz";
  }
});

browser.browserAction.onClicked.addListener(clicked);
function clicked() {
	if(activate){
		deactivateBlocker();
	} else {
		activateBlocker();
	}
}

function activateBlocker() {
	browser.browserAction.setIcon({path:"icons/yotter.png"});
	browser.storage.local.set({activated: true});
	activate = true;
}


function deactivateBlocker() {
	browser.browserAction.setIcon({path: "icons/youtube.png"});
	browser.storage.local.set({activated: false});
	activate = false;
}

browser.storage.sync.get("instance", (result) => {
  instance = result.instance || "yotter.xyz";
});

chrome.webRequest.onBeforeRequest.addListener((details) => {

    const youtubeRegex = /youtube.com(\/?.*)/;
    const youtubeShortRegex = /youtu.be\/.+/;
	
	if (activate == true) {
    if (youtubeRegex.test(details.url) === true) {
      return {redirectUrl: 'https://' + instance + youtubeRegex.exec(details.url)[1]};
    } else if (youtubeShortRegex.test(details.url) === true) {
      const youtubeShortCaptureRegex = /youtu.be\/(.+)/;
      return {redirectUrl: 'https://' + instance + '/watch?v=' + youtubeShortCaptureRegex.exec(details.url)[1]};
    } else {
      return {redirectUrl: 'https://' + instance};
    }
	}
  },
  {
    urls: [
      '*://*.youtube.com/*',
      '*://*.youtu.be/*'
    ],
    types: [
      'main_frame',
      'sub_frame'
    ]
  },
['blocking']);
