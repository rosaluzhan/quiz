var users = { admin: {id:1, username:"admin", password:"1234"}, 
              pepe:  {id:2, username:"pepe",  password:"5678"},
              marta: {id:3, username:"marta",  password:"eva"},
              rosa:  {id:4, username:"rosa",  password:"losa"},
            };

// Comprueba si el usuario esta registrado en users
// Si autenticación falla o hay errores se ejecuta callback(error).
exports.autenticar = function(login, password, callback) {
    if(users[login]){
        if(password === users[login].password){
            callback(null, users[login]);
        }
        else { callback(new Error('Password erróneo.')); }
    } else { callback(new Error('No existe el usuario.'));}
};