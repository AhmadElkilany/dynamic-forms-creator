const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FormSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  fields: {
    type: [String],
    required: true,
    default: ['Full Name', 'Phone Number'],
  },
});

module.exports = Form = mongoose.model('form', FormSchema);
