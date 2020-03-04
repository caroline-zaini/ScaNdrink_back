var mongoose = require('mongoose');

var options = {
    connectTimeoutMS: 5000, // si au bout de 5000ms pas de retour
    useNewUrlParser: true,  // utiliser les nelle fonctionnalités
    useUnifiedTopology : true // utiliser les nelle fonctionnalités
  }
  
 
  
  mongoose.connect('mongodb+srv://admin:azerty@cluster0-ued7e.mongodb.net/ScaNdrink?retryWrites=true&w=majority', 
      options,         
      function(err) {
       console.log(err);
      }
  );
  
  
  module.exports = mongoose