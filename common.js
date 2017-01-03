'use strict';

chrome.storage.local.get('version', prefs => {
  let version = chrome.runtime.getManifest().version;
  let firefox = navigator.userAgent.indexOf('Firefox') !== -1;
  if (firefox ? !prefs.version : (prefs.version !== version)) {
    window.setTimeout(() => {
      chrome.storage.local.set({version}, () => {
        chrome.tabs.create({
          url: 'http://add0n.com/ovfinder.html?version=' + version +
            '&type=' + (prefs.version ? ('upgrade&p=' + prefs.version) : 'install')
        });
      });
    }, 3000);
  }
});
