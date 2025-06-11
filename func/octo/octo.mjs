//van 25
import fetch from 'node-fetch';

exports.handler = async function(event,context,callback){
    const url='https://raw.githubusercontent.com/cmb347827/static-job-listings-master/refs/heads/main/data.json';
 
    const res = await fetch(url);
    const data = await res.json();

    callback(null,{
        statusCode:200,
        body: JSON.stringify(` in octo ${data}`),
    });


}