const F = document.getElementById('Form');
const Q = document.getElementById('Query');
const searchengine = 'https://www.google.com/search?q=';
var Site = '';

function Submitted(event) {
  event.preventDefault();
  const url = searchengine + Site + '+' + Q.value;
  const win = window.open(url,"_self");
}

F.addEventListener('submit', Submitted);

function switchDOGE(){
  document.getElementById("BTC").style.display = "none";
  document.getElementById("ETH").style.display = "none";
  document.getElementById("DOGE").style.display = "block";
}

function switchBTC(){
  document.getElementById("DOGE").style.display = "none";
  document.getElementById("ETH").style.display = "none";
  document.getElementById("BTC").style.display = "block";
}

function switchETH(){
  document.getElementById("DOGE").style.display = "none";
  document.getElementById("BTC").style.display = "none";
  document.getElementById("ETH").style.display = "block";
}

document.getElementById('NoDrag1').ondragstart = function() { return false; };
document.getElementById('NoDrag2').ondragstart = function() { return false; };
document.getElementById('NoDrag3').ondragstart = function() { return false; };

document.onclick = hideMenu;
document.onauxclick = hideMenu;
  
function hideMenu() {
  document.getElementById("contextMenu").style.display = "none"
}
  
document.getElementById("EngineSwapper").oncontextmenu = function rightClick(e) {
  e.preventDefault();
  if (document.getElementById("contextMenu").style.display == "block"){
    hideMenu();
  } else {
      var Menu = document.getElementById("contextMenu")
      Menu.style.display = 'block';
      Menu.style.left = e.pageX + "px";
      Menu.style.top = e.pageY + "px";
    }
  }

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
  document.getElementById("aGoogle").style.color = "red";
  document.getElementById("aTV").style.color = "black";
}

function swapTV(){
  Site = 'site%3Afanart.tv';
  localStorage.setItem('engine', 'Fanart');
  document.getElementById("aTV").style.color = "red";
  document.getElementById("aGoogle").style.color = "black";
}