const STORAGE_KEY = 'ltf_sites';
const SETTINGS_KEY = 'ltf_settings';

var _openPickerRows = [];
let isEditMode = false;
let dragCtx = null;

function getSites() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { saveSites(DEFAULT_SITES); return [...DEFAULT_SITES]; }
  try {
    return JSON.parse(raw).map(s => {
      const { section, ...r } = s;
      if (r.logoUrl === undefined) r.logoUrl = '';
      if (r.bgColor === undefined) r.bgColor = '';
      if (r.logoType === undefined) r.logoType = r.logoUrl ? 'logo' : 'tile';
      return r;
    });
  }
  catch { saveSites(DEFAULT_SITES); return [...DEFAULT_SITES]; }
}
function saveSites(sites) { localStorage.setItem(STORAGE_KEY, JSON.stringify(sites)); }

// Resolve logo URL: if it's just a filename, prepend Resources/Tiles/
function resolveLogoUrl(value) {
  if (!value) return '';
  // If it's already a full URL, return as-is
  if (/^https?:\/\//i.test(value)) return value;
  // If it already has a path prefix, return as-is
  if (value.includes('/')) return value;
  // Otherwise, assume it's a filename in Resources/Tiles/
  return 'Resources/Tiles/' + value;
}

function getSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return Object.assign({}, DEFAULT_SETTINGS);
  try {
    const s = JSON.parse(raw);
    return Object.assign({}, DEFAULT_SETTINGS, s);
  } catch { return Object.assign({}, DEFAULT_SETTINGS); }
}

function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

function applySettings() {
  const settings = getSettings();
  const isDark = document.body.classList.contains('dark-mode');
  const root = document.documentElement;

  // Default tile colors via CSS custom properties
  const bg = isDark ? settings.darkTileBg : settings.lightTileBg;
  const text = isDark ? settings.darkTileText : settings.lightTileText;
  root.style.setProperty('--default-tile-bg', bg || 'transparent');
  root.style.setProperty('--default-tile-text', text || '#ffffff');

  // Widget visibility
  const weather = document.querySelector('.weather-widget');
  const searchbar = document.querySelector('.searchbar');
  const drawers = document.getElementById('drawercontainer');
  const crypto = document.querySelector('.cryptoWidget');

  if (weather) weather.style.display = settings.showWeather ? '' : 'none';
  if (searchbar) searchbar.style.display = settings.showSearchbar ? '' : 'none';
  if (drawers) drawers.style.display = settings.showDrawers ? '' : 'none';
  if (crypto) crypto.style.display = settings.showCrypto ? '' : 'none';

  // Refresh weather data if settings changed
  if (typeof fetchWeatherData === 'function') fetchWeatherData();
}

function getTileUrl(url) {
  try { return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(new URL(url).hostname) + '&sz=64'; }
  catch { return 'Resources/Tiles/not-available.svg'; }
}

function renderDrawer() {
  const container = document.getElementById('drawercontainer');
  if (!container) return;

  container.classList.toggle('edit-mode', isEditMode);

  const isX3 = container.classList.contains('drawercontainerX3');
  const perSection = isX3 ? 18 : 12;
  const sites = getSites();
  const siteCount = sites.length;
  const filledSections = siteCount === 0 ? 0 : Math.ceil(siteCount / perSection);
  const lastFull = siteCount > 0 && siteCount % perSection === 0;

  let totalSections = filledSections || 1;
  let addInNewSection = false;

  if (isEditMode) {
    if (siteCount === 0) { totalSections = 1; addInNewSection = false; }
    else if (lastFull) { totalSections = filledSections + 1; addInNewSection = true; }
    else { totalSections = filledSections; addInNewSection = false; }
  }

  container.innerHTML = '';

  for (let i = 0; i < totalSections; i++) {
    const secSites = sites.slice(i * perSection, (i + 1) * perSection);
    const isLast = i === totalSections - 1;
    const sec = document.createElement('section');
    const grid = document.createElement('div');
    grid.className = isX3 ? 'drawergridX3' : 'drawergrid';

    if (isEditMode && isLast && addInNewSection) {
      grid.appendChild(createAddTile());
    } else {
      secSites.forEach(site => grid.appendChild(createItem(site)));
      if (isEditMode && isLast) grid.appendChild(createAddTile());
    }

    sec.appendChild(grid);
    container.appendChild(sec);
  }
}

