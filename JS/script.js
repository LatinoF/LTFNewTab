
// Disable Image Dragging
window.addEventListener('dragstart', function (e) { e.preventDefault(); })


//Custom Context Menu
document.addEventListener('click', hideMenu);
document.addEventListener('auxclick', hideMenu);

function hideMenu() {
  document.getElementById("menu").style.display = "none"
}


document.getElementById("EngineSwapper").oncontextmenu = function rightClick(e) {
  e.preventDefault();
  if (document.getElementById("menu").style.display == "block") {
    hideMenu();
  } else {
    var Menu = document.getElementById("menu")
    Menu.style.display = 'block';
    Menu.style.left = e.pageX + "px";
    Menu.style.top = e.pageY + "px";
  }
}

//Searchbar Search
const F = document.getElementById('form');
const Q = document.getElementById('query');
let searchengine = 'https://www.google.com/search?q=';
var Site = '';

function Submitted(event) {
  event.preventDefault();
  const url = searchengine + Site + '+' + encodeURIComponent(Q.value);
  const win = window.open(url, "_self");
}

F.addEventListener('submit', Submitted);

//Searchbar Engine Swap and Local Storage Save&Check
document.addEventListener('DOMContentLoaded', engineCheck);

function engineCheck() {
  const engine = localStorage.getItem('engine');
  if (engine === 'Fanart') {
    swapTV();
  } else if (engine === 'DuckDuckGo') {
    swapDuckDuckGo();
  } else {
    swapGoogle();
  }
}

function swapGoogle() {
  Site = '';
  searchengine = 'https://www.google.com/search?q=';
  localStorage.setItem('engine', 'Google');
  document.getElementById("aGoogle").style.fontWeight = "bold";
  document.getElementById("aTV").style.fontWeight = "normal";
  document.getElementById("aDuckDuckGo").style.fontWeight = "normal";
}

function swapTV() {
  Site = 'site%3Afanart.tv';
  searchengine = 'https://www.google.com/search?q=';
  localStorage.setItem('engine', 'Fanart');
  document.getElementById("aTV").style.fontWeight = "bold";
  document.getElementById("aGoogle").style.fontWeight = "normal";
  document.getElementById("aDuckDuckGo").style.fontWeight = "normal";
}

function swapDuckDuckGo() {
  Site = '';
  searchengine = 'https://duckduckgo.com/?q=';
  localStorage.setItem('engine', 'DuckDuckGo');
  document.getElementById("aDuckDuckGo").style.fontWeight = "bold";
  document.getElementById("aGoogle").style.fontWeight = "normal";
  document.getElementById("aTV").style.fontWeight = "normal";
}


//Searchbar Placeholder Change
var placeholders = (typeof PLACEHOLDERS !== 'undefined') ? PLACEHOLDERS : [];
var index = 0;

setInterval(function () {
  if (placeholders.length === 0) return;
  index = (index + 1) % placeholders.length;
  var textField = document.getElementById("query");
  textField.placeholder = placeholders[index];
}, 10000); // change the placeholder text every 10 seconds

// Focus searchbar on page load if setting is enabled
document.addEventListener('DOMContentLoaded', function() {
  try {
    var settings = JSON.parse(localStorage.getItem('ltf_settings'));
    if (settings && settings.focusSearchbar) {
      var query = document.getElementById('query');
      if (query) query.focus();
    }
  } catch(e) {}
});



// Mapping
const pageMappings = {
    tab: "tab.html",
    min: "min", 
    oled: "oled.html"
};

const currentPage = new URLSearchParams(window.location.search).get("page");

if (currentPage === 'min') {
    const cryptoWidget = document.querySelector('.cryptoWidget');
    if (cryptoWidget) {
        cryptoWidget.style.display = 'none';
    }
} else if (currentPage && pageMappings[currentPage]) {
    window.location.href = pageMappings[currentPage];
}



// Prevent default action for Crypto Widget
document.querySelectorAll('.mcw-link').forEach(link => {
  link.addEventListener('click', function (event) {
    event.preventDefault();
  });
});
