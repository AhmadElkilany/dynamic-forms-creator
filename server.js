const express = require('express');
const multer = require('multer');
var fs = require('fs');
var path = require('path');
const connectDB = require('./config/db');
const Form = require('./models/Form');
const { check, validationResult } = require('express-validator');

const app = express();
// Connect to database
connectDB();
app.use(express.json({ extended: false }));

const fileFilter = (req, file, cb) => {
  //only accept images
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
    cb(null, true);
  else cb(null, false);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    //only accept files <= 4MB
    fileSize: 1024 * 1024 * 4,
  },
  fileFilter: fileFilter,
});

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

// get a form
app.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ msg: 'Form Not Found' });
    res.json(form);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// create a form
app.post(
  '/',
  upload.single('image'),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('fields', 'Fields are required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const newFields = req.body.fields;
    if (
      !(newFields.includes('Full Name') && newFields.includes('Phone Number'))
    ) {
      return res
        .status(400)
        .json({ errors: 'Full name and phone number are required' });
    }
    if (!req.file) {
      return res.status(400).json({ errors: 'Image is required' });
    }
    try {
      console.log(req.file);
      const newForm = new Form({
        title: req.body.title,
        description: req.body.description,
        image: {
          data: fs.readFileSync(
            path.join(__dirname + '/uploads/' + req.file.filename)
          ),
          contentType: req.file.mimetype,
        },
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

// update a form
app.put('/:id', upload.single('image'), async (req, res) => {
  const image = req.file;
  const fields = req.body.fields;
  const title = req.body.title;
  const description = req.body.description;
  const updateFields = {};
  if (image) {
    updateFields.image = {
      data: fs.readFileSync(
        path.join(__dirname + '/uploads/' + req.file.filename)
      ),
      contentType: req.file.mimetype,
    };
  }
  if (fields) updateFields.fields = fields;
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  try {
    let form = await Form.findOne({ _id: req.params.id });
    if (form) {
      form = await Form.findOneAndUpdate(
        { _id: req.params.id },
        { $set: updateFields }
      );
      return res.json(form);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
