/* global $ */
'use strict';

const SERVER = 'https://www.vpngate.net/api/iphone/';

const elements = {
  loader: document.querySelector('#loader'),
  permission: document.querySelector('#permission'),
  hostname: document.querySelector('#hostname'),
  yes: document.querySelector('#yes'),
  no: document.querySelector('#no'),
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
  return (size / Math.pow(1024, i)).toFixed(1) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

// eslint-disable-next-line new-cap
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

const start = async href => {
  const response = await fetch(href);
  if (response.ok === false) {
    throw Error('INVALID_RESPONSE');
  }

  const reader = response.body.getReader();

  const chunks = [];
  let size = 0;
  for (;;) {
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

  // cache response for 5 minutes
  if (content.length > 3000 && response.headers.has('sw-fetched-on') === false) {
    try {
      caches.open('storage').then(cache => {
        cache.put(href, new Response([content], {
          headers: {
            'sw-fetched-on': Date.now()
          }
        }));
      }).catch(e => console.warn('cannot save response', e));
    }
    catch (e) {}
  }

  elements.loader.remove();
  const [comment, headers, ...body] = content.split(/\n/);
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
};

chrome.storage.local.get({
  'current-server': '',
  'mirrors': [ // PHPProxy Mirrors
    'https://helloapp.site/proxy/index.php?_proxurl=[href]',
    'https://m.amv.org.mx/index.php?q=[href]',
    'http://proxy.tfdracing.nl/index.php?q=[href]',
    'http://www.nakabel.com/index.php?_proxurl=[href]'
  ]
}, async prefs => {
  try {
    const v = encodeURIComponent(btoa(SERVER));
    prefs['mirrors'] = prefs['mirrors'].map(s => s.replace('[href]', v));

    const servers = [prefs['current-server'], SERVER, ...prefs.mirrors].filter((s, n, l) => s && l.indexOf(s) === n);
    for (const server of servers) {
      // make sure we have access to this server
      await new Promise((resolve, reject) => chrome.permissions.contains({
        origins: [server]
      }, granted => {
        if (granted) {
          resolve();
        }
        else {
          const {hostname} = new URL(server);
          elements.hostname.textContent = hostname;
          elements.yes.onclick = () => chrome.permissions.request({
            origins: [server]
          }, granted => granted ? resolve() : reject(Error('USER_ABORT')));
          elements.no.onclick = () => reject(Error('USER_ABORT'));

          elements.permission.classList.remove('hidden');
        }
      })).then(() => elements.permission.classList.add('hidden'));
      try {
        await start(server);
        return chrome.storage.local.set({
          'current-server': server
        });
      }
      catch (e) {}
    }
    throw Error('NO_MORE_SERVERS');
  }
  catch (e) {
    console.warn(e);
    elements.loader.dataset.error = true;
    elements.permission.classList.add('hidden');
    elements.loader.textContent = 'Cannot access to vpngate.net (' + e.message + '). Reopen this popup to restart.';
  }
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
