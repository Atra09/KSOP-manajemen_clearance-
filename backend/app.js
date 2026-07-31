require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var { db, configDb } = require("./config/db")
var { 
  agen, 
  kabupaten, 
  kecamatan, 
  negara, 
  jenis, 
  kapal, 
  kategoriMuatan, 
  muatan, 
  nahkoda, 
  perjalanan, 
  pelabuhan,
  spb,
  jenisMuatan,
  pembayaran
} = require('./model/association')
var verifyToken = require(`./middleware/jwt`)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var logUserRouter = require('./routes/logUser');
var nahkodaRouter = require('./routes/nahkoda')
var agenRouter = require('./routes/agen')
var spbRouter = require('./routes/spb')
var negaraRouter = require('./routes/negara')
var provinsiRouter = require('./routes/provinsi')
var kabupatenRouter = require('./routes/kabupaten')
var kecamatanRouter = require('./routes/kecamatan')
var jenisRouter = require('./routes/jenis')
var kategoriMuatanRouter = require('./routes/kategoriMuatan')
var jenisMuatanRouter = require('./routes/jenisMuatan')
var kapalRouter = require('./routes/kapal')
var perjalananRouter = require('./routes/perjalanan')
var pelabuhanRouter = require('./routes/pelabuhan')

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

(async () => {
  try {
    // await db.query('SET FOREIGN_KEY_CHECKS = 0');
    // await db.sync({ force: true });
    // await db.query('SET FOREIGN_KEY_CHECKS = 1');
    configDb()
    console.log("berhasil sync")
  } catch (error) {
    console.log(error)
  }
})()

app.use('/users', usersRouter);

app.use(verifyToken)
app.use('/', indexRouter);
app.use('/nahkoda', nahkodaRouter);
app.use('/agen', agenRouter);
app.use('/spb', spbRouter);
app.use('/negara', negaraRouter);
app.use('/provinsi', provinsiRouter);
app.use('/kabupaten', kabupatenRouter);
app.use('/kecamatan', kecamatanRouter);
app.use('/jenis', jenisRouter);
app.use('/kategori-muatan', kategoriMuatanRouter);
app.use('/jenis-muatan', jenisMuatanRouter);
app.use('/kapal', kapalRouter);
app.use('/perjalanan', perjalananRouter);
app.use('/pelabuhan', pelabuhanRouter);
app.use('/log-user', logUserRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
