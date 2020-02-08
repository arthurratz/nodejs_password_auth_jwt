var AJAXRequestWithTokenBearer = function(url, username, password, cb) {
    $.post('/token', { "username": username, "password": password }, 
        function(token) { 
            $.ajax({ url: url, method: "POST",
                headers: { "Authorization": "Bearer " + token }
              }).done((response) => {
                  return cb(token, response); 
              });
        });
}