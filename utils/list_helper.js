const _ = require('lodash');

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const total = blogs.reduce((acc, curr) => acc + curr.likes, 0);
  console.log(total);
  return total;
};

const favoriteBlog = (blogs) => {
  const favBlog = blogs.reduce((max, blog) => (blog.likes > max.likes ? blog : max), blogs[0]);

  return {
    title: favBlog.title,
    author: favBlog.author,
    likes: favBlog.likes,
  };
};

const mostBlogs = (blogs) => {
  return _(blogs)
    .countBy('author')
    .map((blogs, author) => ({author, blogs}))
    .maxBy('blogs');
};

const mostLikes = (blogs) => {
  return _(blogs)
    .groupBy('author')
    .map((blogs, author) => ({
      author,
      likes: _.sumBy(blogs, 'likes'),
    }))
    .maxBy('likes');
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
