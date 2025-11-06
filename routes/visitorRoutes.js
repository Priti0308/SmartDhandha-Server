const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

// GET all visitors: /api/visitors
router.get('/', visitorController.getVisitors);

// POST a new visitor: /api/visitors
router.post('/', visitorController.addVisitor);

// PUT to update a visitor: /api/visitors/:id
router.put('/:id', visitorController.updateVisitor);

module.exports = router;