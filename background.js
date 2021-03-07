var activate;
var warAktiviert;
let instance = "yotter.xyz";
let enabledBlock = false;

function setVars(item) {
    instance = item.instance;
    enabledBlock = item.enabledBlock;
}

let getting = browser.storage.local.get({
    instance: 'yotter.xyz',
    enabledBlock: true
});
getting.then(setVars);


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
  if ("enabledBlock" in changes) {
	  enabledBlock = changes.enabledBlock.newValue;  
  }
});

// Wenn Icon geklickt wird Blocker de-/aktivieren
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

// Redirect
chrome.webRequest.onBeforeRequest.addListener((details) => {

	const youtubeSearchRegex = /youtube.com\/results\?search_query=.+/;
    const youtubeRegex = /youtube.com(\/?.*)/;
    const youtubeShortRegex = /youtu.be\/.+/;
	const youtubeEmbedRegex = /youtube-nocookie.com\/.+/;
	
	if (activate == true) {
		if (youtubeSearchRegex.test(details.url) === true) {
		const youtubeSearchCaptureRegex = /(youtube.com\/.*\b[.^\w*results\?search_query=\w*]\b)(.*)/;
		return {redirectUrl: 'https://' + instance + '/ytsearch?q=' + youtubeSearchCaptureRegex.exec(details.url)[2]};
    } else if (youtubeRegex.test(details.url) === true) {
		return {redirectUrl: 'https://' + instance + youtubeRegex.exec(details.url)[1]};
    } else if (youtubeShortRegex.test(details.url) === true) {
		const youtubeShortCaptureRegex = /youtu.be\/(.+)/;
		return {redirectUrl: 'https://' + instance + '/watch?v=' + youtubeShortCaptureRegex.exec(details.url)[1]};
    } else if ((youtubeEmbedRegex.test(details.url) === true && enabledBlock==true)) {
		return {cancel: true};
	} /*else {
      return {redirectUrl: 'https://' + instance}; >>> This will be activated when it is possible to redirect embedded videos.
    }*/
	}
  },
  {
    urls: [
      '*://*.youtube.com/*',
      '*://*.youtu.be/*',
	  '*://*.youtube-nocookie.com/*'
    ]
  },
['blocking']);

// URL Icon Click --> Open on YouTube
browser.pageAction.onClicked.addListener((details) => {
	if (activate == true) {
		warAktiviert = true;
	} else {
		warAktiviert = false;
	}
	
	activate = false;
	const yotterRegex = /\/watch\?v=(.+)/;
	var YTzsmGesetzt = "https://www.youtube.com/watch?v=" + yotterRegex.exec(details.url)[1];
	var creating = browser.tabs.create({
    url: YTzsmGesetzt
  });
	setTimeout(function() {
		if (warAktiviert == true) {
			activate = true;
		}
},500);
});
