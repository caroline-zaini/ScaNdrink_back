var express = require('express');
var router = express.Router();

// générer une chaîne de caractère aléatoie :
var uid2 = require("uid2");

// Import du module pour encrypter en sha256 :
var SHA256 = require("crypto-js/sha256");

// - Import du module pour encoder en base 64 (64 caractère) :
var encBase64 = require("crypto-js/enc-base64");


var usersModel = require('../models/user')






/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



  router.post('/inscription', async function(req, res, next) {
    console.log("Hello Back")
    console.log('req.body.firstNameFromFront', req.body.firstNameFromFront)

    var result = false;
    var user = null;
    var error = [];
    var token = null;
    var salt = uid2(32);

    const emailExist = await usersModel.findOne({
      email: req.body.emailFromFront
    });

    if(emailExist != null){
      error.push('utilisateur déjà présent')
    }

    if(req.body.firstNameFromFront == ''
  || req.body.lastNameFromFront == ''
  || req.body.emailFromFront == ''
  || req.body.phoneFromFront == ''
  || req.body.passwordFromFront == ''
  ){
    error.push('champs vides')
  }

  if(error.length == 0) {
    var newUser = new usersModel ({
      firstName: req.body.firstNameFromFront,
      lastName: req.body.lastNameFromFront,
      email: req.body.emailFromFront,
      phone: req.body.phoneFromFront,
      salt: salt,
      password: SHA256(req.body.passwordFromFront + salt).toString(encBase64),
      token: uid2(32)
    })

    var saveUser = await newUser.save()

    if(saveUser){
      result = true
      token = saveUser.token
    }

  }

    res.json({result, saveUser, error, token})
    
    });


module.exports = router;
