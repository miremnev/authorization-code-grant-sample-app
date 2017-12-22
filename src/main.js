const express = require('express');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const url = require('url');
const workspace = require('genesys-workspace-client-js');
const authentication = require('genesys-authentication-client-js');

let request = require('request');

const app = express();
const routes = express.Router();

const apiUrl = "";
const apiKey = "";
const port = 8080;

const currentUser = {};

const authClient = new authentication.ApiClient();
authClient.basePath = `${apiUrl}/auth/v3`;
authClient.defaultHeaders = {
  'x-api-key': apiKey
};

routes.get('/user', (req, res) => {
    if(currentUser.authorization) {
        const api = new authentication.AuthenticationApi(authClient);
        api.getInfo(currentUser.authorization).then(data => {
            res.send(data);
        }).catch(err => {
            console.error(err);
            res.redirect(401, '/login');
        });
    }
    else {
        res.redirect(401, '/login');
    }
});

routes.post('/login', (req, res) => {
    const redirectUri = `${req.protocol}://${req.hostname}:${port}${req.path}`;
    
    const username = req.body.username;
    const password = req.body.password;
    
    const api = new authentication.AuthenticationApi(authClient);
    api.signInWithHttpInfo(username, password).then(response => {
        const data = response.body;
        console.dir(response.request.headers);
        console.dir(response.headers);
        
        const opts = {
            
        };
        //api.retrieveToken('code', opts);
        
        res.send(data);
        
    }).catch(err => {
        console.error(err);
        res.send(err);
    });
});

routes.get('/*', (req, res) => {
   res.redirect('/user'); 
});

app.use(express.static('public', {
    extensions: ['html', 'htm']
}));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);

app.listen(port, () => {
    console.info('Server started at ', port);
});