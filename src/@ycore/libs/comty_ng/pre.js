import * as ycore from 'ycore'
var jquery = require("jquery");

export function FindUser(key, callback){
    let formdata = new FormData();
    formdata.append("server_key", ycore.yConfig.server_key);
    formdata.append("search_key", key);
    const urlOBJ = `${ycore.endpoints.find_user}${ycore.GetUserToken.decrypted().UserToken}`
    const settings = {
        "url":  urlOBJ,
        "method": "POST",
        "timeout": 10000,
        "processData": false,
        "mimeType": "multipart/form-data",
        "contentType": false,
        "data": formdata
    };
    jquery.ajax(settings)
    .done(function (response) {
        return callback(null, response);
    })
    .fail(function (response) {
        const exception = 'API Bad response';
        return callback(exception, response);
    })
}

export function SeachKeywords(key, callback){
    let formdata = new FormData();
    formdata.append("server_key", ycore.yConfig.server_key);
    formdata.append("search_key", key);
    const urlOBJ = `${ycore.endpoints.search_endpoint}${ycore.GetUserToken.decrypted().UserToken}`
    const settings = {
        "url":  urlOBJ,
        "method": "POST",
        "timeout": 10000,
        "processData": false,
        "mimeType": "multipart/form-data",
        "contentType": false,
        "data": formdata
    };
    jquery.ajax(settings)
    .done(function (response) {
        return callback(null, response);
    })
    .fail(function (response) {
        const exception = 'Request Failed';
        return callback(exception, response);
    })
}

export function GetUserPosts(id, callback) {
    let formdata = new FormData();
    formdata.append("server_key", ycore.yConfig.server_key);
    formdata.append("type", "get_user_posts");
    formdata.append("id", id)
    const urlOBJ = `${ycore.endpoints.get_user_posts}${ycore.GetUserToken.decrypted().UserToken}`
    const settings = {
        "url":  urlOBJ,
        "method": "POST",
        "timeout": 10000,
        "processData": false,
        "mimeType": "multipart/form-data",
        "contentType": false,
        "data": formdata
    };
    jquery.ajax(settings)
    .done(function (response) {
        return callback(null, response);
    })
    .fail(function (response) {
        const exception = 'Request Failed';
        return callback(exception, response);
    })
}

export function GetFeedPosts(callback) {
    let formdata = new FormData();
    formdata.append("server_key", ycore.yConfig.server_key);
    formdata.append("type", "get_news_feed");
    const requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };
    const objUrl = `${ycore.endpoints.get_userPostFeed}${ycore.GetUserToken.decrypted().UserToken}`
    fetch(objUrl, requestOptions)
      .then(response => response.text())
      .then(result => {
       return callback( null, result)
      })
      .catch(error => console.log('Load Post error => ', error))
}

export const get_app_session = {
    get_id: (callback) => {
      const fromSto = sessionStorage.getItem('se_src')
      if (!fromSto){
        ycore.DevOptions.ShowFunctionsLogs? console.log("Missing session_id, setting up...") : null
        let formdata = new FormData();
        formdata.append("server_key", ycore.yConfig.server_key);
        formdata.append("type", "get");
        const requestOptions = {
          method: 'POST',
          body: formdata,
          redirect: 'follow'
        };
        const uriObj = `${ycore.endpoints.get_sessions}${ycore.GetUserToken.decrypted().UserToken}`
        notifyProccess()
        fetch(uriObj, requestOptions)
          .then(response => response.text())
          .then(result => {
            const pre = JSON.stringify(result)
            const pre2 = JSON.parse(pre)
            const pre3 = JSON.stringify(JSON.parse(pre2)["data"])
            const obj = JSON.parse(pre3)["session_id"]
            return asyncSessionStorage.setItem('se_src', btoa(obj)).then( callback(null, obj) )
          })
        .catch(error => console.log('error', error));
      }
        ycore.DevOptions.ShowFunctionsLogs? console.log("Returning from storage") : null
        return callback( null, atob(fromSto) )
    },
    raw: (callback) => {
        const formdata = new FormData();
        formdata.append("server_key", ycore.yConfig.server_key);
        formdata.append("type", "get");
        const requestOptions = {
          method: 'POST',
          body: formdata,
          redirect: 'follow'
        };
        const uriObj = `${ycore.endpoints.get_sessions}${ycore.GetUserToken.decrypted().UserToken}`
        fetch(uriObj, requestOptions)
          .then(response => response.text())
          .then(result => {
            const pre = JSON.stringify(result)
            const parsed = JSON.parse(pre)
            const obj = JSON.parse(parsed)["data"]
            ycore.DevOptions.ShowFunctionsLogs? console.log(result, obj) : null
            return callback(null, obj)
          })
        .catch(error => console.log('error', error));
    }
}
export function PushUserData(inputIO1, inputIO2) {
  var getStoragedToken = Cookies.get('access_token');
  var yCore_GUDEP = ycore.endpoints.update_userData_endpoint;
  var urlOBJ = "" + yCore_GUDEP + getStoragedToken;
  ycore.DevOptions.ShowFunctionsLogs? console.log('Recived', global, 'sending to ', urlOBJ) : null
  var form = new FormData();
  form.append("server_key", ycore.yConfig.server_key);
  form.append(inputIO1, inputIO2);
  var settings = {
      "url": urlOBJ,
      "method": "POST",
      "timeout": 0,
      "processData": false,
      "mimeType": "multipart/form-data",
      "contentType": false,
      "data": form
  };
  jquery.ajax(settings).done(function (response) {
    ycore.DevOptions.ShowFunctionsLogs? console.log(response) : null
  });
}