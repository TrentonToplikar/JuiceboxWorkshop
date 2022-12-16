const { Client } = require("pg");
const client = new Client("postgres://localhost:5432/juicebox");

async function createUser({ username, password, name, location }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      INSERT INTO users(username, password, name, location) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
      `,
      [username, password, name, location]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT *
    FROM users;
    `
  );
  return rows;
}

async function updateUser(id, fields = {}) {
  //we are building the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  //return early if fields is empty
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
        UPDATE users
        set ${setString}
        WHERE id= ${id}
    RETURNING *;`,
      Object.values(fields)
    );
    return user;
  } catch (error) {
    throw error;
  }
}
// ******** START POSTS************
async function createPost({ authorId, title, content }) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      INSERT INTO posts("authorId", title, content) 
      VALUES($1, $2, $3) 
      RETURNING *;
      `,
      [authorId, title, content]
    );

    return post;
  } catch (error) {
    throw error;
  }
}

async function getAllPosts() {
  try {
    const { rows: posts } = await client.query(
      `SELECT *
      FROM posts;
     `
    );
    return posts;
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  //we are building the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  console.log(setString);
  console.log(id);
  //return early if fields is empty
  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: post } = await client.query(
      `
  UPDATE posts
  SET ${setString}
  WHERE id=${id}
  RETURNING *;`,
      Object.values(fields)
    );
    return post;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
    SELECT * FROM posts
    WHERE "authorId"=${userId};
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT id, username, name, location, active
      FROM users
      WHERE id = $1;
      `,
      [userId]
    );
    // if (rows.length === 0) {
    //   return null;
    // }

    // delete user.password;

    console.log("THIS IS THE USER:", user);
    user.posts = await getPostsByUser(userId);
    return user;
  } catch (error) {
    console.log("Error in getUserById: ", error);
  }
}

// ********** END  POSTS***********

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getAllPosts,
  createPost,
  updatePost,
  getUserById,
  getPostsByUser,
};
