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
//[a-z A-Z]{3,255}:\/\/(w{0,3})(_?)([a-z A-Z 0-9]{0,63}(\.|\/|-|%20|\+|\_)[a-z A-Z 0-9 ]{0,63}){1,2024}

///[a-z A-Z]{3,255}:\/\/([a-z A-Z 0-9]{0,63}(\.|\/|-|%20|\+)[a-z A-Z 0-9]{0,63}){1,2024}/,
//all data.
const data={
	input: document.getElementById('url'),
	error: document.getElementById('error-message'),
	url_btn:document.getElementById('get_url'),
	urlRegTwo:/[a-z A-Z]{3,255}:\/\/([a-z A-Z 0-9]{0,63}(\.|\/|-|%20|\+)[a-z A-Z 0-9]{0,63}){1,2024}/,
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

async function getFetchPost(){
	//const url = '/.netlify/functions/proxy';
	//const url = '/.netlify/functions/serverlessFetch';
	const url = '/.netlify/functions/octo';
	//data.input.value = data.input.value.toLowerCase();
	const serverUrl ='https://cleanuri.com/api/v1/shorten';
	
	return await fetch(url, {
       method: 'POST',
       body:  JSON.stringify({ url: data.input.value }),
       headers: {
          'Content-Type': 'application/json',
       }
    })
	.then( response => {
        if (!response.ok) { 
			throw new Error(`Response status ${response.status}`, { cause: response });
		}else if(response.status ===204){
			alert(`There is no response from the ${serverUrl}`);
			throw new Error(`Request fullfilled successful but there is no data in the reponse body, likely the server ${serverUrl} is down`);
		}
		return response.json();
    })
	.then(content=>{
		     console.log('content',content.result_url);
			 return content.result_url;
	})
	.catch(error => {
           console.error("Caught error in promise:", error);
    });
}


async function returnShort(){
	//data.encodedUrl = urlEncoded();  //? + octo statustext?  
    let shortened =  await getFetchPost();
	
	const inputUrl={
		old_url : data.input.value,
		shorten_url: shortened,
	}
	data.urlData.push(inputUrl);
	saveToStorage('url',data.urlData);

	//button classlist variable
	let includedClasses='not-shown';
	//if navigator.writetext is support, update the button classlist so the buttonw iwll be shown with the shown class.
	if (navigator.clipboard.writeText) {
        //navigator.clipboard.writeText() is supported, add the 'Copy' button.
        includedClasses='js-copy-btn btn shown green-rounded-button';
    }
	data.urls_container.innerHTML += `
			<li class='display-flex justify-content-center align-items-center added-url colRow'>
				<p data-copy='${inputUrl.old_url} : ${inputUrl.shorten_url}'  class='me-2-md me-1'>${inputUrl.old_url} :<span class='green-font'> ${inputUrl.shorten_url}</span></p>
				<button class='${includedClasses}' type='button'>Copy</button>
			</li>
	`;
	addListener();
}

const validateURL=(event)=>{
	event.preventDefault();
	if(data.input.value.length > 0){
		data.error.innerHTML='';
		data.input.style.border='none';
        const valid_old = data.urlRegTwo.test(data.input.value.trim());
		//const valid_old = validator.isURL(data.input.value.trim());
		if(valid_old){
			console.log('data.input.value',data.input.value);
           returnShort();
		}else{
		   data.input.style.border='2px solid red';
		   let place= data.input.getAttribute('placeholder');
		   place.style.setProperty("--c", "red");
           data.error.innerHTML = `<p class='red-font'>Enter a correct format url : https://domainname/page, https://domainname.page_1 etc</p>`;
		}
	} else{
		//add an error message beneath input field
		data.input.style.border='2px solid red';
		document.querySelector('input[type=text]').style.setProperty("--c", "red");
        data.error.innerHTML = `<p class='red-font'>Enter a link to be shortened...</p>`;
	}
}
const clipBoardWrite = async (btnData) => {
    if (!navigator.clipboard) {
         return;
    }
	//Chrome supports the API’s readText() method, while Firefox doesn’t.
	// copy text TO the clipboard 
	if (navigator.clipboard.writeText && typeof navigator.clipboard === 'object') {
        try {
			await navigator.clipboard.writeText(btnData);
		} catch (error) {
			console.error(error);
		}
    }
	const text = await clipBoardRead();
	console.log('text from clipboard shortenend urls: ',text);
}
const clipBoardRead= async()=>{
    if (!navigator.clipboard) {
         return;
    }
	const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
    const permissionStatus = await navigator.permissions.query(queryOpts);
	// get text FROM the clipboard
	if (navigator.clipboard.readText && permissionStatus) {
        try {
			const text = await navigator.clipboard.readText();
			return text;
		} catch (error) {
			console.error(error);
		}
    }
}

const addListener =()=>{
	//add listener to the input field button "shorten it"
	data.url_btn.addEventListener('click',validateURL);

	//add listeners to all the shortend link buttons , all the 'copy' buttons.
	data.clearBtn.addEventListener('click',clearLocalStorage);
	[...document.querySelectorAll('.js-copy-btn')].forEach(btn=>btn.addEventListener('click',(e)=>{
		//btn.textContent = (btn.textContent ==='Copy')? btn.textContent='Copied!' : btn.textContent='Copy';
		btn.textContent='Copied!';
		if($(btn).hasClass('green-rounded-button')){
            $(btn).removeClass('green-rounded-button');
			$(btn).addClass('dark-blue-rounded-button');
		}
		let sibling = btn.previousElementSibling;
		const btnData = $(sibling).attr('data-copy');
		btn.style.backgroundColor='lighten(hsl(255, 11%, 22%),10)';
		clipBoardWrite(btnData);
	}));
}
const updateUrl_container=()=>{
	//button classlist variable
	let includedClasses='not-shown';
	//if navigator.writetext is support, update the button classlist so the buttonw iwll be shown with the shown class.
	if (navigator.clipboard.writeText) {
        //navigator.clipboard.writeText() is supported, add the 'Copy' button.
        includedClasses='js-copy-btn btn shown green-rounded-button';
    }
    if(data.urlData){
		data.urlData.forEach(
			({old_url,shorten_url}) => {
					(data.urls_container.innerHTML += `
						  <li class='display-flex justify-content-center align-items-center added-url colRow'>
						     <p data-copy='${old_url} : ${shorten_url}' class='me-2-md me-1'>${old_url} : <span class='green-font'>${shorten_url}</span></p>
							 <button class='${includedClasses}' type='button'>Copy</button>
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
		//$('#open').toggleClass('hidden');
		//$('#close').toggleClass('hidden');
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
	})*/
	
});