function createItem(site) {
  const div = document.createElement('div');
  div.className = 'item';
  div.dataset.id = site.id;

  const a = document.createElement('a');
  a.href = site.url;

  const src = site.logoUrl || site.tile;

  if (site.logoType === 'emblem' && site.logoUrl) {
    div.classList.add('emblem');
    const wrap = document.createElement('span');
    wrap.className = 'emblem-wrap';
    const len = site.name.length;
    if (len <= 3) wrap.style.fontSize = '28cqh';
    else if (len <= 5) wrap.style.fontSize = '24cqh';
    else if (len <= 8) wrap.style.fontSize = '20cqh';
    else if (len <= 12) wrap.style.fontSize = '18cqh';
    else wrap.style.fontSize = '16cqh';
    const img = document.createElement('img');
    img.src = site.logoUrl;
    img.alt = site.name;
    img.className = 'emblem-logo';
    img.addEventListener('error', function handler() { this.style.display = 'none'; this.addEventListener('error', function () {}, { once: true }); }, { once: true });
    wrap.appendChild(img);
    const span = document.createElement('span');
    span.textContent = site.name;
    span.className = 'emblem-text';
    wrap.appendChild(span);
    a.appendChild(wrap);
  } else if (site.logoType === 'logo' && site.logoUrl) {
    a.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;text-decoration:none;';
    const img = document.createElement('img');
    img.src = site.logoUrl;
    img.alt = site.name;
    img.style.cssText = 'max-width:calc(100% - 24px);max-height:calc(100% - 24px);object-fit:contain;display:block;';
    if (site.bgColor) img.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))';
    img.addEventListener('error', function handler() {
      this.src = getTileUrl(site.url);
      this.style.maxWidth = ''; this.style.maxHeight = '';
      this.style.width = '100%'; this.style.height = '100%';
      this.style.objectFit = 'cover'; this.style.filter = '';
      this.addEventListener('error', function () { this.src = 'Resources/Tiles/not-available.svg'; }, { once: true });
    }, { once: true });
    a.appendChild(img);
  } else if (site.logoType === 'tile' && site.logoUrl) {
    a.style.cssText = 'display:block;width:100%;height:100%;text-decoration:none;';
    const img = document.createElement('img');
    img.src = site.logoUrl;
    img.alt = site.name;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.addEventListener('error', function handler() {
      this.src = getTileUrl(site.url);
      this.addEventListener('error', function () { this.src = 'Resources/Tiles/not-available.svg'; }, { once: true });
    }, { once: true });
    a.appendChild(img);
  } else if (site.bgColor) {
    a.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;text-decoration:none;';
    const span = document.createElement('span');
    span.textContent = site.name;
    span.style.cssText = 'font-family:Nunito,sans-serif;font-size:15px;font-weight:600;color:var(--default-tile-text,#fff);text-align:center;padding:6px;line-height:1.2;text-shadow:0 1px 4px rgba(0,0,0,0.3);overflow-wrap:break-word;word-break:break-word;max-width:100%;box-sizing:border-box;';
    a.appendChild(span);
  } else {
    const img = document.createElement('img');
    img.src = site.tile;
    img.alt = site.name;
    img.loading = 'lazy';
    img.addEventListener('error', function handler() {
      this.src = getTileUrl(site.url);
      this.addEventListener('error', function () { this.src = 'Resources/Tiles/not-available.svg'; }, { once: true });
    }, { once: true });
    a.appendChild(img);
  }

  if (site.bgColor) {
    a.style.backgroundColor = site.bgColor;
  } else {
    a.style.backgroundColor = 'var(--default-tile-bg)';
  }
  div.appendChild(a);

  if (isEditMode) {
    div.addEventListener('mousedown', onItemDown);
    div.addEventListener('click', function (e) {
      if (e.target.closest('.item-controls, .item-edit, .item-del')) return;
      e.preventDefault();
    });

    const ctrl = document.createElement('div');
    ctrl.className = 'item-controls';

    const eb = document.createElement('button');
    eb.className = 'item-edit';
    eb.title = 'Edit';
    eb.innerHTML = '<iconify-icon icon="' + ICONS.edit + '" style="pointer-events:none"></iconify-icon>';
    eb.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); showModal('edit', site); });
    ctrl.appendChild(eb);

    const db = document.createElement('button');
    db.className = 'item-del';
    db.title = 'Delete';
    db.innerHTML = '<iconify-icon icon="' + ICONS.close + '" style="pointer-events:none"></iconify-icon>';
    db.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); deleteSite(site.id); });
    ctrl.appendChild(db);

    div.appendChild(ctrl);
  }

  return div;
}

function createAddTile() {
  const div = document.createElement('div');
  div.className = 'item item-add';
  div.title = 'Add tile';

  const span = document.createElement('span');
  span.className = 'item-add-icon';
  span.textContent = '+';
  div.appendChild(span);

  div.addEventListener('click', () => showModal('add'));
  return div;
}

function deleteSite(id) {
  saveSites(getSites().filter(s => s.id !== id));
  renderDrawer();
}

function onItemDown(e) {
  if (e.button !== 0) return;
  if (e.target.closest('.item-controls, .item-edit, .item-del')) return;
  e.preventDefault();

  const item = e.currentTarget;
  const rect = item.getBoundingClientRect();
  dragCtx = {
    siteId: item.dataset.id,
    item: item,
    startX: e.clientX,
    startY: e.clientY,
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
    ghost: null,
    active: false,
    raf: null,
    dropTarget: null
  };

  document.addEventListener('mousemove', onDocMove);
  document.addEventListener('mouseup', onDocUp);
}

