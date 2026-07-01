const express = require('express');
const router = express.Router();

const { 
  createTrainee, 
  getTrainees, 
  updateTrainee, 
  deleteTrainee 
} = require('../controllers/userController');

// Route to create a new trainee account
router.post('/trainees', createTrainee);

// Route to fetch the list of all trainees
router.get('/trainees', getTrainees);

// Routes to update and delete specific trainees by their ID
router.put('/trainees/:id', updateTrainee);
router.delete('/trainees/:id', deleteTrainee);

module.exports = router;