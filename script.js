window.ondragstart = function() { return false; } 

document.onclick = hideMenu;
document.onauxclick = hideMenu;
  
function hideMenu() {
  document.getElementById("menu").style.display = "none"
}
  
document.getElementById("EngineSwapper").oncontextmenu = function rightClick(e) {
  e.preventDefault();
  if (document.getElementById("menu").style.display == "block"){
    hideMenu();
  } else {
      var Menu = document.getElementById("menu")
      Menu.style.display = 'block';
      Menu.style.left = e.pageX + "px";
      Menu.style.top = e.pageY + "px";
    }
  }

const F = document.getElementById('form');
const Q = document.getElementById('query');
const searchengine = 'https://www.google.com/search?q=';
var Site = '';

function Submitted(event) {
  event.preventDefault();
  const url = searchengine + Site + '+' + Q.value;
  const win = window.open(url,"_self");
}

F.addEventListener('submit', Submitted);

window.onload = engineCheck();

function engineCheck(){
  if(localStorage.getItem('engine') == null && localStorage.getItem('engine') === 'Google'){
    swapGoogle();
  } else{
    swapTV();
  }
}

function swapGoogle(){
  Site = '';
  localStorage.setItem('engine', 'Google');
  document.getElementById("aGoogle").style.fontWeight = "bold";
  document.getElementById("aTV").style.fontWeight = "normal";
}

function swapTV(){
  Site = 'site%3Afanart.tv';
  localStorage.setItem('engine', 'Fanart');
  document.getElementById("aTV").style.fontWeight = "bold";
  document.getElementById("aGoogle").style.fontWeight = "normal";
}

