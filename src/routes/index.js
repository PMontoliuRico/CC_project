const {Router} = require('express');
const { route } = require('../app');
const router = Router();

router.get('/', (req, res) => 
    res.json({message: 'Hello World'}));

module.exports = router;