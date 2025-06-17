

/*exports.handler= function(event,context,callback){

    callback(null,{
        statusCode:200,
        body: JSON.stringify('in serverless'),
    });
}*/

export async function proxyHandler(request) {
  const url='https://raw.githubusercontent.com/cmb347827/static-job-listings-master/refs/heads/main/data.json';
  
  /*const method = request.method
  // check your client is making the right kind of request
  if (method !== 'POST') {
    return new Response('Method not allowed', {status: 405})
  }*/

  // build the proxy request to the external service
  const externalApiUrl = url;
  const requestBody = await request.json();
  const proxiedResponse = await fetch(externalApiUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'content-type': 'application/json'
    }
  })

  return proxiedResponse;

}

