const mongoose = require('mongoose');

// define a schema
const PlayerModelSchema = new mongoose.Schema ({
  name 			: String,
  googleid      : String,
  email			: String,
});

// compile model from schema
module.exports = mongoose.model('PlayerModel', PlayerModelSchema);