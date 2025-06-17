
import fetch from 'node-fetch';

// This version directly below works, but only for the github link
/*export const handler = async (event,context,callback) => {
    const url='https://raw.githubusercontent.com/cmb347827/static-job-listings-master/refs/heads/main/data.json';
    //const url = "https://cleanuri.com/api/v1/shorten";
 
    const res = await fetch(url);
    data = await res.json();

    callback(null,{
        statusCode:200,
        body: JSON.stringify({'in octo':data}),
    });

   
}
*/

// This version directly below works, but only for the github link
/*export const handler = async (request,context,callback) => {
    const url='https://raw.githubusercontent.com/cmb347827/static-job-listings-master/refs/heads/main/data.json';
    //const url = "https://cleanuri.com/api/v1/shorten";

    const method = request.httpMethod;
    
  
    if (method !== 'POST') {
        callback(null,{
            statusCode:405,
            body: JSON.stringify('in octo error'),
        });
    }
 
    const res = await fetch(url);
    data = await res.json();
    callback(null,{
            statusCode:200,
            body: JSON.stringify(data),
    });
}*/


//Function octo has returned an error: Function returned an unsupported value. Accepted types are 'Response' or 'undefined'
export default async function proxyHandler(request,callback) {
    const url='https://raw.githubusercontent.com/cmb347827/static-job-listings-master/refs/heads/main/data.json';
    //const url = "https://cleanuri.com/api/v1/shorten";
 
   
    try{
        const method = request.httpMethod;
  
        if (method !== 'POST') {
           callback(null,{
              statusCode:405,
              body: JSON.stringify('Error: non-POST method used to fetch url'),
           });
        }
        const requestBody = await request.json();
        if(!requestBody){
            throw new Error(`Request json error! Status: `);
        }
        let proxiedResponse = await fetch(url, {
             method: 'POST',
             body: JSON.stringify(requestBody),
             headers: {
             'content-type': 'application/json'
            }
        })
        if(!proxiedResponse){
            throw new Error(`HTTP error! Status: ${proxiedResponse.status}`);
        }
        console.log('proxied',proxiedResponse);
        return proxiedResponse;
    }catch(error){
        console.error('Fetch error:', error.message);
        return null;
    }
        
}

//Function octo has returned an error: "[object Object]" is not valid JSON
/*export default async function proxyHandler(request) {
    const method = request.httpMethod;
  
    if (method !== 'POST') {
       
    }
    let requestBody = await request.json();
   
    let proxiedResponse = await fetch(url, {
             method: 'POST',
             body: JSON.stringify(requestBody),
             headers: {
             'content-type': 'application/json'
            }
    })
    return proxiedResponse;
};*/