const express = require('express');
const bodyParse = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const socket = require('socket.io');
const { createServer } = require('http');
const ior = require('socket.io-request');

const app = express();
app.use(bodyParse.urlencoded({ extended: true }));
app.use(bodyParse.json());
app.use(cors());
app.use(logger('dev'));

app.all('/', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE.OPTIONS');
  res.setHeader('Content-Type', 'application/json;  charset=utf-8');
  res.setHeader('x-ver', '1.0');
  next();
});

app.get('/', (req, res) => {
  res.send('welcome to api');
});

app.post('/time', (req, res) => {
  res.send(req.body);
})

app.use((req, res) => {
  res
    .status(404)
    .send({
      'error': {
        'error': 'RequestNotFound',
        'message': 'the path don´t exists, try another'
      }
    })
});

const server = createServer(app);

const io = socket(server);

io.on('connection', (client) => {
  client.on('connected', (obj) => {
    const response = Object.assign({}, obj, { id: client.id, type: 'connect' })
    process.send(response);
  });

  client.on('disconnect', () => {
    console.log(`Cliente Desconectado  ${client.id}`);
  });

  ior(client).response('request', function (req, res) {
    console.log(req);
    res(Object.assign({ nota: 'Enviado desde el server' }, req));
  });

});

process.on('message', (msg) => {
  io.emit('message', JSON.parse(msg));
});

server.listen(8000, () => {
  //process.send({ type: 'message', msg: 'Workwer conectado' });
});