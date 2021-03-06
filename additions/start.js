// init global parameters
window.list_checkTimer = null;
window.list_errorTimer = null;
window.list_checkTimerInterval = 5*60; // in seconds
window.list_maxResults = 5;

var BrowserAction = (function() {
    return {
        setBrowserAction: function(isAuth, text, color) {
            var image = (isAuth)?"images/icon38.png": "images/icon_off38.png";
            chrome.browserAction.setIcon({"path":image}, function(){});
            chrome.browserAction.setBadgeText({ "text": text });
            if (color) {
                chrome.browserAction.setBadgeBackgroundColor({ "color": color });
            }
        },

        getUnreadThreads: function(access_token, prev, success, error) {
            if (prev) {
                prev.call(this);
            }
            API.getInboxUnreadMailThreads(access_token, window.list_maxResults, function(result) {
                success.call(this, result);
            }, function(errmsg) {
                error.call(this, errmsg);
            });
        },

        checkUnreadThreads: function(access_token, success, error) {
            BrowserAction.getUnreadThreads(access_token, function() {
                BrowserAction.setBrowserAction(true, "...", "#777");
            }, function(result) {
                var list = JSON.parse(result);
                if (list["threads"] && list["resultSizeEstimate"]) {
                    var estimatedResults = list["resultSizeEstimate"];
                    var listBadge = list["threads"].length;
                    if (listBadge > 0) {
                        BrowserAction.setBrowserAction(true, ""+listBadge+((listBadge >= estimatedResults)?"":"+"), "#333");
                        if (success) {
                            success.call(this, list["threads"]);
                        }
                        return false;
                    }
                }
                BrowserAction.setBrowserAction(true, "", null);
                if (success) {
                    success.call(this, []);
                }
            }, function(errmsg) {
                BrowserAction.setBrowserAction(false, "", null);
                if (error) {
                    error.call(this, errmsg);
                }
            });
        }
    }
})();

// checks unread messages and refreshes token if necessary
function checkUnread(access_token) {
    BrowserAction.checkUnreadThreads(access_token, null, function(response) {
        console.log("There was an error and we are checking refresh token");
        OAuth.checkAndRefreshAccessToken(function(access_token) {
            console.log("Access token is renewed: " + access_token);
            console.log("Check unread threads with new access token");
            console.log("this is access token stored: " + TokenStore.getAccessToken(oauth.client_id, oauth.scope));
            BrowserAction.checkUnreadThreads(access_token, null, function(response) {
                console.log("Check after obtaining new access token has failed. Called global authorization");
                OAuth.authorize(success, error);
            });
        }, function(response) {
            console.log("We could not obtain new access token, therefore we started authorization");
            OAuth.authorize(success, error);
        });
    });
}

// clears timer
function clearTimer(timer) {
    clearInterval(timer);
    timer = null;
}

// success function for authorization
function success(access_token) {
    BrowserAction.setBrowserAction(true, "", null);
    BrowserAction.checkUnreadThreads(access_token, null, null);
    clearTimer(window.list_errorTimer);
    clearTimer(window.list_checkTimer);

    window.list_checkTimer = setInterval(
        function() { checkUnread(TokenStore.getAccessToken(oauth.client_id, oauth.scope)); },
        window.list_checkTimerInterval*1000
    );
}

// error function for authorization
function error(errmsg) {
    BrowserAction.setBrowserAction(false, "", null);
    console.log("Error: " + errmsg);
    clearTimer(window.list_checkTimer);
    if (!window.list_errorTimer) {
        window.list_errorTimer = setInterval(function() {
            OAuth.authorize(success, error);
            console.log("Another try...");
        }, 5000);
    }
}

// set "off" icon and empty badge
BrowserAction.setBrowserAction(false, "", null);
// ...and add event listener
document.addEventListener('DOMContentLoaded', function () {
    OAuth.authorize(success, error);
});

/*
chrome.browserAction.onClicked.addListener(function() {
    var access_token = TokenStore.getAccessToken(oauth.client_id, oauth.scope);
    checkUnread(access_token);
});
*/
