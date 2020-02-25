/* Script to fetch from the api with given
 *  route, method and params
 *
 *  returns freeform json object with err
 *  variable containing possible errors
 *
 *  example: callApi("login","POST",{name: 'test', password: 'test'})
 */
const callApi = async (route, method, params) => {
  const response = await fetch("/api/" + route, {
    method: method,
    body: new URLSearchParams(params)
  });
  const body = await response.json();

  if (response.status !== 200) {
    throw Error(body.err);
  }
  return body;
};

export { callApi };
