const crypto = require('crypto');
const { default: knex } = require('knex');
var model = require ('../models/user.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const root = path.join(__dirname, '..');
const { sendEmail } = require('../mailer.js');

const config = require(path.join(root, 'config', 'config'));

async function hash(password) {
  return bcrypt.hash(password, config.bcrypt.hashRounds);
}

const controller = {

  //controller to check whether the given e-mail address can be found from the database
  check: async function checkEmail(req, res) {

    var email = req.body.email;

    if (email === '') {
      res.status(400).send('email required');
    }
    try {
      const user = await model.read({email: email}) //compares given e-mail to the db using models/user.js
      
      if (user === undefined || user.length == 0) {
        res.status(403).send('email not in db');
      }

      else {

        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpire = Date.now() + 3600000;

        await model.update({email: email}, {reset_token: token});
        await model.update({email: email}, {reset_token_expire: tokenExpire});
        
        await sendEmail('password_reset', user[0].email, {token})
        res.status(200).json('recovery email sent');
      }
    } catch (err) {
      console.error('there was an error: ', err);
    }
  },

  //Verifies reset token
  verify: async function verifyToken(req, res) {

    var token = req.query.reset_token;

    model.read({reset_token: token})
      .then((user) => {
        if (user === undefined || user.length == 0) {
          res.status(403).send('password reset link is invalid');
        }
        else if (Date.now() > user[0].reset_token_expire) {
          res.status(403).send('password reset token has expired');
        } 
        else {
          res.status(200).send({
            username: user[0].name,
            token_expires: user[0].reset_token_expire,
            message: 'password reset link a-ok',
          });
        }
      });
  },

  //Updates user password
  update: async function updatePassword(req, res) {

    model.read({
      name: req.body.username,
      reset_token: req.body.reset_token,
    }).then(user => {
      if (user === undefined || user.length == 0) {
        res.status(403).send('password reset link is invalid or has expired');
      } else if (user != null && user.length > 0) {
        hashPassword();
        
        async function hashPassword() {
          const digest = await hash(req.body.newPassword);
          delete req.body.newPassword;
          req.body.digest = digest;
          model.update({name: req.body.username}, {digest: req.body.digest});
          model.update({name: req.body.username}, {reset_token: null});
          model.update({name: req.body.username}, {reset_token_expire: null});

          res.status(200).send({message: 'password updated'});
        }
      } else {
        res.status(401).json('no user exists in db to update');
      }
    })
  }
}

module.exports = controller;