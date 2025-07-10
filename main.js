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
	error: document.querySelector('.error-message'),
	url_btn:document.getElementById('get_url'),
	urlRegTwo:/[a-z A-Z]{3,255}:\/\/([a-z A-Z 0-9]{0,63}(\.|\/|-|%20|\+)[a-z A-Z 0-9]{0,63}){1,2024}/,
	urlData : JSON.parse(localStorage.getItem("url")) || [],
	urls_container: document.querySelector('.urls_container'),
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

	//serverless netlify function octo in octo.mjs (see func folder)
	const url = '/.netlify/functions/octo';
	data.input.value = data.input.value.toLowerCase();
	//needed for the error message below.
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
		     //console.log('content',content.result_url);
			 return content.result_url;
	})
	.catch(error => {
           console.error("Caught error in promise:", error);
    });
}


async function returnShort(){
	//data.encodedUrl = urlEncoded();  //? + octo statustext?  
	//netlify serverless function is called in getFetchPost() to fetch the shortened url
    const shortened =  await getFetchPost();
	
	//create new url object , with both the old url and new shortened url
	const inputUrl={
		old_url : data.input.value,
		shorten_url: shortened,
	}
	data.urlData.push(inputUrl);
	//this way the urls will be visible still with a browser refresh
	saveToStorage('url',data.urlData);

	//button classlist variable , assume first that clipboard is not supported, so don't show the 'copy' button.
	let includedClasses='not-shown';
	//if navigator.writetext is support, update the button classlist so the buttonw iwll be shown with the shown class.
	if (navigator.clipboard.writeText) {
        //navigator.clipboard.writeText() is supported, add the 'Copy' button.
        includedClasses='js-copy-btn btn shown green-rounded-button';
    }
	//add the new url object (old + new shortened at the end of the url form)
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
        //const valid_old = data.urlRegTwo.test(data.input.value.trim());
		//validate the url with validator.js 
		const valid_old = validator.isURL(data.input.value.trim());
		if(valid_old){
			// the url is valid, return the shortened url
           returnShort();
		}else{
		   //the url is invalid format.
		   data.input.style.border='2px solid red';
		   $(data.input).addClass('red-font');
           data.error.innerHTML = `<p class='red-font'>Enter a correct format url </p>`;
		}
	} else{
		//The inputfield is empty , add an error message beneath input field
		data.input.style.border='2px solid red';
		$(data.input).addClass('red-font');
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
	//do something with read text in clipboard
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
		//change the 'Copy' button's appearance to reflect that the content has been copied to the clipboard
		btn.textContent='Copied!';
		if($(btn).hasClass('green-rounded-button')){
            $(btn).removeClass('green-rounded-button');
			$(btn).addClass('dark-blue-rounded-button');
		}
		//get the button's immediate sibling(<p> element)
		const sibling = btn.previousElementSibling;
		//get the input data value (data-copy) for the buttons' sibling <p> 
		const btnData = $(sibling).attr('data-copy');
		btn.style.backgroundColor='lighten(hsl(255, 11%, 22%),10)';
		clipBoardWrite(btnData);
	}));
}
const updateUrl_container=()=>{
	//button classlist variable, assume first that clipboard is not supported, so don't show the 'copy' button.
	let includedClasses='not-shown';
	//if navigator.writetext is support, update the button classlist so the buttonw iwll be shown with the shown class.
	if (navigator.clipboard.writeText) {
        //navigator.clipboard.writeText() is supported, add the 'Copy' button.
        includedClasses='js-copy-btn btn shown green-rounded-button';
    }
	//show entire urlData array urls.
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

	const navbar= document.querySelector('.navbarCollapse');

	$("#menubutton").on("click", function(){
		$('.nav').toggleClass('custom-nav');
		navbar.classList.toggle("hidden");
		navbar.toggleAttribute('aria-expanded');
    });
	
});