function onDocMove(e) {
  if (!dragCtx) return;
  const dx = e.clientX - dragCtx.startX;
  const dy = e.clientY - dragCtx.startY;

  if (!dragCtx.active && dx * dx + dy * dy > 25) {
    dragCtx.active = true;
    dragCtx.item.classList.add('dragging');

    const container = document.getElementById('drawercontainer');
    if (container) container.style.scrollSnapType = 'none';

    const ghost = dragCtx.item.cloneNode(true);
    const ghostControls = ghost.querySelector('.item-controls');
    if (ghostControls) ghostControls.remove();
    ghost.className = 'item drag-ghost';
    ghost.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;border-radius:8px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.2);transform:scale(1.05);opacity:0.6;';
    const rect = dragCtx.item.getBoundingClientRect();
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.style.left = (e.clientX - dragCtx.offsetX) + 'px';
    ghost.style.top = (e.clientY - dragCtx.offsetY) + 'px';
    document.body.appendChild(ghost);
    dragCtx.ghost = ghost;

    dragCtx.lastY = e.clientY;
    autoScroll();
  }

  if (dragCtx.active) {
    dragCtx.lastY = e.clientY;

    if (dragCtx.ghost) {
      dragCtx.ghost.style.left = (e.clientX - dragCtx.offsetX) + 'px';
      dragCtx.ghost.style.top = (e.clientY - dragCtx.offsetY) + 'px';
    }

    const container = document.getElementById('drawercontainer');
    if (!container) { hideInsertLine(); dragCtx.dropTarget = null; return; }

    container.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));

    const cr = container.getBoundingClientRect();
    if (e.clientY < cr.top || e.clientY > cr.bottom || e.clientX < cr.left || e.clientX > cr.right) {
      hideInsertLine(); dragCtx.dropTarget = null; return;
    }

    hideInsertLine();
    dragCtx.dropTarget = null;

    const all = container.querySelectorAll('.item:not(.dragging)');

    const under = document.elementFromPoint(e.clientX, e.clientY);
    const hovered = under ? under.closest('.item:not(.dragging)') : null;

    if (hovered && hovered.classList.contains('item-add')) {
      dragCtx.dropTarget = { id: 'add' };
      hideInsertLine();
    } else {
      const rows = {};
      all.forEach(item => {
        if (item.classList.contains('item-add')) return;
        const r = item.getBoundingClientRect();
        const overlap = Math.min(r.bottom, e.clientY + 60) - Math.max(r.top, e.clientY - 60);
        if (overlap <= 0) return;
        const yKey = Math.round(r.top);
        if (!rows[yKey]) rows[yKey] = [];
        rows[yKey].push({ el: item, r, overlap });
      });

      let bestKey = null, bestOverlap = 0;
      Object.keys(rows).forEach(k => {
        const maxO = rows[k].reduce((m, x) => Math.max(m, x.overlap), 0);
        if (maxO > bestOverlap) { bestOverlap = maxO; bestKey = k; }
      });

      if (bestKey) {
        const rowItems = rows[bestKey].sort((a, b) => a.r.left - b.r.left);

        if (hovered) {
          container.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
          const hr = hovered.getBoundingClientRect();
          const inRow = rowItems.some(x => x.el === hovered);
          if (!inRow) { hideInsertLine(); dragCtx.dropTarget = null; }
          else if (e.clientX - hr.left < 16) {
            const idx = rowItems.findIndex(x => x.el === hovered);
            if (idx > 0) {
              const prev = rowItems[idx - 1];
              showInsertLine((prev.r.right + hr.left) / 2, hr.top, hr.height);
            } else showInsertLine(hr.left - 8, hr.top, hr.height);
            dragCtx.dropTarget = { id: hovered.dataset.id, before: true };
          } else if (hr.right - e.clientX < 16) {
            const idx = rowItems.findIndex(x => x.el === hovered);
            if (idx < rowItems.length - 1) {
              const next = rowItems[idx + 1];
              showInsertLine((hr.right + next.r.left) / 2, hr.top, hr.height);
            } else showInsertLine(hr.right + 8, hr.top, hr.height);
            dragCtx.dropTarget = { id: hovered.dataset.id, before: false };
          } else {
            // center of tile → swap
            hideInsertLine();
            hovered.classList.add('drop-target');
            dragCtx.dropTarget = { id: hovered.dataset.id, swap: true };
          }
        } else {
          const cx = e.clientX;
          for (let i = 0; i < rowItems.length; i++) {
            const cur = rowItems[i];
            const next = i < rowItems.length - 1 ? rowItems[i + 1] : null;
            if (cx < cur.r.left) {
              showInsertLine(cur.r.left - 8, cur.r.top, cur.r.height);
              dragCtx.dropTarget = { id: cur.el.dataset.id, before: true }; break;
            }
            if (cx >= cur.r.right) {
              if (next && cx < next.r.left) {
                showInsertLine((cur.r.right + next.r.left) / 2, cur.r.top, cur.r.height);
                dragCtx.dropTarget = { id: cur.el.dataset.id, before: false }; break;
              }
              if (!next) {
                showInsertLine(cur.r.right + 8, cur.r.top, cur.r.height);
                dragCtx.dropTarget = { id: cur.el.dataset.id, before: false }; break;
              }
            }
          }
        }
      } else if (hovered) {
        // middle of tile → swap
        hideInsertLine();
        dragCtx.dropTarget = { id: hovered.dataset.id, swap: true };
      } else {
        hideInsertLine();
        dragCtx.dropTarget = null;
      }
    }
  }
}

function onDocUp(e) {
  if (!dragCtx) return;
  document.removeEventListener('mousemove', onDocMove);
  document.removeEventListener('mouseup', onDocUp);

  if (dragCtx.raf) { cancelAnimationFrame(dragCtx.raf); dragCtx.raf = null; }

  if (dragCtx.active) {
    if (dragCtx.ghost && dragCtx.ghost.parentNode) dragCtx.ghost.parentNode.removeChild(dragCtx.ghost);
    hideInsertLine();
    document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    const container = document.getElementById('drawercontainer');
    if (container) container.style.scrollSnapType = '';

    if (dragCtx.dropTarget) {
      const sites = getSites();
      const from = sites.findIndex(s => s.id === dragCtx.siteId);
      if (from > -1) {
        if (dragCtx.dropTarget.id === 'add') {
          const [site] = sites.splice(from, 1);
          sites.push(site);
        } else if (dragCtx.dropTarget.swap) {
          const to = sites.findIndex(s => s.id === dragCtx.dropTarget.id);
          if (to > -1 && to !== from) {
            [sites[from], sites[to]] = [sites[to], sites[from]];
          }
        } else {
          const to = sites.findIndex(s => s.id === dragCtx.dropTarget.id);
          if (to > -1) {
            const [site] = sites.splice(from, 1);
            const pos = dragCtx.dropTarget.before
              ? (from < to ? to - 1 : to)
              : (from < to + 1 ? to : to + 1);
            sites.splice(pos, 0, site);
          }
        }
        saveSites(sites);
        dragCtx = null;
        renderDrawer();
        return;
      }
    }

    dragCtx.item.classList.remove('dragging');
  }

  dragCtx = null;
}

