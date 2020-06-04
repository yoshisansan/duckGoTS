"use strict";

interface duckGoData {
  type: string;
  results: string;
  waitFlag: boolean;
}

interface duckGoResults {
  title: string;
  url: string;
  snippet: string;
}[];

chrome.storage.local.get(null, (item) => {
  if( item["searchCheck"] === true ) {
    const url: string = location.href;
    keywordCheck(url);
  }
});

const keywordCheck = (url: any) => {
  if(!url.match(/&start=0/)) return;
  const target: any = url.match(/q=[^&]*/)[0].replace(/^q=/, ""),
    keywords: any = target.replace(/\+/g, " ");
  console.log(keywords);
  chrome.runtime.sendMessage({ type: "connectServer", keyword: keywords });
};

//backgroundから戻り値を受け取る
chrome.runtime.onMessage.addListener(function (res) {
  switch (res.type) {
    case "backgroundMsg":
      addDomOfGoogle(res);
      break;
    case "backgroundWait":
      waitDomOfGoogle(res.results);
      break;
    default:
      break;
  }
})

const waitDomOfGoogle = (response: any): void => {
  if( response === 4 ) return;

  const dom: HTMLInputElement = <HTMLInputElement>document.getElementById("rhs"),
    newElement: HTMLInputElement = <HTMLInputElement>document.createElement("div"),
    elm: HTMLInputElement = <HTMLInputElement>document.querySelector("head"),
    newStyleElm: HTMLStyleElement = document.createElement("style");

  newElement.classList.add("waits");
  newElement.setAttribute("id", "waitsAnime");

  const waitDom = `
      <div class="waits__block">
        <div class="waits__spin"></div>
      </div>
  `;

  newElement.innerHTML = waitDom;
  newStyleElm.innerHTML = cssWait;

  dom.appendChild(newElement);
  elm.appendChild(newStyleElm);

}

const addDomOfGoogle = ( response: duckGoData ) => {
  if( response.waitFlag !== false ) {
    const deleteDom: HTMLInputElement = <HTMLInputElement>document.getElementById("waitsAnime");
    const parent: HTMLInputElement = <HTMLInputElement>deleteDom.parentNode;
    parent.removeChild(deleteDom);
  }
  const duckGo: string = response.results;
  const duckGoDom: duckGoResults[] = JSON.parse(duckGo);
  const responseItem = ( result: duckGoResults ) => {
    return `
    <div id="dupliChecker" class="ducks">
      <div class="ducks__padding">
        <div class="ducks__title"><a href="${result.url}">${result.title}</a></div>
        <div class="ducks__url"><a href="${result.url}">${decodeURI(result.url)}</a></div>
        <div class="ducks__snippet"><p>${result.snippet}</p></div>
      </div>
    </div>
  `;
  };
  const reduceItem = (( a: any ,b: any ) => {
    return a + b;
  });
  const searchResults: string[] = duckGoDom.map(responseItem);
  const reducedResults : string = searchResults.reduce(reduceItem);
  const dom: HTMLInputElement = <HTMLInputElement>document.getElementById("rhs"),
    newElement: HTMLInputElement = <HTMLInputElement>document.createElement("div"),
    elm: HTMLInputElement = <HTMLInputElement>document.querySelector("head"),
    newStyleElm: HTMLStyleElement = <HTMLStyleElement>document.createElement("style");

  newElement.classList.add("ducks");
  const domTree = `
    <div class="duckduck">
      <div class="duckduck__header">
      </div>
      <div class="duckduck__results">
      ${reducedResults}
      </div>
      <div class="duckduck__footer">
        <a href="https://duckduckgo.com/" target="_blank" rel="noopener">Search on DuckDuckGo</a>
        <div class="duckduck__footer-logo">${svgLogo}</div>
      </div>
    </div>
  `;
  newElement.innerHTML = domTree;
  newStyleElm.innerHTML = cssDucks;

  dom.appendChild(newElement);
  elm.appendChild(newStyleElm);
};

const cssDucks = `
  .duckduck {
    border-radius: 8px;
    box-shadow: 1px 1px 4px 1px rgba(0,0,0,0.08);
    width: 400px;
    animation: show_anime 1s ease-in-out;
  }
  @keyframes show_anime {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 0.9;
    }
    100% {
      opacity: 1;
    }
  }
  .duckduck:hover {
    opacity: 1;
  }
  .ducks__title {
    font-size: 16px;
    color: #00278e;
    line-height: 25.89px;
  }
  .ducks {
    // background-color: #f7f7f7;
  }
  .ducks:first-child {
    border-radius: 8px 8px 0 0;
  }
  .ducks:last-child {
    border-radius: 0 0 8px 8px;
  }
  .ducks__padding:first-child {
    padding-top: 12px;
  }
  .ducks__padding {
    padding: 0 12px;
  }
  .ducks__url {
    font-size: 12px;
  }
  .ducks__url > a {
    line-height: 19.24px;
    word-wrap: break-word;
    color: #20692b !important;
  }
  .ducks__url > a:visited {
    color: #20692b !important;
  }
  .ducks__snippet {
    color: #8a8a8a;
    font-size: 12px;
  }
  .ducks__snippet p {
    margin: 0;
    line-height: 19.24px;
  }
  .duckduck__footer {
    height: 48px;
    text-align: right;
    line-height: 48px;
    padding: 0 12px;
  }
  .duckduck__footer a {
    color: #4d5156;
    display: inline-block;
  }
  .duckduck__footer-logo {
    display: inline-block;
    vertical-align: middle;
  }
`;

const cssWait = `
  .waits {
    transition: all 1s;
  }
  .waits__block {
    width: 400px;
    height: 200px;
    line-height: 200px;
    text-align: center;
  }
  .waits__spin {
    background-color: #e0e0e0;
    border-radius: 100%;
    display: inline-block;
    width: 40px;
    height: 40px;
    animation: scale-out 1s infinite ease-in-out;
  }
  @keyframes scale-out {
    0% {
      transform: scale(0);
    } 100% {
      transform: scale(1.0);
      opacity: 0;
    }
  }
`;

