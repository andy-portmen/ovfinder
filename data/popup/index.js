/* globals $ */
'use strict';

var elements = {
  loader: document.querySelector('#loader'),
  progress: document.querySelector('#loader span'),
  thead: document.querySelector('#table thead tr'),
  tbody: document.querySelector('#table tbody')
};

function humanFileSize (size) {
  size = parseInt(size);
  if (!size) {
    return size;
  }
  let i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

var table = $('#table').DataTable({
  'pageLength': 5,
  'lengthChange': false,
  'columns': [
    {orderable: false},
    {visible: false},
    null,
    null,
    null,
    null,
    {orderable: false}
  ],
  'order': [[3, 'desc']],
});

var req = new XMLHttpRequest();

req.open('GET', 'http://www.vpngate.net/api/iphone/');
//req.open('GET', chrome.runtime.getURL('data/assets/iphone.txt'));
req.onload = () => {
  elements.loader.parentNode.removeChild(elements.loader);
  let [comment, headers, ...body] = req.responseText.split(/\n/);
  body.forEach(row => {
    //[HostName, IP, Score, Ping, Speed, CountryLong, CountryShort, NumVpnSessions, Uptime, TotalUsers, TotalTraffic, LogType, Operator, Message, OpenVPN_ConfigData_Base64]
    row = row.split(',');
    if (row.length === 15) {
      let node = table.row.add([
        '',
        row[5],
        row[1],
        row[2],
        humanFileSize(row[4]),
        row[9],
        ''
      ]).node();
      node.querySelector('td').style['background-image'] = 'url(flags/' + row[6] + '.png)';
      node.querySelector('td').title = row[5];
      let input = document.createElement('input');
      input.type = 'button';
      input.value = 'download';
      input.dataset.value = row[14];
      input.dataset.cmd = 'download';
      input.dataset.filename = row[6] + '-' + row[1] + '.ovpn';
      node.querySelector('td:last-child').appendChild(input);
    }
  });
  table.draw();
};
req.onprogress = (e) => {
  elements.progress.textContent = e.loaded;
};
req.onerror = () => {
  elements.loader.dataset.error = true;
  elements.loader.textContent = 'Cannot connect to vpngate.net. Please check your network and reopen this panel.';
};
window.addEventListener('load', () => req.send());

document.addEventListener('click', e => {
  let target = e.target;
  if (target.dataset.cmd === 'download') {
    chrome.downloads.download({
      url: 'data:application/zip;base64,' + target.dataset.value,
      filename: target.dataset.filename
    });
  }
});
