var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    produit: [{name: String, price: String, quantity: String}],
    total: String,
});

module.exports = mongoose.model('order', orderSchema);


