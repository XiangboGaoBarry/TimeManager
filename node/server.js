const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');
const cors = require('cors');
const normalEvents = require('./EventsOperator/normalEvents');
const fixedEvents = require('./EventsOperator/fixedEvents');
const restEvents = require('./EventsOperator/restEvents');

app.use(bodyParser.json());
app.use(cors());

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'bar',
    password : '',
    database : 'timeManagerDB'
  }
});

app.post('/', normalEvents.getNormalEvents(db))
app.delete('/delete', normalEvents.deleteNormalEvents(db))
app.post('/enter', normalEvents.addNormalEvents(db))
app.delete('/deleteAll', normalEvents.deleteAllNormalEvents(db))

app.post('/fixed', fixedEvents.getFixedEvents(db))
app.delete('/fixedDelete', fixedEvents.deleteFixedEvents(db))
app.post('/fixedEnter', fixedEvents.addFixedEvents(db))
app.delete('/fixedDeleteAll', fixedEvents.deleteAllFixedEvents(db))

app.post('/rest', restEvents.getRestEvents(db))
app.delete('/restDelete', restEvents.deleteRestEvents(db))
app.post('/restEnter', restEvents.addRestEvents(db))
app.delete('/restDeleteAll', restEvents.deleteAllRestEvents(db))





const userServer = require('./UserServer/UserServer');
app.post('/login', userServer.login(db))
app.post('/register', userServer.register(db))


app.listen(3000,()=>{
	console.log('app is running on port 3000');
})