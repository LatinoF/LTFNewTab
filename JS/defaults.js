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
  textField: 'solar:text-field-focus-bold'
};

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
  weatherLon: 14.14
};

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
