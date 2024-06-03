require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const Note = require('./models/note');
const Person = require('./models/person');

app.use(express.static('dist'));

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'});
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'});
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message});
  }

  next(error);
};

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) response.json(note);
      else response.status(404).end();
    })
    .catch((error) => next(error));
});

app.put('/api/notes/:id', (request, response, next) => {
  const {content, important} = request.body;

  const note = {content, important};

  Note.findByIdAndUpdate(request.params.id, note, {new: true, runValidators: true, context: 'query'})
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/notes', (request, response, next) => {
  const body = request.body;
  console.log(body);
  const {content, important} = body;

  const note = new Note({
    content: content,
    important: Boolean(important) || false,
  });

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((error) => next(error));
});

////

app.get('/info', (request, response, next) => {
  Person.countDocuments()
    .then((count) => {
      const phonebookEntries = `<p>PhoneBook has info for ${count} people</p>`;
      const time = `<p>${new Date()}</p>`;
      response.send(`${phonebookEntries} ${time}`);
    })
    .catch((error) => next(error));
});

app.get('/api/persons', (request, response, next) => {
  Person.find()
    .then((people) => {
      response.json(people);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) response.json(person);
      else response.status(404).end();
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
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

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.use(morgan('tiny'));
app.use(unknownEndpoint);
// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log(`Server running on port ${PORT}`);
