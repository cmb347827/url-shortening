'use strict'; 


$(window).resize(function(){
	location.reload();
});
//local storage functions
function saveToStorage(set,data){
    //whenever the messages are updated , will be saved in local storage.
    localStorage.setItem(set,JSON.stringify(data));//to json string
}
function clearLocalStorage(){
	localStorage.clear();
	location.reload();
 }
 function loadFromStorage(set,data){
	data = JSON.parse(localStorage.getItem(set));  
}

//all data.
const data={
	input: document.getElementById('url'),
	url:document.getElementById('get_url'),
    //urlReg: /https:\/\/(\w{1,}\.){1,}\w{1,}/,
	urlRegTwo:/[a-z]{3,255}:\/\/([a-z0-9]{0,63}(\.|\/|-|%20|\+)[a-z0-9]{0,63}){1,2024}/,
	urlData : JSON.parse(localStorage.getItem("url")) || [],
	urls_container: document.getElementById('urls_container'),
	encodedUrl:'',
	hashId:'',
	shortendUrl:'',
	clearBtn : document.getElementById('clear_all'),
}

const urlEncoded=()=>{
	 //convert data.input.value to encoded url
     return encodeURIComponent(data.input.value);
}

function getFetchPost(){
	//const url = '/.netlify/functions/proxy';
	const url = '/.netlify/functions/octo';
	 fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			url: data.encodedUrl,
		}),
		headers: {
			'content-type': 'application/json'
		}
		})
	     .then((resp)=>resp.json())
	     .then((content)=>{
		     console.log('in getfetchpost', content);
	    })
	    .catch(console.error);  
    //const url='/.netlify/functions/serverlessFetch';
	//const url = '/.netlify/functions/octo';
	/*fetch(url)
	  .then((resp)=>resp.json())
	  .then((content)=>{
		  console.log('in getfetchpost', content);
	  })
	  .catch(console.error);*/
	
}


 function returnShort(){
	data.encodedUrl = urlEncoded();
    let shortened = getFetchPost();
	
	
	const inputUrl={
		old_url : data.input.value,
		shorten_url: shortened,
	}
	data.urlData.push(inputUrl);
	saveToStorage('url',data.urlData);
	let tempId= 'tempId';
	data.urls_container.innerHTML += `
		<li class='display-flex justify-content-center'>
			<p class='me-2-md me-1'>${inputUrl.old_url} : ${inputUrl.shorten_url}</p>
			<button id='tempId' class='js-copy-btn' type='button'>Copy</button>
		</li>`;
	addListener();
}

const validateURL=(event)=>{
	event.preventDefault();
	const valid_old = data.urlRegTwo.test(data.input.value.trim());
	if(valid_old){
        returnShort();
	}else{
		//error message beneath input 
		//clipboard api.
	}
}

const addListener =()=>{
	data.url.addEventListener('click',validateURL);
	data.clearBtn.addEventListener('click',clearLocalStorage);
	[...document.querySelectorAll('.js-copy-btn')].forEach(btn=>btn.addEventListener('click',(e)=>{
        console.log('in js copybnt');
		btn.textContent = (btn.textContent ==='Copy')? btn.textContent='Copied!' : btn.textContent='Copy';
	}));
}
const updateUrl_container=()=>{
    if(data.urlData){
		data.urlData.forEach(
			({old_url,shorten_url}) => {
					(data.urls_container.innerHTML += `
						  <li class='display-flex justify-content-center'>
						     <p class='me-2-md me-1'>${old_url} : ${shorten_url}</p>
							 <button class='js-copy-btn' type='button'>Copy</button>
					      </li>
				   `)
			}
		  
		);
	  }
}

$(window).on('load',function(){
	loadFromStorage('url',data.urlData);
	updateUrl_container();
	addListener();

	const navbar= document.getElementById('navbarCollapse');

	$("#menubutton").on("click", function(){
        //menu is collapsed/closed, toggle open/close icon.
		$('#open').toggleClass('hidden');
		$('#close').toggleClass('hidden');
		$('#nav').toggleClass('custom-nav');
		document.querySelector('#navbarCollapse').classList.toggle("hidden");
		navbar.toggleAttribute('aria-expanded');
    });
	
	/*$(data.subscribe).on('click',function(){
		dataFailed();
	});*/
    //User has pressed the keyboard ,and entered some data in the input field
    //data.email.addEventListener('keyup',keyUp);
    //data.email.addEventListener('keypress',keyPress);

    /*data.subscribe.addEventListener('click',(e)=>{
        e.preventDefault();
		keyPress(e);
	})
	*/
});
