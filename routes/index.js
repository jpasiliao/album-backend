const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.json({ message: "Welcom to my API" }).end();
});

module.exports = router;
