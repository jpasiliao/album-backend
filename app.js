const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require("body-parser");

const indexRouter = require('./routes/index');
const healthRouter = require('./routes/health');
const photosRouter = require('./routes/photos');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/photos', express.static(path.join(__dirname, 'photos')));


app.use('/', indexRouter);
app.use('/health', healthRouter);
app.use('/photos', photosRouter);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error('Request Not Found');
        error.status = 404;
  next(error);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    error : {
      message : err.message,
    }
  })
});

module.exports = app;
