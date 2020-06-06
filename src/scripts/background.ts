"use strict";

chrome.runtime.onMessage.addListener((receive: { type: string; keyword: string; }, sender: any): void => {
  if( receive.type !== "connectServer" ) return;
  console.log("background");
  connectServer(receive.keyword, sender);
})

async function connectServer( keywords: string, sender: any ) {
  let waitFlag = false;
  const decodeKeywords = decodeURI(keywords),
    data = JSON.stringify({"keyword": decodeKeywords}),
    xhr = new XMLHttpRequest(); 
  xhr.addEventListener("readystatechange", function() {
    console.log(this.readyState);
    
    if(this.readyState === 4) {
      console.log('response ok');
      chrome.tabs.sendMessage(sender.tab.id, {type: 'backgroundMsg', results: this.response, waitFlag: waitFlag});
      return true;
    } else if (waitFlag !== true) {
        chrome.tabs.sendMessage(sender.tab.id, {type: 'backgroundWait', results: this.readyState});
        waitFlag = true;
    }
  });
  xhr.open("POST", "http://localhost:3000/duck");
  // xhr.open("POST", "https://childish-great-tray.glitch.me/duck/");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(data);
}