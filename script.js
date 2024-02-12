
// Disable Image Dragging
window.ondragstart = function () { return false; }


//Custom Context Menu
document.onclick = hideMenu;
document.onauxclick = hideMenu;

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
const searchengine = 'https://www.google.com/search?q=';
var Site = '';

function Submitted(event) {
  event.preventDefault();
  const url = searchengine + Site + '+' + Q.value;
  const win = window.open(url, "_self");
}

F.addEventListener('submit', Submitted);

//Searchbar Engine Swap and Local Storage Save&Check
window.onload = engineCheck();

function engineCheck() {
  if (localStorage.getItem('engine') !== 'Google') {
    swapTV();
  } else {
    swapGoogle();
  }
}

function swapGoogle() {
  Site = '';
  localStorage.setItem('engine', 'Google');
  document.getElementById("aGoogle").style.fontWeight = "bold";
  document.getElementById("aTV").style.fontWeight = "normal";
}

function swapTV() {
  Site = 'site%3Afanart.tv';
  localStorage.setItem('engine', 'Fanart');
  document.getElementById("aTV").style.fontWeight = "bold";
  document.getElementById("aGoogle").style.fontWeight = "normal";
}


//Searchbar Placeholder Change
var placeholders = ["Mah Davveroh?", "Ebberghe?", "Ghe Suggedeh?", "Tutto Positivo?"];
var index = 0;
setInterval(function () {
  index = (index + 1) % placeholders.length;
  var textField = document.getElementById("query");
  textField.placeholder = placeholders[index];
}, 10000); // change the placeholder text every 10 seconds






//begheni
if(window.location.search === "?page=tab") {
  window.location.href = "tab.html";
}


//calvir
if(window.location.search === "?page=min") {
  window.location.href = "minindex.html";
}
