const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const morgan = require('morgan');

const indexRouter = require('./routes/index');
const tournamentRouter = require('./app/tournaments/tournamentRoutes');

const app = express();

require('dotenv').config();

app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/tournament', tournamentRouter);

module.exports = app;
