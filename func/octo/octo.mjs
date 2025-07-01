
import fetch from 'node-fetch';




export default async function proxyHandler(request) {
    const url = "https://cleanuri.com/api/v1/shorten";
   
    try{
        const method = request.method;
        if (method !== 'POST') {
            const init = { "status" : 500 , "statusText" : "The method used wasn't POST!" };
            const response = new Response(null,init);
            if(!response){
                throw new Error('Failed to create response object, and method used was not POST');
            }
            return response;
        }


        let requestBody = await request.json();
        let proxiedResponse = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                   'content-type': 'application/json',
                }
        })

        if(!proxiedResponse){
            throw new Error('Failed to create response object from fetch in serverless function Octo');
        }
        else if(proxiedResponse.status >500){
            throw new Error(`Server error. The site ${url} could be down or some other server error`);
        }

        const data = await proxiedResponse.json();
        if(!data){
    
        }
        
        const response = new Response(
            JSON.stringify(data),{
                headers: {
                'Content-Type': 'application/json'
                }
            });
        if(!response){
           
        }
        return response;
    }catch(error){
        console.log(error.message);
    }

} 
    




             
