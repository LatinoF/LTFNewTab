// Icone Fluent - cambia "filled" con "regular" o altri stili qui
const ICONS = {
  settings: 'fluent:settings-24-filled',
  edit: 'fluent:edit-24-filled',
  editOff: 'fluent:edit-off-24-filled',
  close: 'fluent:dismiss-24-filled',
  checkmark: 'fluent:checkmark-24-filled',
  arrowUpload: 'fluent:arrow-upload-24-filled',
  arrowDownload: 'fluent:arrow-download-24-filled',
  reset: 'fluent:arrow-reset-24-filled',
  weather: 'fluent:weather-sunny-low-24-filled',
  search: 'fluent:search-24-filled',
  grid: 'fluent:grid-24-filled',
  chart: 'material-symbols:area-chart-rounded',
  textField: 'solar:text-field-focus-bold',
  add: 'material-symbols:add-rounded'
};

const SVG_SUN = '<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 0L16.8 7.20001L7.20001 7.20001L7.20001 16.8L0 24L7.20001 31.2L7.20001 40.8L16.8 40.8L24 48L31.2 40.8L40.8 40.8L40.8 31.2L48 24L40.8 16.8L40.8 7.20001L31.2 7.20001L24 0L24 0ZM24 12C30.6264 12 36 17.3736 36 24C36 30.6264 30.6264 36 24 36C17.3736 36 12 30.6264 12 24C12 17.3736 17.3736 12 24 12L24 12Z" fill="currentColor" fill-rule="evenodd" stroke="none" /></svg>';

const SVG_MOON = '<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><g transform="translate(48, 0) scale(-1, 1)"><path d="M15.4359 0.00149536C15.1925 0.0109253 14.9534 0.0686646 14.7324 0.171356C6.1678 4.16995 0 12.8208 0 22.8958C0 36.7399 11.2587 47.9985 25.1028 47.9985C35.1777 47.9985 43.8286 41.8307 47.8272 33.2661C48.1619 32.5497 48.0008 31.6994 47.4271 31.155C46.8535 30.6107 45.996 30.4943 45.298 30.8661C42.3824 32.4196 39.0707 33.2972 35.5282 33.2972C24.0001 33.2972 14.7013 23.9984 14.7013 12.4703C14.7013 8.92783 15.5789 5.61612 17.1324 2.70056C17.4414 2.11929 17.4159 1.41718 17.0656 0.859833C16.7153 0.30249 16.0937 -0.0249023 15.4359 0.00149536L15.4359 0.00149536Z" fill="currentColor" stroke="none" /></g></svg>';

const DEFAULT_SETTINGS = {
  lightTileBg: '',
  lightTileText: '#ffffff',
  darkTileBg: '',
  darkTileText: '#ffffff',
  showWeather: true,
  showSearchbar: true,
  showDrawers: true,
  showCrypto: true,
  focusSearchbar: false,
  weatherCity: 'Torrevecchia Teatina',
  weatherLat: 42.38,
  weatherLon: 14.14,
  bgUrl: '',
  elementColor: '#5e5e5e',
  customBackgrounds: []
};

const BACKGROUNDS = [
  'GoldenGate_Light.jpg',
  'GoldenGate_Color.png'
];

const DEFAULT_SITES = [
  { id: 'd1',  name: 'Google',          url: 'https://www.google.it/',                        tile: 'Resources/Tiles/Google.jpg' },
  { id: 'd2',  name: 'YouTube',         url: 'https://www.youtube.com/feed/subscriptions',     tile: 'Resources/Tiles/Youtube.jpg' },
  { id: 'd3',  name: 'Facebook',        url: 'https://www.facebook.com/?sk=h_chr',             tile: 'Resources/Tiles/Facebook.png' },
  { id: 'd4',  name: 'Twitch',          url: 'https://www.twitch.tv/directory/following/channels', tile: 'Resources/Tiles/Twitch.jpg' },
  { id: 'd5',  name: 'Prime Video',     url: 'https://www.primevideo.com/',                    tile: 'Resources/Tiles/PrimeVideo.jpg' },
  { id: 'd6',  name: 'Amazon',          url: 'https://www.amazon.it/',                         tile: 'Resources/Tiles/Amazon.jpg' },
  { id: 'd7',  name: 'Jellyfin',        url: 'https://jellyfin.latinof.com',                   tile: 'Resources/Tiles/Jellyfin.svg' },
  { id: 'd8',  name: 'Stremio',         url: 'https://web.stremio.com/#/',                     tile: 'Resources/Tiles/Stremio.svg' },
  { id: 'd9',  name: 'ICV',             url: 'https://www.icv-crew.com/forum/index.php',       tile: 'Resources/Tiles/ICV.jpg' },
  { id: 'd10', name: 'DeviantArt',      url: 'https://www.deviantart.com/',                    tile: 'Resources/Tiles/DeviantArt.png' },
  { id: 'd11', name: 'Reddit',          url: 'https://new.reddit.com/new/',                    tile: 'Resources/Tiles/Reddit.jpg' },
  { id: 'd12', name: 'Aliexpress',      url: 'https://best.aliexpress.com/?lan=en',            tile: 'Resources/Tiles/Aliexpress.jpg' },
  { id: 'd13', name: 'Unidav',          url: 'https://www.unidav.it/',                         tile: 'Resources/Tiles/Unidav.jpg' },
  { id: 'd14', name: 'DidatticaUnidav', url: 'https://www.didatticaunidav.it/',                tile: 'Resources/Tiles/DidatticaUnidav.jpg' },
  { id: 'd15', name: 'EsamiUnidav',     url: 'https://www.esamiunidav.com/',                   tile: 'Resources/Tiles/EsamiUnidav.jpg' },
  { id: 'd16', name: 'FlexTax',         url: 'https://flexsuite.it/',                          tile: 'Resources/Tiles/FlexTax.jpg' },
  { id: 'd17', name: 'WhatsApp',        url: 'https://web.whatsapp.com/',                      tile: 'Resources/Tiles/WhatsApp.jpg' },
  { id: 'd18', name: 'Telegram',        url: 'https://web.telegram.org/z/#777000',             tile: 'Resources/Tiles/Telegram.jpg' },
  { id: 'd19', name: 'Ente Auth',       url: 'https://auth.ente.io/auth',                      tile: 'Resources/Tiles/EnteAuth.jpg' },
  { id: 'd20', name: 'TGx',             url: 'https://torrentgalaxy.one/#results',             tile: 'Resources/Tiles/TGx.jpg' },
  { id: 'd21', name: 'Outlook',         url: 'https://outlook.live.com/mail/0/inbox',          tile: 'Resources/Tiles/Outlook.jpg' },
  { id: 'd22', name: 'OneDrive',        url: 'https://onedrive.live.com/',                     tile: 'Resources/Tiles/OneDrive.jpg' },
  { id: 'd23', name: 'ISP',             url: 'https://www.intesasanpaolo.com/it/persone-e-famiglie/login-page.html', tile: 'Resources/Tiles/ISP.jpg' },
  { id: 'd24', name: 'Instagram',       url: 'https://www.instagram.com/',                     tile: 'Resources/Tiles/Instagram.jpg' }
];
