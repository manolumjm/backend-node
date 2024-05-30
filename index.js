const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

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

app.use(cors());
app.use(express.static('dist'));

let notes = [
  {
    id: 1,
    content: 'HTML is easy',
    important: true,
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
];

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
  response.json(notes);
});

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  const note = notes.find((note) => note.id === id);
  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter((note) => note.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post('/api/notes', (request, response) => {
  const body = request.body;
  const {content, important} = body;

  if (!content) {
    return response.status(400).json({
      error: 'content missing',
    });
  }

  const note = {
    content: content,
    important: Boolean(important) || false,
    id: generateId(),
  };

  notes = notes.concat(note);

  response.json(note);
});

////

app.get('/info', (request, response) => {
  const personsCount = persons.length;
  const phonebookEntries = `<p>PhoneBook has info for ${personsCount} people</p>`;
  const time = `<p>${new Date()}</p>`;

  response.send(`${phonebookEntries} ${time}`);
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  console.log(id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const body = request.body;
  const {name, number} = body;

  if (!name || !number) {
    return response.status(400).json({
      error: 'name and number are required',
    });
  }

  if (persons.some((p) => p.name === name)) {
    return response.status(400).json({
      error: 'name must be unique',
    });
  }

  const person = {
    name,
    number,
    id: Math.random(1000000),
  };

  persons = persons.concat(person);

  response.json(person);
});

app.use(unknownEndpoint);
app.use(express.json());
app.use(requestLogger);
app.use(morgan('tiny'));

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