function showInsertLine(x, y, height) {
  let line = document.querySelector('.insert-line');
  const container = document.getElementById('drawercontainer');
  if (!container) return;
  if (!line) {
    line = document.createElement('div');
    line.className = 'insert-line';
    container.appendChild(line);
  }
  const cr = container.getBoundingClientRect();
  line.style.cssText = 'position:absolute;left:' + (x - cr.left) + 'px;top:' + (y - cr.top + container.scrollTop) + 'px;width:3px;height:' + height + 'px;background:#007bff;border-radius:2px;pointer-events:none;z-index:1;transform:translateX(-50%);box-shadow:0 0 6px rgba(0,123,255,0.5);';
}
function hideInsertLine() {
  const line = document.querySelector('.insert-line');
  if (line) line.remove();
}

function autoScroll() {
  if (!dragCtx || !dragCtx.active) return;
  const container = document.getElementById('drawercontainer');
  if (!container) { dragCtx.raf = null; return; }
  const rect = container.getBoundingClientRect();
  const y = dragCtx.lastY;
  const edge = 40;
  if (y - rect.top < edge) container.scrollTop -= 6;
  else if (rect.bottom - y < edge) container.scrollTop += 6;
  dragCtx.raf = requestAnimationFrame(autoScroll);
}

function setupColorPicker(root, initialHex) {
  const hexInput = root.querySelector('.color-hex');
  const hueCanvas = root.querySelector('.hue-canvas');
  const svCanvas = root.querySelector('.sv-canvas');

  const defHex = '#0171c5';
  const hasInit = initialHex && /^#[0-9a-f]{6}$/i.test(initialHex);
  const init = hasInit ? initialHex : defHex;
  let dirty = hasInit;

  let curHue = hexToHue(init);
  let curSat = hexToSat(init);
  let curVal = hexToVal(init);
  let pickingHue = false, pickingSV = false;

  hexInput.value = init;

  // Create swatch element and move picker-area inside color-row
  const swatch = document.createElement('div');
  swatch.className = 'color-swatch';
  swatch.style.backgroundColor = init;
  const colorRow = root.querySelector('.color-row');
  colorRow.insertBefore(swatch, hexInput);
  // Move picker-area into color-row for popup positioning
  const pickerArea = root.querySelector('.picker-area');
  if (pickerArea) colorRow.appendChild(pickerArea);

  // Find closest modal-body and modal-box to fix overflow clipping when picker is open
  var modalBody = colorRow.closest('.modal-body');
  var modalBox = colorRow.closest('.modal-box');

  // Toggle picker popup on swatch click
  swatch.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = colorRow.classList.contains('picker-open');
    // Close all open pickers first
    _openPickerRows.forEach(function(row) {
      row.classList.remove('picker-open');
      var mb = row.closest('.modal-body');
      var mbox = row.closest('.modal-box');
      if (mb) { mb.style.overflow = ''; }
      if (mbox) { mbox.style.overflow = ''; }
    });
    _openPickerRows = [];
    // Toggle this one
    if (!isOpen) {
      colorRow.classList.add('picker-open');
      _openPickerRows.push(colorRow);
      if (modalBody) { modalBody.style.overflow = 'visible'; }
      if (modalBox) { modalBox.style.overflow = 'visible'; }
    }
  });

  // Close picker when clicking outside
  document.addEventListener('click', function closePicker(e) {
    if (colorRow.classList.contains('picker-open') && !colorRow.contains(e.target)) {
      colorRow.classList.remove('picker-open');
      if (modalBody) { modalBody.style.overflow = ''; }
      if (modalBox) { modalBox.style.overflow = ''; }
      _openPickerRows = _openPickerRows.filter(function(r) { return r !== colorRow; });
    }
  });

  function sizeCanvases() {
    requestAnimationFrame(() => {
      [hueCanvas, svCanvas].forEach(c => {
        const r = c.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          c.width = Math.round(r.width * devicePixelRatio);
          c.height = Math.round(r.height * devicePixelRatio);
        }
      });
      drawHueBar(); drawSV();
    });
  }

  function hsvToHex(h, s, v) {
    const f = function (n) { const k = (n + h / 60) % 6; return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0); };
    return '#' + [f(5), f(3), f(1)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  }
  function hueToHex(h) { return hsvToHex(h, 1, 1); }

  function drawHueBar() {
    const ctx = hueCanvas.getContext('2d');
    const w = hueCanvas.width, h = hueCanvas.height;
    if (!w || !h) return;
    const dpr = devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    const dw = w / dpr, dh = h / dpr;
    const grad = ctx.createLinearGradient(0, 0, dw, 0);
    ['#f00','#ff0','#0f0','#0ff','#00f','#f0f','#f00'].forEach((c, i) => grad.addColorStop(i / 6, c));
    ctx.fillStyle = grad; ctx.fillRect(0, 0, dw, dh);
    const ix = Math.round(curHue / 360 * dw);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(ix - 3, 0, 6, dh);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.strokeRect(ix - 3, 0, 6, dh);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function drawSV() {
    const ctx = svCanvas.getContext('2d');
    const w = svCanvas.width, h = svCanvas.height;
    if (!w || !h) return;
    const dpr = devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    const dw = w / dpr, dh = h / dpr;
    const hueHex = hueToHex(curHue);
    const gx = ctx.createLinearGradient(0, 0, dw, 0);
    gx.addColorStop(0, '#fff'); gx.addColorStop(1, hueHex);
    ctx.fillStyle = gx; ctx.fillRect(0, 0, dw, dh);
    const gy = ctx.createLinearGradient(0, 0, 0, dh);
    gy.addColorStop(0, 'rgba(0,0,0,0)'); gy.addColorStop(1, '#000');
    ctx.fillStyle = gy; ctx.fillRect(0, 0, dw, dh);
    const sx = Math.round(curSat * dw), sy = Math.round((1 - curVal) * dh);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function updateFromHSV() {
    const hex = hsvToHex(curHue, curSat, curVal);
    hexInput.value = hex; swatch.style.backgroundColor = hex; drawHueBar(); drawSV();
  }
  function setFromHex(hex) {
    curHue = hexToHue(hex); curSat = hexToSat(hex); curVal = hexToVal(hex);
    swatch.style.backgroundColor = hex; drawHueBar(); drawSV();
  }

  sizeCanvases();

  hueCanvas.addEventListener('mousedown', e => {
    pickingHue = true; dirty = true;
    const r = hueCanvas.getBoundingClientRect();
    curHue = Math.max(0, Math.min(360, (e.clientX - r.left) / r.width * 360));
    updateFromHSV();
  });
  svCanvas.addEventListener('mousedown', e => {
    pickingSV = true; dirty = true;
    const r = svCanvas.getBoundingClientRect();
    curSat = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    curVal = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height));
    updateFromHSV();
  });

  document.addEventListener('mousemove', function onMove(e) {
    if (pickingHue) { const r = hueCanvas.getBoundingClientRect(); curHue = Math.max(0, Math.min(360, (e.clientX - r.left) / r.width * 360)); updateFromHSV(); }
    else if (pickingSV) { const r = svCanvas.getBoundingClientRect(); curSat = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); curVal = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height)); updateFromHSV(); }
  });
  document.addEventListener('mouseup', function onUp() { pickingHue = false; pickingSV = false; });

  hexInput.addEventListener('input', function () {
    const v = this.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) { dirty = true; hexInput.value = v; setFromHex(v); }
  });

  return { getHex: () => hexInput.value.trim(), dirty };
}

