const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const bodyParser = require('body-parser')
const passport = require('passport')

const users = require('./routes/api/users')
const services = require('./routes/api/services')
//const cors = require('cors');


const app = express()

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// app.use(cors());
//db config
const db = require('./config/key').mongoURI;
//connect to mongodb
mongoose.connect(db)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))

//passport middleware
app.use(passport.initialize())
//passport config
require('./config/passport')(passport)

//use routes
app.use('/api/users', users)
app.use('/api/services', services)
// app.use('/api/users', users)

// app.use(async (ctx, next) => {

//   // Website you wish to allow to connect
//   ctx.set({
//     'Access-Control-Allow-Origin': '*',
//     // Request methods you wish to allow
//     'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
//     // Request headers you wish to allow
//     'Access-Control-Allow-Headers': 'X-Requested-With,content-type,authorization',
//     'Access-Control-Allow-Credentials': true,
//   });

//   if (ctx.req.method = 'OPTIONS') {
//     ctx.res.statusCode = 204;

//   }
//   // Pass to next layer of middleware
//   await next();
// });
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "localhost:3000"); // update to match the domain you will make the request from
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });


//Server static assets if in production
// if(process.env.NODE_ENV === 'production'){
//     app.use(express.static('client/build'));
//     app.get('*', (req,res)=> {
//         res.sendfile(path.resolve(__dirname, 'client', 'build', 'index.html'))
//     })
// }

app.get('/', function (req, res) {
  res.send('Hello World!!!!');
})

let port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})