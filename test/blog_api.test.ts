const {test, after, beforeEach} = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./blog_helper');
const api = supertest(app);

const Blog = require('../models/blog');

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs');

  assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

test('blogs are returned as json with id instead of _id', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const blogs = response.body;

  assert.strictEqual(blogs.length, helper.initialBlogs.length);

  blogs.forEach((blog) => {
    assert('id' in blog);
    assert(!('id_' in blog));
  });
});

test('a valid blog can be added ', async () => {
  const newBlog = {
    _id: '4a422bc61b54a676234d19fc',
    title: 'Manolo blog',
    author: 'Manolo J',
    url: 'http://.marca.com/',
    likes: 10,
    __v: 0,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

  const urls = blogsAtEnd.map((r) => r.url);
  assert(urls.includes('http://.marca.com/'));
});

test('blog without likes is added with 0 value', async () => {
  const newBlog = {
    _id: '7a422bc61b54a673234d19fc',
    title: 'Manolo no likes',
    author: 'Manolo J',
    url: 'http://.marca.com/',
    __v: 0,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

  const blogAdded = blogsAtEnd.find((blog) => blog.id === newBlog._id);
  assert.strictEqual(blogAdded.likes, 0);
});

test('blog without url or title is not added', async () => {
  const newBlog = {
    _id: '7a422aa61b54a673234d19fc',
    author: 'Manuel GG',
    __v: 0,
  };

  await api.post('/api/blogs').send(newBlog).expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
});

beforeEach(async () => {
  await Blog.deleteMany({});

  console.log('cleared');

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }

  console.log('done');
});

after(async () => {
  await mongoose.connection.close();
});
