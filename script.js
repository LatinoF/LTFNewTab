const f = document.getElementById('form');
const q = document.getElementById('query');
const searchengine = 'https://duckduckgo.com/?q=site%3A+';
var site = 'fanart.tv';

function submitted(event) {
  event.preventDefault();
  const url = searchengine + site + '+' + q.value;
  const win = window.open(url,"_self");
}

f.addEventListener('submit', submitted);

  function switchVisible() {
    	var div1=document.getElementById('Div1');
    	var div2=document.getElementById('Div2');
    	
      if (div1 !== undefined && div2 !== undefined) {
    	  div1.style.display = div2.style.display === '' ? 'none' : div2.style.display === 'none' ? 'none' : 'block';
    	  div2.style.display = div1.style.display === 'block' ? 'none' : 'block';
      }
    }