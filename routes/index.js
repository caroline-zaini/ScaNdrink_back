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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET inscription page. */
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




  
/* GET connexion page. */
router.get('/connexion', async function(req, res, next) {

  var result = false
  var user = null
  var error = []
  var token = null

  if(req.body.emailFromFront == ''
  || req.body.passwordFromFront == ''
  ){
    error.push('champs vides')
  }


  if (error.length == 0) {
    const user = await usersModel.findOne({
      email: req.body.emailFromFront,
    })
  }

  if (user) {
    const passwordEncrypt = SHA256(req.body.passwordFromFront + user.salt).toString(encBase64)
  
    if (passwordEncrypt == user.password) {
      result = true
      token = user.token 
    } else {
      result = false
      error.push('mot de passe incorrect')
    }
  
  } else {
    error.push('email incorrect')
  }

  res.json({result, user, error, token})


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
