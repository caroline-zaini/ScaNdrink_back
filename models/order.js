var mongoose = require('mongoose');

var produitSchema =  mongoose.Schema({
    name: String, 
    quantity: Number,
    price: Number, 
})

var orderSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    panier: [produitSchema],
    total: String,
    status: String,
});

module.exports = mongoose.model('order', orderSchema);


