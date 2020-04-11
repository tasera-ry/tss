/* Script to fetch from the api with given
 *  route, method and params
 *
 *  returns freeform json object with err
 *  variable containing possible errors
 *
 *  example: callApi("POST","login",{name: 'test', password: 'test'})
 *           callApi("GET","tracks/2020-02-20")
 */
const callApi = async (method, route, params) => {
  let response;
  
  if(method === "GET"){
    response = await fetch("/api/" + route, {method:method});
  }
  else{
    response = await fetch("/api/" + route, {
      method: method,
      body: new URLSearchParams(params)
    });
  }
  const body = await response.json();

  // TODO any other method call except ones returning status === 200 won't work
  if (response.status !== 200) {
    throw Error(body.err);
  }
  return body;
};

export { callApi };
