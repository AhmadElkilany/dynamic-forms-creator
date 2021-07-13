const express = require('express');

const app = express();

//app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
