"use strict";
chrome.storage.local.get(null, (item) => {
  const searchBtn: HTMLInputElement = <HTMLInputElement>document.getElementById('searchBtn');
  let Checked: boolean = searchBtn.checked;
  if(item['searchCheck'] === true) {
    Checked = true;
    searchBtn.checked = Checked;
  }
  return searchBtnFunc(searchBtn);
});

const searchBtnFunc = (searchBtn: HTMLInputElement): any => {
  searchBtn.addEventListener('click', () => {
    if( searchBtn.checked ) {
      return chrome.storage.local.set({ 'searchCheck' : true }, () => {console.log('changed to true')});
    }
    return chrome.storage.local.set({ 'searchCheck' : false }, () => {console.log('changed to false')});
  });

}
