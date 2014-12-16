Google-Extension-OAuth
======================

Google OAuth library for extensions

### What is it
It is a Google OAuth library for extensions, though can be easily edited to support any others.
You have to add three files:

  <strong>tokenstore.js</strong>
  
  <strong>reqmanager.js</strong>
  
  <strong>oauth.js</strong>

### How to use
You can see files in "additions" to see how to use this library.

<strong>start.js</strong> is a background script that runs once browser is loaded.

<strong>api.js</strong> contains Gmail API to use, also has methods to send batch requests and parse batch requests results.

### OAuth
To authorize application you have to fill oauth file
<pre>
/** oauth object with all the necessary information including:
 *      request_url: to obtain code
 *      exchange_url: to exchange code on access token
 *      check_url: to check whether access token is valid or not
 *      clien_id: a client id of the application
 *      client_secret: a client secret of the application
 *      scope: a permission you are obtaining
 *      response_type: a authorization parameter when you are exhange code on token
 *      redirect_uri: url for redirection
 */
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

success callback returns access token as a parameter and error callback returns error message (you may want to parse it as json object).

If you want deauthorize app, just call
<pre>
  OAuth.deauthorize(afterCallback);
</pre>


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

###Token Store
If you need to get current access and refresh tokens (or set them) call:
<pre>
  TokenStore.getAccessToken(client_id, scope);
  TokenStore.getRefreshToken(client_id, scope);
  
  TokenStore.setAccessToken(client_id, scope);
  TokenStore.setAccessToken(client_id, scope);
</pre>
