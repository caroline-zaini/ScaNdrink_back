var express = require('express');
var router = express.Router();

/**
 * model's import :
 */
var usersModel = require('../models/user')
var ordersModel = require('../models/order')
var ProUserModel = require('../models/qrcode')

/**
 * crypte the password and token :
 */
var uid2 = require("uid2");
var SHA256 = require("crypto-js/sha256");
var encBase64 = require("crypto-js/enc-base64");






/* 
 * GET inscription page : 
 */
  router.post('/inscription', async function(req, res, next) {


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


    if(saveUser){
      result = true
      token = saveUser.token
  
    }
   
  } 

  var idUser = saveUser._id
 

  console.log('idUser back_inscription:', idUser);

   res.json({result, saveUser, error, token, idUser})

  });



/* 
 * GET connexion page : 
 */
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

    if (passwordEncrypt === user.password) {
      result = true
      token = user.token 
      var idUser = user._id
      res.json({result, user, error, token, idUser})
    } else {
      result = false
      error.push('Mot de passe incorrect')
      res.json({result, error, token})
    }
  
  } else {
    error.push('email incorrect')
  }

  console.log('idUser route connexion :', idUser);

});




/* 
 * GET mon Paiment page. 
 */

router.post('/monPaiement', async function(req, res, next) {

  console.log('route monPaiement');

  var result = false;
  var panierBack = JSON.parse(req.body.panierSend)
  var status = 'Payed'

  console.log('panierBack :', panierBack);
  

  var newOrder = new ordersModel ({
    userId: { _id: req.body.idUser},
    panier: panierBack,
    total: req.body.total,
    status: status
  })


  var saveOrder = await newOrder.save()

 
  if(saveOrder) {
    result = true;

  }

  res.json({result, saveOrder})
  
  });


/* 
 * GET order informations. 
 */
  router.post('/order', async function(req, res, next) {

    console.log('order in back :');

    var order = await ordersModel.findOne({userId: req.body.idUser})
  
    console.log('order in back:', order.status);
  
    res.json({ result:true, status: order.status })
  
  });


/* 
 * GET QR code informations. 
 */

router.post('/qrcode', async function(req, res, next) {

  console.log("test",req.body.qrCodeFromFront)



  const findQrcode = await ProUserModel.find({
   'table.tableToken' : req.body.qrCodeFromFront
  });
  console.log('TEST_________________',findQrcode)


  res.json({findQrcode})
  });






module.exports = router;
