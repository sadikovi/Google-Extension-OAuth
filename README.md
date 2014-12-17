Google-Extension-OAuth
======================

Google OAuth library for extensions

#### What is it
It is a Google OAuth library for extensions, though can be easily edited to support any others.
You have to add three files:

  <strong>tokenstore.js</strong> - stores and retrieves files from local storage<br/>
  <strong>reqmanager.js</strong> - general request methods, like encoding/decoding adding url parameters<br/>
  <strong>oauth.js</strong> - provides authentication methods

#### How to use
You can see files in "additions" to see how to use this library.

<strong>start.js</strong> is a background script that runs once browser is loaded.<br/>
<strong>api.js</strong> contains Gmail API to use, also has methods to send batch requests and parse batch requests results.

#### OAuth (oauth.js)
To authorize application you have to fill <strong>oauth</strong> object
<pre>
var oauth = {
    request_url: 'https://accounts.google.com/o/oauth2/auth',
    exchange_url: 'https://www.googleapis.com/oauth2/v3/token',
    check_url: 'https://www.googleapis.com/oauth2/v1/tokeninfo',
    client_id: 'client_id',
    client_secret: 'client_secret',
    scope: 'https://www.googleapis.com/auth/gmail.modify',
    response_type: 'code',
    redirect_uri: 'http://localhost/'
};
</pre>

After that you can perform authorization call (i.e. on content loaded action)
<pre>
  document.addEventListener('DOMContentLoaded', function () {
      OAuth.authorize(success, error);
  });
</pre>

<strong>success</strong> callback returns access token as a parameter and <strong>error</strong> callback returns error message (you may want to parse it as json object).

If you want deauthorize app, just call
<pre>
  OAuth.deauthorize(after);
</pre>
where <strong>after</strong> is callback function that is called straight after app is deauthorized.

If you want to check access token before sending any requests, call:
<pre>
  /**
  * Checks access token stored in TokenStore by sending request to googleapis.
  *       If request returns 200 OK - no need to update token, otherwise, tells that token is invalid.
  * @param {Function} success A callback function for successful request (returns existing access token).
  * @param {Function} error A callback function for failed request/refresh required (returns error message).
  */
  OAuth.checkAccessToken(success, error);
</pre>

There is also function to check and refresh access token if necessary
<pre>
  /**
  * Checks access token and refreshes it if necessary. If it is impossible to refresh error function called.
  * @param {Function} success A callback function for successful request - no refresh needed/new access token obtained.
  * @param {Function} error A callback function for failed request/refresh request.
  */
  OAuth.checkAndRefreshAccessToken(success, error);
</pre>

In case of refreshing access token, it is saved and returned in success callback. Error callback is called when it is impossible to refresh.

#### Token Store (tokenstore.js)
If you need to get current access and refresh tokens (or set them) call:
<pre>
  // get access token
  TokenStore.getAccessToken(client_id, scope);
  // get refresh token
  TokenStore.getRefreshToken(client_id, scope);
  // set access token
  TokenStore.setAccessToken(client_id, scope);
  // set refresh token
  TokenStore.setAccessToken(client_id, scope);
</pre>

Client id and scope can be provided by <strong>oauth</strong> object:
<pre>
  // get access token
  TokenStore.getAccessToken(oauth.client_id, oauth.scope);
</pre>

#### ReqManager(reqmanager.js)
Contains general methods to work with url - sending requests (including batch requests), adding and retrieving url parameters and etc.

Again, to use those files, just have a look at <strong>additions/api.js</strong> and <strong>start.js</strong>.

#### Perform batch request and process response
It currently supports only GET requests.
##### Building request body
First of all you have to build parts of the request, which is an object and can look like this:

<strong>{content_type: "#", url: "#", method: "#"}</strong>

For example:
<pre>
  {
    content_type: "application/http", 
    url: "https://www.googleapis.com/gmail/v1/users/userId/labels", 
    method: "GET"
  }
</pre>

Call method <strong>ReqManager.buildBatchRequestBody(parts)</strong> passing array of those objects as a parameter.
Then call <strong>ReqManager.sendRequest</strong> to send a batch request.

##### Sending and parsing results
To minimize all those steps of ReqManager <strong>api.js</strong> provides methods to send and parse batch results.

<pre>
  API.sendBatchRequest(url, access_token, parts, success, error);
</pre>
where url is a url you want to send a batch request, access_token is a valid access token, parts is an array of part objects (see above), success is a success callback function that returns an array of responses that are already parsed into objects, error is a error callback.

api.js uses helper methods, but you can use them as well:

Parsing request body:
<pre>
  API.parseResponseBody(body);
</pre>

Helper function to parse header into key-multivalue pair, separated by ";".
<pre>
  API.parseHeader(header);
</pre>
