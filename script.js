const F = document.getElementById('Form');
const Q = document.getElementById('Query');
const searchengine = 'https://duckduckgo.com/?q=site%3A+';
var Site = 'fanart.tv';

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

