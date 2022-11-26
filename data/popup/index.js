/* globals $ */
'use strict';

const elements = {
  loader: document.querySelector('#loader'),
  progress: document.querySelector('#loader span'),
  thead: document.querySelector('#table thead tr'),
  tbody: document.querySelector('#table tbody')
};

function humanFileSize(size) {
  size = parseInt(size);
  if (!size) {
    return size;
  }
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

const table = $('#table').DataTable({
  'pageLength': 7,
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
  'order': [[3, 'desc']]
});

fetch('https://www.vpngate.net/api/iphone/').then(async response => {
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    size += value.length;
    elements.progress.textContent = humanFileSize(size);
  }
  const buffer = new Uint8Array(size);
  let position = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, position);
    position += chunk.length;
  }

  const content = await (new TextDecoder('utf-8')).decode(buffer);

  return {
    content,
    headers: response.headers
  };
}).then(response => {
  // cache response for 5 minutes
  if (response.content.length > 3000 && response.headers.has('sw-fetched-on') === false) {
    try {
      caches.open('storage').then(cache => {
        cache.put('https://www.vpngate.net/api/iphone/', new Response([response.content], {
          headers: {
            'sw-fetched-on': Date.now()
          }
        }));
      }).catch(e => console.warn('cannot save response', e));
    }
    catch (e) {}
  }

  elements.loader.parentNode.removeChild(elements.loader);
  const [comment, headers, ...body] = response.content.split(/\n/);
  body.forEach(row => {
    // [HostName, IP, Score, Ping, Speed, CountryLong, CountryShort, NumVpnSessions,
    //  Uptime, TotalUsers, TotalTraffic, LogType, Operator, Message, OpenVPN_ConfigData_Base64]
    row = row.split(',');
    if (row.length === 15) {
      const node = table.row.add([
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
      const input = document.createElement('input');
      input.type = 'button';
      input.value = 'download';
      input.dataset.value = row[14];
      input.dataset.cmd = 'download';
      input.dataset.filename = row[6] + '-' + row[1] + '.ovpn';
      node.querySelector('td:last-child').appendChild(input);
    }
  });
  table.draw();
}).catch(e => {
  console.warn(e);
  elements.loader.dataset.error = true;
  elements.loader.textContent = 'Cannot connect to vpngate.net. Please check your network and reopen this panel.';
});

document.addEventListener('click', e => {
  const target = e.target;
  if (target.dataset.cmd === 'download') {
    const a = document.createElement('a');
    a.href = 'data:application/x-openvpn-profile;base64,' + target.dataset.value;
    a.download = target.dataset.filename;
    a.click();
  }
});

// what is my ip
{
  const input = document.createElement('input');
  input.type = 'button';
  input.value = 'Find my IP';
  input.onclick = () => chrome.tabs.create({
    url: 'https://webbrowsertools.com/ip-address/'
  });
  document.getElementById('table_filter').appendChild(input);
}

// service worker
try {
  navigator.serviceWorker.register('sw.js').catch(e => console.warn('service worker error', e));
}
catch (e) {}
