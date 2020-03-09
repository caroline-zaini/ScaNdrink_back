var express = require('express');
var router = express.Router();

// générer une chaîne de caractère aléatoie :
var uid2 = require("uid2");

// Import du module pour encrypter en sha256 :
var SHA256 = require("crypto-js/sha256");

// - Import du module pour encoder en base 64 (64 caractère) :
var encBase64 = require("crypto-js/enc-base64");

var usersModel = require('../models/user')
var ProUserModel = require('../models/qrcode')



/* GET inscription page. */
  router.post('/inscription', async function(req, res, next) {

    console.log("Hello Back Inscription")
    console.log('req.body.firstNameFromFront', req.body.firstNameFromFront)

    var result = false;
    var saveUser = null
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
    error.push('Un des champs est vide')
  }

  if(error.length == 0) {
    
    console.log('1. req.body.email_inscription :', req.body.email_inscription);
    console.log('2. password_inscription:', req.body.password_inscription);

    var newUser = new usersModel ({
      firstName: req.body.firstNameFromFront,
      lastName: req.body.lastNameFromFront,
      email: req.body.email_inscription,
      phone: req.body.phoneFromFront,
      password: SHA256(req.body.password_inscription+salt).toString(encBase64), 
      token: uid2(32),
      salt: salt,
    })
    

    var saveUser = await newUser.save()

    console.log('3.bdd email inscription :', newUser.email_inscription);
    console.log('4.bdd password inscription', newUser.password_inscription);
    console.log('5. bdd salt inscription :', newUser.salt);

    if(saveUser){
      result = true
      token = saveUser.token
    }
   
  } 

   res.json({result, saveUser, error, token})

  });




  
/* GET connexion page. */
router.post('/connexion', async function(req, res, next) {

  console.log('Hello Back connexion', req.body.email_connexion);

  var result = false
  var user = null
  var error = []
  var token = null
  var salt = uid2(32);

  if(req.body.email_connexion == ''
  || req.body.password_connexion == ''
  ){
    error.push('Un champs est vide')
    console.log('error :', error);
  }


  if(error.length == 0){
      user = await usersModel.findOne({email: req.body.email_connexion})
  }

  console.log('user :', user);
  
  if (user) {
    

    var passwordEncrypt =  SHA256(req.body.password_connexion + user.salt).toString(encBase64) 

    console.log('salt bdd :', user.salt);
    console.log('passwordEncrypt :', passwordEncrypt);
    console.log('password bdd :', user.password);

    if (passwordEncrypt === user.password) {
      result = true
      token = user.token 
      res.json({result, user, error, token})
    } else {
      result = false
      error.push('Mot de passe incorrect')
      res.json({result, error, token})
    }
  
  } else {
    error.push('email incorrect')
  }

  


});


/* GET QR code informations. */

router.post('/qrcode', async function(req, res, next) {

  console.log("test",req.body.qrCodeFromFront)



  const findQrcode = await ProUserModel.find({
   'table.tableToken' : req.body.qrCodeFromFront
  });
  console.log('TEST_________________',findQrcode)


  res.json({findQrcode})
  });






module.exports = router;
