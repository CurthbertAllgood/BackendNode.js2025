const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const generateFakeUser = async () => {
  const hashedPassword = await bcrypt.hash("coder123", 10);

  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    age: faker.number.int({ min: 18, max: 80 }),
    password: hashedPassword,
    role: faker.helpers.arrayElement(["user", "admin"]),
    pets: []
  };
};

const generateFakePet = (owners = []) => {
  return {
    name: faker.person.firstName(),
    species: faker.helpers.arrayElement(["perro", "gato", "conejo", "hurón", "pájaro"]),
    breed: faker.word.noun(), // puedes usar faker.animal.dog() si querés razas reales
    age: faker.number.int({ min: 0, max: 20 }),
    adopted: faker.datatype.boolean(),
    owner: owners.length > 0 ? faker.helpers.arrayElement(owners) : null
  };
};

const generatePets = (count = 10, owners = []) => {
  const pets = [];
  for (let i = 0; i < count; i++) {
    pets.push(generateFakePet(owners));
  }
  return pets;
};


const generateUsers = async (count = 10) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(await generateFakeUser());
  }
  return users;
};




module.exports = {
  generateUsers,
  generatePets
};