function showModal(mode, site) {
  closeModal();
  const isEdit = mode === 'edit' && site;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3 class="modal-title">${isEdit ? 'Edit tile' : 'Add tile'}</h3>
        <button class="modal-close" title="Close"><iconify-icon icon="${ICONS.close}"></iconify-icon></button>
      </div>
      <div class="modal-body">
        <label>Name <input type="text" name="name" required placeholder="e.g. Google" value="${esc(isEdit ? site.name : '')}"></label>
        <label>URL <input type="url" name="url" required placeholder="${isEdit ? site.url : 'https://example.com'}" value="${esc(isEdit ? site.url : '')}"></label>
        <label>Logo type <select name="logoType">
          <option value="tile" ${isEdit && site.logoType === 'tile' ? 'selected' : ''}>Tile</option>
          <option value="logo" ${isEdit && site.logoType === 'logo' ? 'selected' : ''}>Complete Logo</option>
          <option value="emblem" ${isEdit && site.logoType === 'emblem' ? 'selected' : ''}>Emblem Logo</option>
        </select></label>
        <label>Logo URL <input type="text" name="logoUrl" placeholder="${isEdit && site.tile ? site.tile.split('/').pop() : 'Filename or URL'}" value="${esc(isEdit ? site.logoUrl || '' : '')}"></label>
        <label>Background color</label>
        <div class="color-row">
          <input type="text" class="color-hex" maxlength="7" placeholder="#0171c5">
        </div>
        <div class="picker-area">
          <canvas class="hue-canvas"></canvas>
          <canvas class="sv-canvas"></canvas>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="modal-btn modal-btn-cancel"><iconify-icon icon="${ICONS.close}"></iconify-icon> Cancel</button>
        <button type="submit" class="modal-btn modal-btn-primary"><iconify-icon icon="${ICONS.checkmark}"></iconify-icon> ${isEdit ? 'Save' : 'Add'}</button>
      </div>
    </div>`;

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  overlay.querySelector('.modal-close').addEventListener('click', closeModal);
  overlay.querySelector('.modal-btn-cancel').addEventListener('click', closeModal);

  // Rimuovi errore visivo quando l'utente inizia a digitare
  const nameInput = overlay.querySelector('[name="name"]');
  const urlInput = overlay.querySelector('[name="url"]');
  nameInput.addEventListener('input', () => nameInput.classList.remove('input-error'));
  urlInput.addEventListener('input', () => urlInput.classList.remove('input-error'));

  const colorPicker = setupColorPicker(overlay, isEdit ? site.bgColor : '');

  overlay.querySelector('.modal-footer .modal-btn-primary').addEventListener('click', function (e) {
    e.preventDefault();
    const logoTypeInput = overlay.querySelector('[name="logoType"]');
    const logoInput = overlay.querySelector('[name="logoUrl"]');
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    
    // Validazione visiva - evidenzia tutti i campi con errore
    let hasError = false;
    
    if (!name) {
      nameInput.classList.add('input-error');
      hasError = true;
    } else {
      nameInput.classList.remove('input-error');
    }
    
    if (!url) {
      urlInput.classList.add('input-error');
      hasError = true;
    } else {
      urlInput.classList.remove('input-error');
    }
    
    if (hasError) {
      // Focus sul primo campo con errore
      if (!name) nameInput.focus();
      else if (!url) urlInput.focus();
      return;
    }
    
    const logoType = logoTypeInput.value;
    const logoUrl = resolveLogoUrl(logoInput.value.trim());
    const bgColor = colorPicker.getHex();
    const sites = getSites();
    if (isEdit) {
      const idx = sites.findIndex(s => s.id === site.id);
      if (idx > -1) {
        sites[idx].name = name; sites[idx].url = url;
        sites[idx].logoType = logoType;
        sites[idx].logoUrl = logoUrl;
        if (colorPicker.dirty) {
          sites[idx].tile = '';
          sites[idx].bgColor = bgColor;
        }
      }
    } else {
      const tile = logoType !== 'tile' || logoUrl || bgColor ? '' : getTileUrl(url);
      // tile mode without logoUrl → favicon fallback
      // logo/emblem mode → logoUrl required, tile not used
      sites.push({ id: 's_' + Date.now() + Math.random().toString(36).slice(2, 6), name, url, tile, logoType, logoUrl, bgColor });
    }
    saveSites(sites); closeModal(); renderDrawer();
  });

  document.body.appendChild(overlay);
  overlay._keydownHandler = function(e) {
    if (e.key === 'Enter' && !e.repeat && !overlay.classList.contains('modal-closing')) {
      e.preventDefault();
      overlay.querySelector('.modal-footer .modal-btn-primary').click();
    }
  };
  document.addEventListener('keydown', overlay._keydownHandler);
  overlay.querySelector('[name="name"]').focus();
}

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function hexToHue(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return 0;
  let h = 0;
  const d = max - min;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return h;
}
function hexToSat(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}
function hexToVal(hex) {
  return Math.max(
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ) / 255;
}

function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach(function(el) {
    closeOverlay(el);
  });
}

function closeOverlay(overlay) {
  if (!overlay || overlay.classList.contains('modal-closing')) return;
  overlay.classList.add('modal-closing');
  // Remove keydown listener if present
  if (overlay._keydownHandler) {
    document.removeEventListener('keydown', overlay._keydownHandler);
  }
  overlay.addEventListener('animationend', function handler(e) {
    if (e.target === overlay) {
      overlay.removeEventListener('animationend', handler);
      overlay.remove();
    }
  });
  // Fallback: remove after animation duration if animationend doesn't fire
  setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 200);
}

function toggleEditMode() {
  isEditMode = !isEditMode;
  localStorage.setItem('ltf_editMode', isEditMode ? '1' : '0');
  updateFab();
  renderDrawer();
}

function updateFab() {
  const container = document.getElementById('fabContainer');
  const mainBtn = document.getElementById('fabMain');
  if (!container || !mainBtn) return;
  if (isEditMode) {
    container.classList.add('edit-active');
    mainBtn.innerHTML = '<iconify-icon icon="' + ICONS.editOff + '"></iconify-icon>';
  } else {
    container.classList.remove('edit-active');
    mainBtn.innerHTML = '<iconify-icon icon="' + ICONS.edit + '"></iconify-icon>';
    container.classList.remove('fab-open');
  }
}

function closeFab() {
  const container = document.getElementById('fabContainer');
  if (container) container.classList.remove('fab-open');
}

function exportGlobal() {
  closeFab();
  var data = { sites: getSites(), settings: getSettings() };
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'ltf-newtab-config.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importGlobal() {
  closeFab();
  var input = document.getElementById('fabFileInput');
  if (!input) return;
  input.value = '';
  input.onchange = function () {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (data.sites && Array.isArray(data.sites)) {
          saveSites(data.sites);
          if (data.settings && typeof data.settings === 'object') {
            saveSettings(Object.assign({}, DEFAULT_SETTINGS, data.settings));
          }
        } else if (Array.isArray(data)) {
          saveSites(data);
        } else {
          throw new Error('Invalid format');
        }
        applySettings();
        renderDrawer();
      } catch (err) {
        alert('Invalid file format. Please use a JSON file exported from LTF New Tab.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function resetGlobal() {
  closeFab();
  showConfirmModal(
    'Reset tiles to defaults?',
    'This will restore the default tiles. Your settings will not be affected.',
    function () {
      saveSites(DEFAULT_SITES.map(function (s) { return Object.assign({}, s); }));
      renderDrawer();
    }
  );
}

function resetSettings() {
  showConfirmModal(
    'Reset settings?',
    'This will restore the default settings. Your tiles will not be affected.',
    function () {
      saveSettings(Object.assign({}, DEFAULT_SETTINGS));
      applySettings();
      renderDrawer();
    }
  );
}

function showSettingsModal() {
  closeModal();
  var settings = getSettings();

  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML =
    '<div class="modal-box modal-box-settings">' +
      '<div class="modal-header">' +
        '<h3 class="modal-title">Settings</h3>' +
        '<button class="modal-close" title="Close"><iconify-icon icon="' + ICONS.close + '"></iconify-icon></button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div class="settings-section">' +
          '<div class="settings-section-title">Default tile appearance</div>' +
          '<div class="settings-appearance-grid">' +
            '<div class="settings-appearance-col">' +
              '<span class="settings-color-label">Light mode</span>' +
              '<div class="settings-color-item" id="pickerLightBg">' +
                '<span class="settings-color-item-label">Background</span>' +
                '<div class="color-row"><input type="text" class="color-hex" maxlength="7" placeholder="#ffffff"></div>' +
                '<div class="picker-area"><canvas class="hue-canvas"></canvas><canvas class="sv-canvas"></canvas></div>' +
              '</div>' +
              '<div class="settings-color-item" id="pickerLightText">' +
                '<span class="settings-color-item-label">Text</span>' +
                '<div class="color-row"><input type="text" class="color-hex" maxlength="7" placeholder="#ffffff"></div>' +
                '<div class="picker-area"><canvas class="hue-canvas"></canvas><canvas class="sv-canvas"></canvas></div>' +
              '</div>' +
            '</div>' +
            '<div class="settings-appearance-col">' +
              '<span class="settings-color-label">Dark mode</span>' +
              '<div class="settings-color-item" id="pickerDarkBg">' +
                '<span class="settings-color-item-label">Background</span>' +
                '<div class="color-row"><input type="text" class="color-hex" maxlength="7" placeholder="#1a1a2e"></div>' +
                '<div class="picker-area"><canvas class="hue-canvas"></canvas><canvas class="sv-canvas"></canvas></div>' +
              '</div>' +
              '<div class="settings-color-item" id="pickerDarkText">' +
                '<span class="settings-color-item-label">Text</span>' +
                '<div class="color-row"><input type="text" class="color-hex" maxlength="7" placeholder="#ffffff"></div>' +
                '<div class="picker-area"><canvas class="hue-canvas"></canvas><canvas class="sv-canvas"></canvas></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="settings-section">' +
          '<div class="settings-section-title">Widgets</div>' +
          '<div class="settings-widgets-grid">' +
            '<div class="widget-card' + (settings.showWeather ? ' active' : '') + '" data-widget="settWeather"><input type="checkbox" id="settWeather"' + (settings.showWeather ? ' checked' : '') + ' style="display:none"><iconify-icon icon="' + ICONS.weather + '"></iconify-icon><span>Meteo</span></div>' +
            '<div class="widget-card' + (settings.showSearchbar ? ' active' : '') + '" data-widget="settSearchbar"><input type="checkbox" id="settSearchbar"' + (settings.showSearchbar ? ' checked' : '') + ' style="display:none"><iconify-icon icon="' + ICONS.search + '"></iconify-icon><span>Searchbar</span></div>' +
            '<div class="widget-card' + (settings.showDrawers ? ' active' : '') + '" data-widget="settDrawers"><input type="checkbox" id="settDrawers"' + (settings.showDrawers ? ' checked' : '') + ' style="display:none"><iconify-icon icon="' + ICONS.grid + '"></iconify-icon><span>Drawers</span></div>' +
            '<div class="widget-card' + (settings.showCrypto ? ' active' : '') + '" data-widget="settCrypto"><input type="checkbox" id="settCrypto"' + (settings.showCrypto ? ' checked' : '') + ' style="display:none"><iconify-icon icon="' + ICONS.chart + '"></iconify-icon><span>Crypto</span></div>' +
            '<div class="widget-card' + (settings.focusSearchbar ? ' active' : '') + '" data-widget="settFocusSearchbar"><input type="checkbox" id="settFocusSearchbar"' + (settings.focusSearchbar ? ' checked' : '') + ' style="display:none"><iconify-icon icon="' + ICONS.textField + '"></iconify-icon><span>Auto-focus</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="settings-section">' +
          '<div class="settings-section-title">Weather location</div>' +
          '<div class="settings-coords-row" style="position:relative;">' +
            '<label>City <input type="text" id="settWeatherCity" value="' + (settings.weatherCity || '') + '" placeholder="e.g. Rome" autocomplete="off"></label>' +
            '<div id="settCityAutocomplete" class="city-autocomplete-dropdown" style="display:none;"></div>' +
          '</div>' +
        '</div>' +
        '<div class="settings-section">' +
          '<div class="settings-section-title">Data</div>' +
          '<div class="settings-actions">' +
            '<button type="button" class="modal-btn modal-btn-cancel" id="settExport"><iconify-icon icon="' + ICONS.arrowDownload + '"></iconify-icon> Export</button>' +
            '<button type="button" class="modal-btn modal-btn-cancel" id="settImport"><iconify-icon icon="' + ICONS.arrowUpload + '"></iconify-icon> Import</button>' +
            '<button type="button" class="modal-btn modal-btn-danger" id="settReset"><iconify-icon icon="' + ICONS.reset + '"></iconify-icon> Reset</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button type="button" class="modal-btn modal-btn-cancel" id="settCancel"><iconify-icon icon="' + ICONS.close + '"></iconify-icon> Cancel</button>' +
        '<button type="button" class="modal-btn modal-btn-primary" id="settSave"><iconify-icon icon="' + ICONS.checkmark + '"></iconify-icon> Save</button>' +
      '</div>' +
    '</div>';

  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeOverlay(overlay); });
  overlay.querySelector('.modal-close').addEventListener('click', function () { closeOverlay(overlay); });

  // Setup custom color pickers
  var pickerMap = {
    pickerLightBg: 'lightTileBg',
    pickerLightText: 'lightTileText',
    pickerDarkBg: 'darkTileBg',
    pickerDarkText: 'darkTileText'
  };
  var pickers = {};
  Object.keys(pickerMap).forEach(function (pickerId) {
    var root = overlay.querySelector('#' + pickerId);
    var initialHex = settings[pickerMap[pickerId]] || '';
    pickers[pickerId] = setupColorPicker(root, initialHex);
  });

  // Widget cards — toggle on click
  overlay.querySelectorAll('.widget-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var cb = card.querySelector('input[type="checkbox"]');
      cb.checked = !cb.checked;
      card.classList.toggle('active', cb.checked);
    });
  });

  // Widget toggles — no auto-save, just track state
  var toggleMap = { settWeather: 'showWeather', settSearchbar: 'showSearchbar', settDrawers: 'showDrawers', settCrypto: 'showCrypto', settFocusSearchbar: 'focusSearchbar' };

  // Save button — commit all changes
  overlay.querySelector('#settSave').addEventListener('click', function () {
    var s = getSettings();
    // Save color pickers
    Object.keys(pickerMap).forEach(function (pickerId) {
      if (pickers[pickerId].dirty) {
        s[pickerMap[pickerId]] = pickers[pickerId].getHex();
      }
    });
    // Save toggles
    Object.keys(toggleMap).forEach(function (id) {
      var input = overlay.querySelector('#' + id);
      if (input) s[toggleMap[id]] = input.checked;
    });
    // Save weather location
    if (cityInput) s.weatherCity = cityInput.value.trim();
    // Lat/lon sono salvati dal geocoding automatico
    saveSettings(s);
    applySettings();
    renderDrawer();
    closeOverlay(overlay);
  });

  // Cancel button
  overlay.querySelector('#settCancel').addEventListener('click', function () { closeOverlay(overlay); });

  // Export
  overlay.querySelector('#settExport').addEventListener('click', function () {
    closeOverlay(overlay);
    exportGlobal();
  });

  // Import
  overlay.querySelector('#settImport').addEventListener('click', function () {
    closeOverlay(overlay);
    importGlobal();
  });

  // Reset
  overlay.querySelector('#settReset').addEventListener('click', function () {
    closeOverlay(overlay);
    resetSettings();
  });

  // Weather location inputs
  var cityInput = overlay.querySelector('#settWeatherCity');

  // Autocomplete città
  var autocompleteContainer = overlay.querySelector('#settCityAutocomplete');
  var autocompleteTimeout = null;

  cityInput.addEventListener('input', function() {
    var city = this.value.trim();
    if (!city || city.length < 2) {
      autocompleteContainer.style.display = 'none';
      return;
    }

    // Clear previous timeout
    if (autocompleteTimeout) clearTimeout(autocompleteTimeout);

    // Debounce
    autocompleteTimeout = setTimeout(function() {
      fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city) + '&count=5&language=it&format=json')
        .then(function(response) { return response.json(); })
        .then(function(data) {
          if (data.results && data.results.length > 0) {
            autocompleteContainer.innerHTML = '';
            data.results.forEach(function(result) {
              var item = document.createElement('div');
              item.className = 'city-autocomplete-item';
              item.textContent = result.name + (result.admin1 ? ', ' + result.admin1 : '') + (result.country ? ', ' + result.country : '');
              item.addEventListener('click', function() {
                cityInput.value = result.name;
                var settings = getSettings();
                settings.weatherLat = result.latitude;
                settings.weatherLon = result.longitude;
                saveSettings(settings);
                autocompleteContainer.style.display = 'none';
              });
              autocompleteContainer.appendChild(item);
            });
            autocompleteContainer.style.display = 'block';
          } else {
            autocompleteContainer.style.display = 'none';
          }
        })
        .catch(function(err) {
          console.warn('Autocomplete failed:', err);
          autocompleteContainer.style.display = 'none';
        });
    }, 300);
  });

  // Nascondi autocomplete quando si clicca fuori
  document.addEventListener('click', function(e) {
    if (!autocompleteContainer.contains(e.target) && e.target !== cityInput) {
      autocompleteContainer.style.display = 'none';
    }
  });

  document.body.appendChild(overlay);
  overlay._keydownHandler = function(e) {
    if (e.key === 'Enter' && !e.repeat && !overlay.classList.contains('modal-closing')) {
      e.preventDefault();
      overlay.querySelector('#settSave').click();
    }
  };
  document.addEventListener('keydown', overlay._keydownHandler);
}

function showConfirmModal(title, message, onConfirm) {
  closeModal();
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML =
    '<div class="modal-box">' +
      '<div class="modal-header">' +
        '<h3 class="modal-title">' + title + '</h3>' +
        '<button class="modal-close" title="Close"><iconify-icon icon="' + ICONS.close + '"></iconify-icon></button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<p style="font:14px Nunito,sans-serif;color:#555;margin:0;">' + message + '</p>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button type="button" class="modal-btn modal-btn-cancel"><iconify-icon icon="' + ICONS.close + '"></iconify-icon> Cancel</button>' +
        '<button type="button" class="modal-btn modal-btn-danger"><iconify-icon icon="' + ICONS.reset + '"></iconify-icon> Reset</button>' +
      '</div>' +
    '</div>';

  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeOverlay(overlay); });
  overlay.querySelector('.modal-close').addEventListener('click', function () { closeOverlay(overlay); });
  overlay.querySelector('.modal-btn-cancel').addEventListener('click', function () { closeOverlay(overlay); });
  overlay.querySelector('.modal-btn-danger').addEventListener('click', function () { closeOverlay(overlay); onConfirm(); });

  document.body.appendChild(overlay);
  overlay._keydownHandler = function(e) {
    if (e.key === 'Enter' && !e.repeat && !overlay.classList.contains('modal-closing')) {
      e.preventDefault();
      overlay.querySelector('.modal-btn-danger').click();
    }
  };
  document.addEventListener('keydown', overlay._keydownHandler);
}

function init() {
  isEditMode = localStorage.getItem('ltf_editMode') === '1';

  var container = document.getElementById('fabContainer');
  var mainBtn = document.getElementById('fabMain');
  var fabSettings = document.getElementById('fabSettings');
  var importBtn = document.getElementById('fabImport');
  var exportBtn = document.getElementById('fabExport');
  var resetBtn = document.getElementById('fabReset');

  if (mainBtn) {
    mainBtn.addEventListener('click', function () {
      toggleEditMode();
    });
  }

  if (fabSettings) fabSettings.addEventListener('click', function () { closeFab(); showSettingsModal(); });
  if (importBtn) importBtn.addEventListener('click', function () { importGlobal(); });
  if (exportBtn) exportBtn.addEventListener('click', function () { exportGlobal(); });
  if (resetBtn) resetBtn.addEventListener('click', function () { resetGlobal(); });

  document.addEventListener('click', function (e) {
    if (container && !container.contains(e.target)) {
      container.classList.remove('fab-open');
    }
  });

  // ESC key to exit edit mode
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isEditMode) {
      toggleEditMode();
    }
  });

  updateFab();
  applySettings();
  renderDrawer();

  // Re-apply settings when dark mode toggles
  var observer = new MutationObserver(function () { applySettings(); });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

document.addEventListener('DOMContentLoaded', init);
