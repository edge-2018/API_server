const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

let server, corsOptions;
switch(process.env.NODE_ENV){
  case 'development':    
    process.env.socketServer = "http://localhost:9014/api";
    corsOptions = {
      origin: 'http://localhost:9012',
      credentials : true  
    };
    app.use(cors(corsOptions));
    server = http.Server(app);    
    break;

  case 'production':
    process.env.socketServer = "https://dna.soyoungpark.me:9014/api";
    corsOptions = {
      origin: 'https://dna.soyoungpark.me:9012',
      credentials : true
    };
    app.use(cors(corsOptions));
    // Certificate
    try {
      const privateKey = fs.readFileSync('../SSL/privkey.pem', 'utf8');
      const certificate = fs.readFileSync('../SSL/cert.pem', 'utf8');
      const ca = fs.readFileSync('../SSL/chain.pem', 'utf8');

      const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
      };
      
      server = https.Server(credentials, app);
    } catch (error) {
      console.log(error);
    }
    break;

  default:
    return;
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

require('dotenv').config();
global.utils = require('./utils/global');
require('./routes')(app);

server.listen(process.env.PORT, process.env.HOST, () => {
  console.info('[DNA-WASApiServer] Listening on port %s at %s', 
  process.env.PORT, process.env.HOST);
});

module.exports = app;