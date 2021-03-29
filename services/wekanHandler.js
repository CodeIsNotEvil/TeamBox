function connectToWekanAPI(){
    const inputBody = {
            "username": "admin",
            "password": "admin123"
          };
          const headers = {
            'Content-Type':'application/x-www-form-urlencoded',
           'Accept':'*/*'
          };
          
          fetch('http://teambox.local:2000/users/login',
          {
            method: 'POST',
            body: JSON.stringify(inputBody),
            headers: headers
          })
          .then(function(res) {
              return res.json();
          }).then(function(body) {
              console.log(body);
          });
}

connectToWekanAPI();