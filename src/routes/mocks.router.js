
const express = require('express');
const User = require('../models/User');
const Pet = require('../models/Pet');
const router = express.Router();
const { generateUsers, generatePets } = require('../utils/mockingUtils');


router.get('/mockingusers', async (req, res) => {
  try {
    const users = await generateUsers(50); 
    res.json({ status: 'success', payload: users });
  } catch (error) {
    console.error('Error generando usuarios fake:', error);
    res.status(500).json({ status: 'error', message: 'No se pudieron generar los usuarios' });
  }
});



router.post('/generateData', async (req, res) => {
  try {
    const { users = 10, pets = 10 } = req.body;

    const fakeUsers = await generateUsers(users);
    const createdUsers = await User.insertMany(fakeUsers);
    const ownerIds = createdUsers.map(user => user._id);
    const fakePets = generatePets(pets, ownerIds);
    const createdPets = await Pet.insertMany(fakePets);

    res.json({
      status: 'success',
      users: createdUsers.length,
      pets: createdPets.length
    });
  } catch (error) {
    console.error('❌ Error generando datos falsos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Hubo un error generando los datos'
    });
  }
});

router.get('/pets', async (req, res) => {
  try {
    const pets = await Pet.find().populate('owner', 'first_name last_name email');
    res.json({ status: 'success', payload: pets });
  } catch (error) {
    console.error('❌ Error obteniendo mascotas:', error);
    res.status(500).json({ status: 'error', message: 'No se pudieron obtener las mascotas' });
  }
});


router.get('/users', async (req, res) => {
  try {
    const users = await User.find().lean();
    res.json({ status: 'success', payload: users });
  } catch (error) {
    console.error('❌ Error al obtener usuarios desde la base de datos:', error);
    res.status(500).json({ status: 'error', message: 'No se pudieron obtener los usuarios' });
  }
});




module.exports = router;