const svgLogo = `
<svg xmlns="http://www.w3.org/2000/svg" buffered-rendering="static" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 128 128">
<desc>
This file was created by http://www.h2.dion.ne.jp/~defghi/img2svg3/img2svg3.htm at Sun May 24 2020 09:44:33 GMT+0700 (インドシナ時間)
</desc>
<defs>
<g id="rgb" style="isolation:isolate;">
<g id="r" style="mix-blend-mode:screen;">
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 .9 1.4 4.3 .9 2.3-.4 5.1-.4 6.2 .1 1.6 .5 .9 1-3.5 2.2-3 .8-8.2 2.9-11.4 4.6-3.3 1.8-7.9 5.5-10.4 8.2-2.5 2.8-6 8.2-7.8 12-1.9 3.9-4.1 10.2-4.9 14-.8 3.9-1.5 10.2-1.5 14 0 3.9 .7 9.9 1.4 13.5 .8 3.6 2.5 9 3.8 12 1.4 3 4.3 7.8 6.5 10.5 2.1 2.8 6.4 6.6 9.4 8.7 3 2 9 4.8 13.4 6.3 6.7 2.3 9.8 2.8 18.5 2.8 5.8 .1 12.5-.5 15-1.2 2.5-.7 7.7-2.7 11.5-4.3 3.9-1.7 9.3-4.7 12.2-6.7l5.2-3.6 .1-19.7 0-19.8-22 0-22 0 0 6.5 0 6.5 15 0 15 0 0 9.8 0 9.7-3.3 2.1c-1.7 1.1-6.1 3.2-9.7 4.6-3.6 1.5-9.4 2.9-13 3.3-4 .4-8.8 .2-12.5-.5-3.3-.7-8.1-2.3-10.7-3.6-2.7-1.3-6.5-4.1-8.6-6.1-2-2.1-4.7-5.9-6-8.5-1.2-2.7-2.6-6.7-3.2-9-.5-2.4-1-8.6-1-13.8 0-5.2 .6-11.7 1.4-14.5 .7-2.7 2.2-6.8 3.3-9 1.1-2.2 3.3-5.5 4.9-7.4 1.6-1.9 4.7-4.5 6.9-5.9 2.2-1.4 6-3.1 8.5-3.8 2.5-.8 8-1.4 12.3-1.4 5.6 0 9.3 .6 13.5 2.2 3.1 1.2 7 3.4 8.6 4.8 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4 0 3-.6 5.7-1.4l5-1.3-.2-2.9c-.2-1.6-1.6-5.7-3.3-9.1-2-4.3-4.5-7.5-7.7-10.1-2.7-2.1-7.3-4.7-10.3-5.9-3-1.2-7.2-2.4-9.2-2.7-2.1-.3-3.8-.9-3.8-1.3 0-.5-2.1-2-4.7-3.5-2.6-1.4-7-3.5-9.8-4.6-2.7-1-6.5-2.2-8.2-2.6ZM80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM88 85.3c-1.4-.2-5 .6-8 1.8-3 1.1-5.9 2-6.5 2-.5 0-2.6-.3-4.5-.7-2.3-.3-4.2 0-5.5 .9-1.8 1.3-2.5 1.2-6.5-.4-2.5-1-5.3-1.8-6.2-1.8-1.6-.1-1.8 1-1.8 9.2l0 9.2 3.2-.9c1.8-.6 6.7-1 10.9-1 5.8-.1 8.1-.5 9.5-1.8 1.1-1 2.8-1.8 3.9-1.8 1.1 0 4.3 .8 7.2 1.8 2.9 .9 5.4 1.5 5.7 1.2 .2-.3 .5-4.3 .7-9l0.4-8.5-2.5-.2Z" style="fill:rgb(255,0,0);"/>
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 1 1.4 5.3 .8 2.8-.3 5.5-.2 5.9 .3 .4 .5-.8 1.2-2.5 1.5-1.8 .4-6.3 2.1-10.2 3.9-4.5 2.1-8.8 5.1-12 8.4-2.8 2.8-6.7 8.5-8.7 12.6-2.1 4.1-3.8 8.3-3.8 9.3 0 .9-.4 2.6-1 3.7-.5 1.1-1.3 6.2-1.6 11.3-.4 5.3-.1 11.7 .5 15.2 .6 3.3 2.2 8.9 3.6 12.5 1.4 3.6 3.6 7.7 5 9.3 1.4 1.5 2.5 3 2.5 3.5-.1 .4 2.1 2.5 4.7 4.7 2.6 2.2 5.9 4.8 7.3 5.6 1.4 .9 5.1 2.6 8.3 3.7 3.1 1.2 8.3 2.5 11.5 3 3.1 .4 8.9 .6 12.7 .6 3.9-.1 9-.7 11.5-1.4 2.5-.6 7.7-2.5 11.5-4.2 3.9-1.7 9.4-4.9 12.3-7.2l5.3-4.1-.1-19.2 0-19.3-22 0-22 0 0 6 0 6 15 0 15 0 0 10.3c0 9-.2 10.4-2 12-1.1 .9-2 1.4-2 1 .1-.5-.5-.3-1.2 .4-.7 .6-4.2 2.3-7.8 3.6-3.6 1.4-8.7 2.8-11.5 3.2-2.7 .4-5.4 .7-6 .7-.5 0-2.8-.2-5-.5-2.2-.3-4.9-.8-6-1.2-1.1-.4-3.8-1.4-6-2.3-2.2-1-6-3.3-8.5-5.3-2.9-2.3-5.5-5.7-7.4-9.5-1.6-3.2-3.3-7.7-3.8-9.9-.5-2.2-.8-8.3-.8-13.5 0-5.3 .7-11.8 1.5-14.7 .8-2.9 1.3-5.3 1-5.3-.3 0 .2-.7 1-1.5 .8-.8 1.5-2.2 1.5-3 0-.8 .6-2.1 1.3-2.8 .6-.7 2.9-3.1 5-5.5 2-2.3 3.7-4 3.7-3.7 0 .3 1-.1 2.3-.9 1.2-.8 4.5-2.2 7.2-3.1 2.9-1 8.2-1.7 12.5-1.7 5.5 0 9.1 .6 13.5 2.3 3.3 1.3 7.3 3.5 8.9 4.9 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4-.1 3-.7 5.7-1.4l5-1.4-.3-2.8c-.2-1.6-1.3-5.1-2.6-7.9-1.3-2.7-3.5-6.5-4.9-8.2-1.5-1.8-3.1-3.3-3.7-3.3-.5 0-1.9-.9-3-2-1.1-1.1-2.9-2-4-2-1.1 0-2.1-.4-2.2-1-.2-.5-3.2-1.7-6.8-2.6-3.6-.9-7.2-2.4-8-3.2-.8-.8-3.1-2.3-5-3.2-1.9-1-5.7-2.7-8.5-3.8-2.7-1-6.5-2.2-8.2-2.6ZM80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM82.2 45.5c0.6 .6 .7 1.7 .3 2.5-.5 1-1 1.2-1.7 .5-.6-.5-.7-1.7-.3-2.5 .5-1 1-1.2 1.7-.5ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM53 51c1.3 0 2 .7 2 2 0 1.3-.6 1.9-1.7 1.8-1-.2-1.9-1.1-2-2-.2-1.2 .4-1.8 1.7-1.8ZM88 85.3c-1.4-.2-5 .6-8 1.8-3 1.1-5.9 2-6.5 2-.5 0-2.6-.3-4.5-.7-2.3-.3-4.2 0-5.5 .9-1.8 1.3-2.5 1.2-6.5-.4-2.5-1-5.3-1.8-6.2-1.8-1.6-.1-1.8 1-1.8 9.2l0 9.2 3.2-.9c1.8-.6 6.7-1 10.9-1 5.8-.1 8.1-.5 9.5-1.8 1.1-1 2.8-1.8 3.9-1.8 1.1 0 4.3 .8 7.2 1.8 2.9 .9 5.4 1.5 5.7 1.2 .2-.3 .5-4.3 .7-9l0.4-8.5-2.5-.2Z" style="fill:rgb(204,0,0);"/>
<path d="M80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM82.3 45c0.4 0 .7 .9 .7 2 0 1.1-.7 2-1.5 2-.8 0-1.5-.6-1.5-1.2 0-.7 .3-1.6 .7-2.1 .5-.4 1.1-.7 1.6-.7ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM53.3 51.3c1.2 .1 2.2 .9 2.2 1.7 0 .8-1 1.6-2.2 1.8-1.7 .1-2.3-.3-2.3-1.8 0-1.5 .6-1.9 2.3-1.7ZM88 85.3c-1.4-.2-5 .6-8 1.8-3 1.1-5.9 2-6.5 2-.5 0-2.6-.3-4.5-.7-2.3-.3-4.2 0-5.5 .9-1.8 1.3-2.5 1.2-6.5-.4-2.5-1-5.3-1.8-6.2-1.8-1.6-.1-1.8 1-1.8 9.2l0 9.2 3.2-.9c1.8-.6 6.7-1 10.9-1 5.8-.1 8.1-.5 9.5-1.8 1.1-1 2.8-1.8 3.9-1.8 1.1 0 4.3 .8 7.2 1.8 2.9 .9 5.4 1.5 5.7 1.2 .2-.3 .5-4.3 .7-9l0.4-8.5-2.5-.2Z" style="fill:rgb(153,0,0);"/>
<path d="M80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM81.8 45.3c0.9 .1 1.7 .9 1.7 1.7 0 .8-.8 1.6-1.7 1.7-1.2 .2-1.8-.4-1.8-1.7 0-1.3 .6-1.9 1.8-1.7ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM53 49.9c0.3 0 1.1 .7 1.8 1.6 .8 1 .9 2 .2 3-.5 .8-1.7 1.3-2.5 1-.8-.3-1.5-1.3-1.5-2.2 0-1 .3-2.1 .7-2.6 .5-.4 1-.8 1.3-.8ZM88 85.3c-1.4-.2-5 .6-8 1.8-3 1.1-5.9 2-6.5 2-.5 0-2.6-.3-4.5-.7-2.3-.3-4.2 0-5.5 .9-1.8 1.3-2.5 1.2-6.5-.4-2.5-1-5.3-1.8-6.2-1.8-1.6-.1-1.8 1-1.8 9.2l0 9.2 3.2-.9c1.8-.6 6.7-1 10.9-1 5.8-.1 8.1-.5 9.5-1.8 1.1-1 2.8-1.8 3.9-1.8 1.1 0 4.3 .8 7.2 1.8 2.9 .9 5.4 1.5 5.7 1.2 .2-.3 .5-4.3 .7-9l0.4-8.5-2.5-.2Z" style="fill:rgb(102,0,0);"/>
<path d="M80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM81.7 45.3c0.9 .1 1.8 .8 2 1.5 .2 .6-.4 1.5-1.2 2-.9 .4-2.1 .3-2.6-.3-.6-.5-.8-1.6-.5-2.2 .3-.7 1.4-1.2 2.3-1ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM52.8 50c0.1 0 .9 .2 1.7 .5 .8 .3 1.5 1.1 1.5 1.8 .1 .6-.7 1.9-1.6 2.7-1.4 1.3-1.8 1.3-3-.5-1.1-1.6-1.1-2.3-.1-3.3 .6-.7 1.3-1.3 1.5-1.2ZM73.8 100c-.2-.1-1 .7-1.8 1.7l-1.5 1.8 1.8-1.5c1-.8 1.8-1.6 1.7-1.7 0-.2-.1-.3-.2-.3ZM66.3 103c-2.3-.3-3.9-.1-3.5 .3 .4 .4 2.3 .6 4.2 .5l3.5-.3-4.2-.5Z" style="fill:rgb(51,0,0);"/>
<path d="M46.5 48c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM53.5 48c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM86.5 49c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM56.5 51l-.5 0 .5 1c0.3 .6 .7 1 1 1l0.5 0-.5-1c-.3-.5-.7-1-1-1ZM71.5 51c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM86.5 51c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM86.5 53c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM40.5 55c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM85.5 55c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM40.5 57c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM75.5 57c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM58.5 58c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM42.5 62c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM56.5 62c-.3 0-.8 .6-1.2 1.2-.5 .9-.4 1 .5 .5 .6-.4 1.2-.9 1.2-1.2 0-.3-.2-.5-.5-.5ZM47.5 65c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5ZM52.5 65c-.3 0-.5 .2-.5 .5 0 .3 .2 .5 .5 .5 .3 0 .5-.2 .5-.5 0-.3-.2-.5-.5-.5Z" style="fill:rgb(0,0,0);"/>
</g>
<g id="g" style="mix-blend-mode:screen;">
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 .9 1.4 4.3 .9 2.3-.4 5.1-.4 6.2 .1 1.6 .5 .9 1-3.5 2.2-3 .8-8.2 2.9-11.4 4.6-3.3 1.8-7.9 5.5-10.4 8.2-2.5 2.8-6 8.2-7.8 12-1.9 3.9-4.1 10.2-4.9 14-.8 3.9-1.5 10.2-1.5 14 0 3.9 .7 9.9 1.4 13.5 .8 3.6 2.5 9 3.8 12 1.4 3 4.3 7.8 6.5 10.5 2.1 2.8 6.4 6.6 9.4 8.7 3 2 9 4.8 13.4 6.3 6.7 2.3 9.8 2.8 18.5 2.8 5.8 .1 12.5-.5 15-1.2 2.5-.7 7.7-2.7 11.5-4.3 3.9-1.7 9.3-4.7 12.2-6.7l5.2-3.6 .1-19.7 0-19.8-22 0-22 0 0 6.5 0 6.5 15 0 15 0 0 9.8 0 9.7-3.3 2.1c-1.7 1.1-6.1 3.2-9.7 4.6-3.6 1.5-9.4 2.9-13 3.3-4 .4-8.8 .2-12.5-.5-3.3-.7-8.1-2.3-10.7-3.6-2.7-1.3-6.5-4.1-8.6-6.1-2-2.1-4.7-5.9-6-8.5-1.2-2.7-2.6-6.7-3.2-9-.5-2.4-1-8.6-1-13.8 0-5.2 .6-11.7 1.4-14.5 .7-2.7 2.2-6.8 3.3-9 1.1-2.2 3.3-5.5 4.9-7.4 1.6-1.9 4.7-4.5 6.9-5.9 2.2-1.4 6-3.1 8.5-3.8 2.5-.8 8-1.4 12.3-1.4 5.6 0 9.3 .6 13.5 2.2 3.1 1.2 7 3.4 8.6 4.8 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4 0 3-.6 5.7-1.4l5-1.3-.2-2.9c-.2-1.6-1.6-5.7-3.3-9.1-2-4.3-4.5-7.5-7.7-10.1-2.7-2.1-7.3-4.7-10.3-5.9-3-1.2-7.2-2.4-9.2-2.7-2.1-.3-3.8-.9-3.8-1.3 0-.5-2.1-2-4.7-3.5-2.6-1.4-7-3.5-9.8-4.6-2.7-1-6.5-2.2-8.2-2.6ZM80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM88 85.3c-1.4-.2-5 .6-8 1.8-3 1.1-5.9 2-6.5 2-.5 0-2.6-.3-4.5-.7-2.3-.3-4.2 0-5.5 .9-1.8 1.3-2.5 1.2-6.5-.4-2.5-1-5.3-1.8-6.2-1.8-1.6-.1-1.8 1-1.8 9.2l0 9.2 3.2-.9c1.8-.6 6.7-1 10.9-1 5.8-.1 8.1-.5 9.5-1.8 1.1-1 2.8-1.8 3.9-1.8 1.1 0 4.3 .8 7.2 1.8 2.9 .9 5.4 1.5 5.7 1.2 .2-.3 .5-4.3 .7-9l0.4-8.5-2.5-.2Z" style="fill:rgb(0,255,0);"/>
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 .9 1.4 4.3 .9 2.3-.4 5.1-.4 6.2 .1 1.6 .5 .9 1-3.5 2.2-3 .8-8.2 2.9-11.4 4.6-3.3 1.8-7.9 5.5-10.4 8.2-2.5 2.8-6 8.2-7.8 12-1.9 3.9-4.1 10.2-4.9 14-.8 3.9-1.5 10.2-1.5 14 0 3.9 .7 9.9 1.4 13.5 .8 3.6 2.5 9 3.8 12 1.4 3 4.3 7.8 6.5 10.5 2.1 2.8 6.4 6.6 9.4 8.7 3 2 9 4.8 13.4 6.3 6.7 2.3 9.8 2.8 18.5 2.8 5.8 .1 12.5-.5 15-1.2 2.5-.7 7.7-2.7 11.5-4.3 3.9-1.7 9.3-4.7 12.2-6.7l5.2-3.6 .1-19.7 0-19.8-22 0-22 0 0 6.5 0 6.5 15 0 15 0 0 9.8 0 9.7-3.3 2.1c-1.7 1.1-6.1 3.2-9.7 4.6-3.6 1.5-9.4 2.9-13 3.3-4 .4-8.8 .2-12.5-.5-3.3-.7-8.1-2.3-10.7-3.6-2.7-1.3-6.5-4.1-8.6-6.1-2-2.1-4.7-5.9-6-8.5-1.2-2.7-2.6-6.7-3.2-9-.5-2.4-1-8.6-1-13.8 0-5.2 .6-11.7 1.4-14.5 .7-2.7 2.2-6.8 3.3-9 1.1-2.2 3.3-5.5 4.9-7.4 1.6-1.9 4.7-4.5 6.9-5.9 2.2-1.4 6-3.1 8.5-3.8 2.5-.8 8-1.4 12.3-1.4 5.6 0 9.3 .6 13.5 2.2 3.1 1.2 7 3.4 8.6 4.8 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4 0 3-.6 5.7-1.4l5-1.3-.2-2.9c-.2-1.6-1.6-5.7-3.3-9.1-2-4.3-4.5-7.5-7.7-10.1-2.7-2.1-7.3-4.7-10.3-5.9-3-1.2-7.2-2.4-9.2-2.7-2.1-.3-3.8-.9-3.8-1.3 0-.5-2.1-2-4.7-3.5-2.6-1.4-7-3.5-9.8-4.6-2.7-1-6.5-2.2-8.2-2.6ZM80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM82 45.5c0.6 .3 1 1.2 1 2 0 .8-.4 1.5-1 1.5-.5 0-1.2-.4-1.5-1l-.5-1 .5-1c0.3-.5 1-.8 1.5-.5ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM53 51c1.3 0 2 .7 2 2 0 1.3-.6 1.9-1.7 1.8-1-.2-1.9-1.1-2-2-.2-1.2 .4-1.8 1.7-1.8ZM88 85.3c-1.4-.2-5 .6-8 1.8-3 1.1-5.9 2-6.5 2-.5 0-2.6-.3-4.5-.7-2.3-.3-4.2 0-5.5 .9-1.8 1.3-2.5 1.2-6.5-.4-2.5-1-5.3-1.8-6.2-1.8-1.6-.1-1.8 1-1.8 9.2l0 9.2 3.2-.9c1.8-.6 6.7-1 10.9-1 5.8-.1 8.1-.5 9.5-1.8 1.1-1 2.8-1.8 3.9-1.8 1.1 0 4.3 .8 7.2 1.8 2.9 .9 5.4 1.5 5.7 1.2 .2-.3 .5-4.3 .7-9l0.4-8.5-2.5-.2Z" style="fill:rgb(0,204,0);"/>
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 .9 1.4 4.3 .9 2.3-.4 5.1-.4 6.2 .1 1.6 .5 .9 1-3.5 2.2-3 .8-8.2 2.9-11.4 4.6-3.3 1.8-7.9 5.5-10.4 8.2-2.5 2.8-6 8.2-7.8 12-1.9 3.9-4.1 10.2-4.9 14-.8 3.9-1.5 10.2-1.5 14 0 3.9 .7 9.9 1.4 13.5 .8 3.6 2.5 9 3.8 12 1.4 3 4.3 7.8 6.5 10.5 2.1 2.8 6.4 6.6 9.4 8.7 3 2 9 4.8 13.4 6.3 6.7 2.3 9.8 2.8 18.5 2.8 5.8 .1 12.5-.5 15-1.2 2.5-.7 7.7-2.7 11.5-4.3 3.9-1.7 9.3-4.7 12.2-6.7l5.2-3.6 .1-19.7 0-19.8-22 0-22 0 0 6.5 0 6.5 15 0 15 0 0 9.8 0 9.7-3.3 2.1c-1.7 1.1-6.1 3.2-9.7 4.6-3.6 1.5-9.4 2.9-13 3.3-4 .4-8.8 .2-12.5-.5-3.3-.7-8.1-2.3-10.7-3.6-2.7-1.3-6.5-4.1-8.6-6.1-2-2.1-4.7-5.9-6-8.5-1.2-2.7-2.6-6.7-3.2-9-.5-2.4-1-8.6-1-13.8 0-5.2 .6-11.7 1.4-14.5 .7-2.7 2.2-6.8 3.3-9 1.1-2.2 3.3-5.5 4.9-7.4 1.6-1.9 4.7-4.5 6.9-5.9 2.2-1.4 6-3.1 8.5-3.8 2.5-.8 8-1.4 12.3-1.4 5.6 0 9.3 .6 13.5 2.2 3.1 1.2 7 3.4 8.6 4.8 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4 0 3-.6 5.7-1.4l5-1.3-.2-2.9c-.2-1.6-1.6-5.7-3.3-9.1-2-4.3-4.5-7.5-7.7-10.1-2.7-2.1-7.3-4.7-10.3-5.9-3-1.2-7.2-2.4-9.2-2.7-2.1-.3-3.8-.9-3.8-1.3 0-.5-2.1-2-4.7-3.5-2.6-1.4-7-3.5-9.8-4.6-2.7-1-6.5-2.2-8.2-2.6ZM80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM82.3 45c0.4 0 .7 .9 .7 2 0 1.1-.7 2-1.5 2-.8 0-1.5-.6-1.5-1.2 0-.7 .3-1.6 .7-2.1 .5-.4 1.1-.7 1.6-.7ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM54.9 51.4c0.7 .6 1 1.7 .7 2.4-.3 .6-1.5 1.2-2.6 1.2-1.3 0-2-.7-2-2 0-1.1 .6-2.2 1.3-2.4 .6-.2 1.8 .1 2.6 .8ZM62.7 97.3l-.4-5.8 .1 6 .1 6 3.8 .3c2.8 .1 4.3-.4 6.5-2.4l2.7-2.6-3 2.1c-1.6 1.2-4.5 2.2-6.2 2.1l-3.3 0-.3-5.7Z" style="fill:rgb(0,153,0);"/>
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 .9 1.4 4.3 .9 2.3-.4 5.1-.4 6.2 .1 1.6 .5 .9 1-3.5 2.2-3 .8-8.2 2.9-11.4 4.6-3.3 1.8-7.9 5.5-10.4 8.2-2.5 2.8-6 8.2-7.8 12-1.9 3.9-4.1 10.2-4.9 14-.8 3.9-1.5 10.2-1.5 14 0 3.9 .7 9.9 1.4 13.5 .8 3.6 2.5 9 3.8 12 1.4 3 4.3 7.8 6.5 10.5 2.1 2.8 6.4 6.6 9.4 8.7 3 2 9 4.8 13.4 6.3 6.7 2.3 9.8 2.8 18.5 2.8 5.8 .1 12.5-.5 15-1.2 2.5-.7 7.7-2.7 11.5-4.3 3.9-1.7 9.3-4.7 12.2-6.7l5.2-3.6 .1-19.7 0-19.8-22 0-22 0 0 6.5 0 6.5 15 0 15 0 0 9.8 0 9.7-3.3 2.1c-1.7 1.1-6.1 3.2-9.7 4.6-3.6 1.5-9.4 2.9-13 3.3-4 .4-8.8 .2-12.5-.5-3.3-.7-8.1-2.3-10.7-3.6-2.7-1.3-6.5-4.1-8.6-6.1-2-2.1-4.7-5.9-6-8.5-1.2-2.7-2.6-6.7-3.2-9-.5-2.4-1-8.6-1-13.8 0-5.2 .6-11.7 1.4-14.5 .7-2.7 2.2-6.8 3.3-9 1.1-2.2 3.3-5.5 4.9-7.4 1.6-1.9 4.7-4.5 6.9-5.9 2.2-1.4 6-3.1 8.5-3.8 2.5-.8 8-1.4 12.3-1.4 5.6 0 9.3 .6 13.5 2.2 3.1 1.2 7 3.4 8.6 4.8 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4 0 3-.6 5.7-1.4l5-1.3-.2-2.9c-.2-1.6-1.6-5.7-3.3-9.1-2-4.3-4.5-7.5-7.7-10.1-2.7-2.1-7.3-4.7-10.3-5.9-3-1.2-7.2-2.4-9.2-2.7-2.1-.3-3.8-.9-3.8-1.3 0-.5-2.1-2-4.7-3.5-2.6-1.4-7-3.5-9.8-4.6-2.7-1-6.5-2.2-8.2-2.6ZM80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM81.8 45.3c0.9 .1 1.7 .9 1.7 1.7 0 .8-.8 1.6-1.7 1.7-1.2 .2-1.8-.4-1.8-1.7 0-1.3 .6-1.9 1.8-1.7ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM53 49.9c0.3 0 1.1 .7 1.8 1.6 .8 1 .9 2 .2 3-.5 .8-1.7 1.3-2.5 1-.8-.3-1.5-1.3-1.5-2.2 0-1 .3-2.1 .7-2.6 .5-.4 1-.8 1.3-.8Z" style="fill:rgb(0,102,0);"/>
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 .9 1.4 4.3 .9 2.3-.4 5.1-.4 6.2 .1 1.6 .5 .9 1-3.5 2.2-3 .8-8.2 2.9-11.4 4.6-3.3 1.8-7.9 5.5-10.4 8.2-2.5 2.8-6 8.2-7.8 12-1.9 3.9-4.1 10.2-4.9 14-.8 3.9-1.5 10.2-1.5 14 0 3.9 .7 9.9 1.4 13.5 .8 3.6 2.5 9 3.8 12 1.4 3 4.3 7.8 6.5 10.5 2.1 2.8 6.4 6.6 9.4 8.7 3 2 9 4.8 13.4 6.3 6.7 2.3 9.8 2.8 18.5 2.8 5.8 .1 12.5-.5 15-1.2 2.5-.7 7.7-2.7 11.5-4.3 3.9-1.7 9.3-4.7 12.2-6.7l5.2-3.6 .1-19.7 0-19.8-22 0-22 0 0 6.5 0 6.5 15 0 15 0 0 9.8 0 9.7-3.3 2.1c-1.7 1.1-6.1 3.2-9.7 4.6-3.6 1.5-9.4 2.9-13 3.3-4 .4-8.8 .2-12.5-.5-3.3-.7-8.1-2.3-10.7-3.6-2.7-1.3-6.5-4.1-8.6-6.1-2-2.1-4.7-5.9-6-8.5-1.2-2.7-2.6-6.7-3.2-9-.5-2.4-1-8.6-1-13.8 0-5.2 .6-11.7 1.4-14.5 .7-2.7 2.2-6.8 3.3-9 1.1-2.2 3.3-5.5 4.9-7.4 1.6-1.9 4.7-4.5 6.9-5.9 2.2-1.4 6-3.1 8.5-3.8 2.5-.8 8-1.4 12.3-1.4 5.6 0 9.3 .6 13.5 2.2 3.1 1.2 7 3.4 8.6 4.8 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4 0 3-.6 5.7-1.4l5-1.3-.2-2.9c-.2-1.6-1.6-5.7-3.3-9.1-2-4.3-4.5-7.5-7.7-10.1-2.7-2.1-7.3-4.7-10.3-5.9-3-1.2-7.2-2.4-9.2-2.7-2.1-.3-3.8-.9-3.8-1.3 0-.5-2.1-2-4.7-3.5-2.6-1.4-7-3.5-9.8-4.6-2.7-1-6.5-2.2-8.2-2.6ZM80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM82 45c1.3 0 2 .7 2 2 0 1.1-.7 2.2-1.5 2.5-.8 .3-1.9-.2-2.5-1-.5-.8-.8-1.9-.5-2.5 .3-.5 1.4-1 2.5-1ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM53.5 50.2c1.2 .2 2.1 1.2 2.3 2.6 .1 1.2-.5 2.5-1.3 3-1 .4-2.2 .1-3.1-.8-.9-1-1.2-2.2-.7-3.3 .5-1.1 1.6-1.7 2.8-1.5Z" style="fill:rgb(0,51,0);"/>
<path d="M0 0" style="fill:rgb(0,0,0);"/>
</g>
<g id="b" style="mix-blend-mode:screen;">
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 .9 1.4 4.3 .9 2.3-.4 5.1-.4 6.2 .1 1.6 .5 .9 1-3.5 2.2-3 .8-8.2 2.9-11.4 4.6-3.3 1.8-7.9 5.5-10.4 8.2-2.5 2.8-6 8.2-7.8 12-1.9 3.9-4.1 10.2-4.9 14-.8 3.9-1.5 10.2-1.5 14 0 3.9 .7 9.9 1.4 13.5 .8 3.6 2.5 9 3.8 12 1.4 3 4.3 7.8 6.5 10.5 2.1 2.8 6.4 6.6 9.4 8.7 3 2 9 4.8 13.4 6.3 6.7 2.3 9.8 2.8 18.5 2.8 5.8 .1 12.5-.5 15-1.2 2.5-.7 7.7-2.7 11.5-4.3 3.9-1.7 9.3-4.7 12.2-6.7l5.2-3.6 .1-19.7 0-19.8-22 0-22 0 0 6.5 0 6.5 15 0 15 0 0 9.8 0 9.7-3.3 2.1c-1.7 1.1-6.1 3.2-9.7 4.6-3.6 1.5-9.4 2.9-13 3.3-4 .4-8.8 .2-12.5-.5-3.3-.7-8.1-2.3-10.7-3.6-2.7-1.3-6.5-4.1-8.6-6.1-2-2.1-4.7-5.9-6-8.5-1.2-2.7-2.6-6.7-3.2-9-.5-2.4-1-8.6-1-13.8 0-5.2 .6-11.7 1.4-14.5 .7-2.7 2.2-6.8 3.3-9 1.1-2.2 3.3-5.5 4.9-7.4 1.6-1.9 4.7-4.5 6.9-5.9 2.2-1.4 6-3.1 8.5-3.8 2.5-.8 8-1.4 12.3-1.4 5.6 0 9.3 .6 13.5 2.2 3.1 1.2 7 3.4 8.6 4.8 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4 0 3-.6 5.7-1.4l5-1.3-.2-2.9c-.2-1.6-1.6-5.7-3.3-9.1-2-4.3-4.5-7.5-7.7-10.1-2.7-2.1-7.3-4.7-10.3-5.9-3-1.2-7.2-2.4-9.2-2.7-2.1-.3-3.8-.9-3.8-1.3 0-.5-2.1-2-4.7-3.5-2.6-1.4-7-3.5-9.8-4.6-2.7-1-6.5-2.2-8.2-2.6ZM80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM88 85.3c-1.4-.2-5 .6-8 1.8-3 1.1-5.9 2-6.5 2-.5 0-2.6-.3-4.5-.7-2.3-.3-4.2 0-5.5 .9-1.8 1.3-2.5 1.2-6.5-.4-2.5-1-5.3-1.8-6.2-1.8-1.6-.1-1.8 1-1.8 9.2l0 9.2 3.2-.9c1.8-.6 6.7-1 10.9-1 5.8-.1 8.1-.5 9.5-1.8 1.1-1 2.8-1.8 3.9-1.8 1.1 0 4.3 .8 7.2 1.8 2.9 .9 5.4 1.5 5.7 1.2 .2-.3 .5-4.3 .7-9l0.4-8.5-2.5-.2Z" style="fill:rgb(0,0,255);"/>
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 .9 1.4 4.3 .9 2.3-.4 5.1-.4 6.2 .1 1.6 .5 .9 1-3.5 2.2-3 .8-8.2 2.9-11.4 4.6-3.3 1.8-7.9 5.5-10.4 8.2-2.5 2.8-6 8.2-7.8 12-1.9 3.9-4.1 10.2-4.9 14-.8 3.9-1.5 10.2-1.5 14 0 3.9 .7 9.9 1.4 13.5 .8 3.6 2.5 9 3.8 12 1.4 3 4.3 7.8 6.5 10.5 2.1 2.8 6.4 6.6 9.4 8.7 3 2 9 4.8 13.4 6.3 6.7 2.3 9.8 2.8 18.5 2.8 5.8 .1 12.5-.5 15-1.2 2.5-.7 7.7-2.7 11.5-4.3 3.9-1.7 9.3-4.7 12.2-6.7l5.2-3.6 .1-19.7 0-19.8-22 0-22 0 0 6.5 0 6.5 15 0 15 0 0 9.8 0 9.7-3.3 2.1c-1.7 1.1-6.1 3.2-9.7 4.6-3.6 1.5-9.4 2.9-13 3.3-4 .4-8.8 .2-12.5-.5-3.3-.7-8.1-2.3-10.7-3.6-2.7-1.3-6.5-4.1-8.6-6.1-2-2.1-4.7-5.9-6-8.5-1.2-2.7-2.6-6.7-3.2-9-.5-2.4-1-8.6-1-13.8 0-5.2 .6-11.7 1.4-14.5 .7-2.7 2.2-6.8 3.3-9 1.1-2.2 3.3-5.5 4.9-7.4 1.6-1.9 4.7-4.5 6.9-5.9 2.2-1.4 6-3.1 8.5-3.8 2.5-.8 8-1.4 12.3-1.4 5.6 0 9.3 .6 13.5 2.2 3.1 1.2 7 3.4 8.6 4.8 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4 0 3-.6 5.7-1.4l5-1.3-.2-2.9c-.2-1.6-1.6-5.7-3.3-9.1-2-4.3-4.5-7.5-7.7-10.1-2.7-2.1-7.3-4.7-10.3-5.9-3-1.2-7.2-2.4-9.2-2.7-2.1-.3-3.8-.9-3.8-1.3 0-.5-2.1-2-4.7-3.5-2.6-1.4-7-3.5-9.8-4.6-2.7-1-6.5-2.2-8.2-2.6ZM80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM82.3 45.5c0.4 .3 .7 1.2 .7 2 0 .8-.7 1.5-1.5 1.5-.8 0-1.5-.6-1.5-1.2 0-.7 .3-1.6 .7-2 .5-.4 1.1-.5 1.6-.3ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM52.8 51c0.9 0 2 .3 2.4 .7 .4 .5 .5 1.4 .2 2.1-.2 .6-1.3 1.2-2.4 1.2-1.3 0-2-.7-2-2 0-1.2 .7-2 1.8-2ZM88 85.3c-1.4-.2-5 .6-8 1.8-3 1.1-5.9 2-6.5 2-.5 0-2.6-.3-4.5-.7-2.3-.3-4.2 0-5.5 .9-1.8 1.3-2.5 1.2-6.5-.4-2.5-1-5.3-1.8-6.2-1.8-1.6-.1-1.8 1-1.8 9.2l0 9.2 3.2-.9c1.8-.6 6.7-1 10.9-1 5.8-.1 8.1-.5 9.5-1.8 1.1-1 2.8-1.8 3.9-1.8 1.1 0 4.3 .8 7.2 1.8 2.9 .9 5.4 1.5 5.7 1.2 .2-.3 .5-4.3 .7-9l0.4-8.5-2.5-.2Z" style="fill:rgb(0,0,204);"/>
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 .9 1.4 4.3 .9 2.3-.4 5.1-.4 6.2 .1 1.6 .5 .9 1-3.5 2.2-3 .8-8.2 2.9-11.4 4.6-3.3 1.8-7.9 5.5-10.4 8.2-2.5 2.8-6 8.2-7.8 12-1.9 3.9-4.1 10.2-4.9 14-.8 3.9-1.5 10.2-1.5 14 0 3.9 .7 9.9 1.4 13.5 .8 3.6 2.5 9 3.8 12 1.4 3 4.3 7.8 6.5 10.5 2.1 2.8 6.4 6.6 9.4 8.7 3 2 9 4.8 13.4 6.3 6.7 2.3 9.8 2.8 18.5 2.8 5.8 .1 12.5-.5 15-1.2 2.5-.7 7.7-2.7 11.5-4.3 3.9-1.7 9.3-4.7 12.2-6.7l5.2-3.6 .1-19.7 0-19.8-22 0-22 0 0 6.5 0 6.5 15 0 15 0 0 9.8 0 9.7-3.3 2.1c-1.7 1.1-6.1 3.2-9.7 4.6-3.6 1.5-9.4 2.9-13 3.3-4 .4-8.8 .2-12.5-.5-3.3-.7-8.1-2.3-10.7-3.6-2.7-1.3-6.5-4.1-8.6-6.1-2-2.1-4.7-5.9-6-8.5-1.2-2.7-2.6-6.7-3.2-9-.5-2.4-1-8.6-1-13.8 0-5.2 .6-11.7 1.4-14.5 .7-2.7 2.2-6.8 3.3-9 1.1-2.2 3.3-5.5 4.9-7.4 1.6-1.9 4.7-4.5 6.9-5.9 2.2-1.4 6-3.1 8.5-3.8 2.5-.8 8-1.4 12.3-1.4 5.6 0 9.3 .6 13.5 2.2 3.1 1.2 7 3.4 8.6 4.8 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4 0 3-.6 5.7-1.4l5-1.3-.2-2.9c-.2-1.6-1.6-5.7-3.3-9.1-2-4.3-4.5-7.5-7.7-10.1-2.7-2.1-7.3-4.7-10.3-5.9-3-1.2-7.2-2.4-9.2-2.7-2.1-.3-3.8-.9-3.8-1.3 0-.5-2.1-2-4.7-3.5-2.6-1.4-7-3.5-9.8-4.6-2.7-1-6.5-2.2-8.2-2.6ZM80.5 43.5c-1.9-.4-3.8 0-5.2 .9-1.3 .9-2.7 2.7-3.3 4.1-.7 1.7-.7 3.4 .1 5.3 .6 1.5 1.8 3.2 2.7 3.9 1 .7 2.9 1.3 4.5 1.3 1.6 0 3.7-1 5.2-2.5 1.4-1.4 2.5-3.7 2.5-5.2 .1-1.6-.7-3.8-1.7-5-1-1.3-3.1-2.5-4.8-2.8ZM81.8 45.3c0.9 .1 1.7 .9 1.7 1.7 0 .8-.8 1.6-1.7 1.7-1.2 .2-1.8-.4-1.8-1.7 0-1.3 .6-1.9 1.8-1.7ZM51.5 47.8c-1.1-.2-3-.2-4.2-.1-1.3 .2-3.4 1.7-4.8 3.3-1.4 1.7-2.5 4.3-2.5 6 0 1.7 1.1 4.3 2.5 6 2 2.4 3.3 3 6.5 3 2.8 0 4.8-.7 6.8-2.4 2.1-1.9 2.7-3.3 2.7-6.4 0-3-.7-4.7-2.5-6.6-1.4-1.4-3.4-2.7-4.5-2.8ZM53 49.9c0.3 0 1.1 .7 1.8 1.6 .8 1 .9 2 .2 3-.5 .8-1.7 1.3-2.5 1-.8-.3-1.5-1.3-1.5-2.2 0-1 .3-2.1 .7-2.6 .5-.4 1-.8 1.3-.8ZM88 85.3c-1.4-.2-5 .6-8 1.8-3 1.1-5.9 2-6.5 2-.5 0-2.6-.3-4.5-.7-2.3-.3-4.2 0-5.5 .9-1.8 1.3-2.5 1.2-6.5-.4-2.5-1-5.3-1.8-6.2-1.8-1.6-.1-1.8 1-1.8 9.2l0 9.2 3.2-.9c1.8-.6 6.7-1 10.9-1 5.8-.1 8.1-.5 9.5-1.8 1.1-1 2.8-1.8 3.9-1.8 1.1 0 4.3 .8 7.2 1.8 2.9 .9 5.4 1.5 5.7 1.2 .2-.3 .5-4.3 .7-9l0.4-8.5-2.5-.2Z" style="fill:rgb(0,0,153);"/>
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 .9 1.4 4.3 .9 2.3-.4 5.1-.4 6.2 .1 1.6 .5 .9 1-3.5 2.2-3 .8-8.2 2.9-11.4 4.6-3.3 1.8-7.9 5.5-10.4 8.2-2.5 2.8-6 8.2-7.8 12-1.9 3.9-4.1 10.2-4.9 14-.8 3.9-1.5 10.2-1.5 14 0 3.9 .7 9.9 1.4 13.5 .8 3.6 2.5 9 3.8 12 1.4 3 4.3 7.8 6.5 10.5 2.1 2.8 6.4 6.6 9.4 8.7 3 2 9 4.8 13.4 6.3 6.7 2.3 9.8 2.8 18.5 2.8 5.8 .1 12.5-.5 15-1.2 2.5-.7 7.7-2.7 11.5-4.3 3.9-1.7 9.3-4.7 12.2-6.7l5.2-3.6 .1-19.7 0-19.8-22 0-22 0 0 6.5 0 6.5 15 0 15 0 0 9.8 0 9.7-3.3 2.1c-1.7 1.1-6.1 3.2-9.7 4.6-3.6 1.5-9.4 2.9-13 3.3-4 .4-8.8 .2-12.5-.5-3.3-.7-8.1-2.3-10.7-3.6-2.7-1.3-6.5-4.1-8.6-6.1-2-2.1-4.7-5.9-6-8.5-1.2-2.7-2.6-6.7-3.2-9-.5-2.4-1-8.6-1-13.8 0-5.2 .6-11.7 1.4-14.5 .7-2.7 2.2-6.8 3.3-9 1.1-2.2 3.3-5.5 4.9-7.4 1.6-1.9 4.7-4.5 6.9-5.9 2.2-1.4 6-3.1 8.5-3.8 2.5-.8 8-1.4 12.3-1.4 5.6 0 9.3 .6 13.5 2.2 3.1 1.2 7 3.4 8.6 4.8 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4 0 3-.6 5.7-1.4l5-1.3-.2-2.9c-.2-1.6-1.6-5.7-3.3-9.1-2-4.3-4.5-7.5-7.7-10.1-2.7-2.1-7.3-4.7-10.3-5.9-3-1.2-7.2-2.4-9.2-2.7-2.1-.3-3.8-.9-3.8-1.3 0-.5-2.1-2-4.7-3.5-2.6-1.4-7-3.5-9.8-4.6-2.7-1-6.5-2.2-8.2-2.6ZM88 85.3c-1.4-.2-5 .6-8 1.8-3 1.1-5.9 2-6.5 2-.5 0-2.6-.3-4.5-.7-2.3-.3-4.2 0-5.5 .9-1.8 1.3-2.5 1.2-6.5-.4-2.5-1-5.3-1.8-6.2-1.8-1.6-.1-1.8 1-1.8 9.2l0 9.2 3.2-.9c1.8-.6 6.7-1 10.9-1 5.8-.1 8.1-.5 9.5-1.8 1.1-1 2.8-1.8 3.9-1.8 1.1 0 4.3 .8 7.2 1.8 2.9 .9 5.4 1.5 5.7 1.2 .2-.3 .5-4.3 .7-9l0.4-8.5-2.5-.2Z" style="fill:rgb(0,0,51);"/>
<path d="M51.3 4.6c-1.9-.3-3.5-.2-3.8 .4l-.5 1 .5 1c0.3 .6-.6 2.1-2 3.5-1.4 1.4-2.5 3.2-2.5 4 0 1.2 .9 1.4 4.3 .9 2.3-.4 5.1-.4 6.2 .1 1.6 .5 .9 1-3.5 2.2-3 .8-8.2 2.9-11.4 4.6-3.3 1.8-7.9 5.5-10.4 8.2-2.5 2.8-6 8.2-7.8 12-1.9 3.9-4.1 10.2-4.9 14-.8 3.9-1.5 10.2-1.5 14 0 3.9 .7 9.9 1.4 13.5 .8 3.6 2.5 9 3.8 12 1.4 3 4.3 7.8 6.5 10.5 2.1 2.8 6.4 6.6 9.4 8.7 3 2 9 4.8 13.4 6.3 6.7 2.3 9.8 2.8 18.5 2.8 5.8 .1 12.5-.5 15-1.2 2.5-.7 7.7-2.7 11.5-4.3 3.9-1.7 9.3-4.7 12.2-6.7l5.2-3.6 .1-19.7 0-19.8-22 0-22 0 0 6.5 0 6.5 15 0 15 0 0 9.8 0 9.7-3.3 2.1c-1.7 1.1-6.1 3.2-9.7 4.6-3.6 1.5-9.4 2.9-13 3.3-4 .4-8.8 .2-12.5-.5-3.3-.7-8.1-2.3-10.7-3.6-2.7-1.3-6.5-4.1-8.6-6.1-2-2.1-4.7-5.9-6-8.5-1.2-2.7-2.6-6.7-3.2-9-.5-2.4-1-8.6-1-13.8 0-5.2 .6-11.7 1.4-14.5 .7-2.7 2.2-6.8 3.3-9 1.1-2.2 3.3-5.5 4.9-7.4 1.6-1.9 4.7-4.5 6.9-5.9 2.2-1.4 6-3.1 8.5-3.8 2.5-.8 8-1.4 12.3-1.4 5.6 0 9.3 .6 13.5 2.2 3.1 1.2 7 3.4 8.6 4.8 1.5 1.4 4.1 5.3 5.7 8.8 1.6 3.4 3.2 6.2 3.7 6.2 .4 0 3-.6 5.7-1.4l5-1.3-.2-2.9c-.2-1.6-1.6-5.7-3.3-9.1-2-4.3-4.5-7.5-7.7-10.1-2.7-2.1-7.3-4.7-10.3-5.9-3-1.2-7.2-2.4-9.2-2.7-2.1-.3-3.8-.9-3.8-1.3 0-.5-2.1-2-4.7-3.5-2.6-1.4-7-3.5-9.8-4.6-2.7-1-6.5-2.2-8.2-2.6Z" style="fill:rgb(0,0,0);"/>
</g>
</g>
</defs>
<use xlink:href="#rgb"/>
</svg>
`;
