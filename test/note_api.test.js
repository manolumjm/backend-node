const {test, after, beforeEach} = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const api = supertest(app);

const Note = require('../models/note');

test('notes are returned as json', async () => {
  await api.get('/api/notes').expect(200).expect('Content-Type', 'application/json; charset=utf-8');
});

test('all notes are returned', async () => {
  const response = await api.get('/api/notes');

  assert.strictEqual(response.body.length, helper.initialNotes.length);
});

test('there are two notes', async () => {
  const response = await api.get('/api/notes');

  assert.strictEqual(response.body.length, helper.initialNotes.length);
});

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes');

  const contents = response.body.map((e) => e.content);
  assert(contents.includes('HTML is easy'));
});

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes');

  const contents = response.body.map((r) => r.content);

  assert(contents.includes('Browser can execute only JavaScript'));
});

test('a valid note can be added ', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const notesAtEnd = await helper.notesInDb();
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1);

  const contents = notesAtEnd.map((r) => r.content);
  assert(contents.includes('async/await simplifies making async calls'));
});

test('note without content is not added', async () => {
  const newNote = {
    important: true,
  };

  await api.post('/api/notes').send(newNote).expect(400);

  const notesAtEnd = await helper.notesInDb();

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length);
});

test('a specific note can be viewed', async () => {
  const notesAtStart = await helper.notesInDb();

  const noteToView = notesAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(resultNote.body, noteToView);
});

test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToDelete = notesAtStart[0];

  await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);
  const notesAtEnd = await helper.notesInDb();

  const contents = notesAtEnd.map((r) => r.content);
  assert(!contents.includes(noteToDelete.content));

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1);
});

beforeEach(async () => {
  await Note.deleteMany({});
  console.log('cleared');

  /* 
  Cada iteración del bucle forEach genera su propia operación asíncrona, y beforeEach no esperará a que terminen de ejecutarse. En otras palabras, los comandos await definidos dentro del bucle forEach no están en la función beforeEach, 
   sino en funciones separadas que beforeEach no esperará.
   Dado que la ejecución de las pruebas comienza inmediatamente después de que beforeEach haya terminado de ejecutarse, la ejecución de las pruebas comienza antes 
   de que se inicialice el estado de la base de datos. 
   ESTO FALLARIA 
   */

  // helper.initialNotes.forEach(async (note) => {
  //   let noteObject = new Note(note);
  //   await noteObject.save();
  //   console.log('saved');
  // });

  /* 
  Solucion? usar Promise.all para que espere a que se ejecuten todas las operaciones asincronas
  */

  // const noteObjects = helper.initialNotes.map((note) => new Note(note));
  // const promiseArray = noteObjects.map((note) => note.save());
  // await Promise.all(promiseArray);

  /*
  Si las promesas deben ejecutarse en un orden particular, esto será problemático. 
  En situaciones como esta, las operaciones se pueden ejecutar dentro de un for...of
  */

  for (let note of helper.initialNotes) {
    let noteObject = new Note(note);
    await noteObject.save();
  }
  console.log('done');
});

after(async () => {
  await mongoose.connection.close();
});
