const peopleRouter = require('express').Router();
const Person = require('../models/person');

peopleRouter.get('/info', (request, response, next) => {
  Person.countDocuments()
    .then((count) => {
      const phonebookEntries = `<p>PhoneBook has info for ${count} people</p>`;
      const time = `<p>${new Date()}</p>`;
      response.send(`${phonebookEntries} ${time}`);
    })
    .catch((error) => next(error));
});

peopleRouter.get('/', (request, response, next) => {
  Person.find()
    .then((people) => {
      response.json(people);
    })
    .catch((error) => next(error));
});

peopleRouter.get('/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) response.json(person);
      else response.status(404).end();
    })
    .catch((error) => next(error));
});

peopleRouter.delete('/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

peopleRouter.post('/', (request, response, next) => {
  console.log(request.body);
  const body = request.body;

  if (!body) {
    return response.status(400).json({
      error: 'content missing',
    });
  }

  const {name, number} = body;

  if (!name || !number) {
    return response.status(400).json({
      error: 'name and number are required',
    });
  }

  const person = new Person({name, number});

  person
    .save()
    .then((result) => {
      console.log(`added ${result.name} number ${result.number} to phonebook`);
      response.json(person);
    })
    .catch((error) => next(error));
});

peopleRouter.put('/:id', (request, response, next) => {
  const {name, number} = request.body;

  const person = {name, number};

  Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true, context: 'query'})
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

module.exports = peopleRouter;
