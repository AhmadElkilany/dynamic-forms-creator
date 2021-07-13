const express = require('express');
const connectDB = require('./config/db');
const Form = require('./models/Form');
const { check, validationResult } = require('express-validator');

const app = express();
// Connect to database
connectDB();
app.use(express.json({ extended: false }));

///////////// Create Required APIs ///////////////////////////

// get all forms
app.get('/', async (req, res) => {
  try {
    const forms = await Form.find();
    res.json(forms);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// create a form
app.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const newForm = new Form({
        title: req.body.title,
        description: req.body.description,
        fields: req.body.fields,
      });

      const form = await newForm.save();
      res.json(form);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// delete a form
app.delete('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ msg: 'Form not found' });
    await form.remove();
    res.json({ msg: 'Form Deleted' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId')
      return res.status(404).json({ msg: 'Form not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
