'use strict';

const Router = require('express').Router;
const HandleError = require('../controller/errhandler');
const UserSchema = require('../models/userschema');
const drugUserRouter = require('./drug_user_route');
const jsonParser = require('body-parser').json();
const carrierHandler = require('../controller/carrierhandler');
const BasicHTTP = require('../lib/http_handle');

let userRouter = Router();

userRouter.post('/newUser', jsonParser, function(req, res, next) {
  let errz = HandleError(400, next, 'Nope');
  if(!req.body.carrier || !req.body.phoneNumber || !req.body.username || !req.body.password){
    return errz();
  }
  let email = carrierHandler(req.body.phoneNumber, req.body.carrier);
  let newUser = new UserSchema({'phoneNumber': req.body.phoneNumber, 'carrier': req.body.carrier, 'phoneEmail': email});
  newUser.basic.username = req.body.username;
  newUser.basic.password = req.body.password;
  newUser.createHash(req.body.password)
    .then((token) => {
      newUser.save().then(() =>{ res.json(token);}, HandleError(400, next));
    }, HandleError(401, next, 'Server Error'));
});

userRouter.get('/allUsers', function(req, res, next) {
  UserSchema.find().then(res.json.bind(res), HandleError(400, next, 'Server Error'));
});

userRouter.get('/signin', BasicHTTP, function(req, res, next) {
  let DBError = HandleError(400, next, 'invalid id');
  let Err404 = HandleError(404, next, 'could not authorize bitches');
  if(!req.auth.username || !req.auth.password) return Err404();
  UserSchema.findOne({'basic.username': req.auth.username})
    .then((user) => {
      if (!user) return HandleError(401, next, 'COuld not Authorize');
      user.comparePass(req.auth.password)
        .then(res.json.bind(res), Err404);
    }, DBError);
});

userRouter.use('/:userId/drug', drugUserRouter);

module.exports = exports = userRouter;
