//
// Violet.RESTRequest
//

(function(Violet) {
  var Util = Violet.Util;
  var HTTPClient = Violet.HTTPClient;
  var restBaseURI = 'https://api.twitter.com/1.1/';
  var uploadBaseURI = 'https://upload.twitter.com/1.1/';

  var RESTRequest = function(method, endpoint, responseProc, multipart, accounts) {
    var apiBaseURI = (multipart)? uploadBaseURI : restBaseURI;
    var reqThis = {callback: function(){}, errorback: function(){}};
    var reqFunction =  function(data, accountId) {
      accountId = accountId || accounts.getPrimary().accountId;
      var path = Util.resolveEndpoint(endpoint, data);
      var uri = apiBaseURI + path + '.json';

      var oauth = accounts.getOAuthManager(accountId);
      var conn = new HTTPClient({
        method: method,
        uri: uri,
        data: data,
        multipart: multipart
      });

      conn.setOAuthHeader(oauth.obtainOAuthParams(conn, multipart));
      conn.addEventListener('load', function(xhr) {
        var response = [JSON.parse(xhr.responseText)];
        if (xhr.status === 200) {
          if (typeof responseProc === 'function') {
            response = responseProc.apply(null, response);
          }
          this.callback.apply(null, response);
        } else {
          this.errorback.apply(null, response);
        }
      }.bind(this));

      conn.start();
    }.bind(reqThis);

    reqFunction.on = function(event, callback) {
      if (event === 'success') {
        this.callback = callback;
      } else if (event === 'error') {
        this.errorback = callback;
      }
    }.bind(reqThis);

    return reqFunction;
  };

  Violet.RESTRequest = RESTRequest;
})(Violet);