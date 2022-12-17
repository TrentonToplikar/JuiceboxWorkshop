const { Client } = require("pg");
const client = new Client("postgres://localhost:5432/juicebox");

//************ START USERS************** */
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

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT *
        FROM users;
        `
  );
  return rows;
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

    // console.log("THIS IS THE USER:", user);
    user.posts = await getPostsByUser(userId);
    return user;
  } catch (error) {
    console.log("Error in getUserById: ", error);
  }
}
//************ END USERS************** */

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
// ********** END  POSTS***********
// **************CREATE TAGS******************\\

async function createTags(taglist) {
  try {
    // const { name } = taglist;
    console.log("Creating tags");
    const {
      rows: [newTags],
    } = await client.query(
      `
      INSERT INTO TAGS(name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
      `,
      [taglist]
    );
    console.log("THESE ARE YOUR TAGS  :", newTags);
    return newTags;
  } catch (error) {
    console.log("Error in createTags!!!!!!: ", error);
  }
}

async function createPostTag(postId, tagId) {
  try {
    await client.query(
      `
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      ON CONFLICT ("postId", "tagId",) DO NOTHING
      `,
      [postId, tagId]
    );
  } catch (error) {
    console.log("Error in createPostTag! ", error);
  }
}
async function getAllTags() {
  try {
    const { rows: tags } = await client.query(`
                    SELECT * FROM tags
                    WHERE name
                    IN ($1, $2, $3);`);
    return tags;
  } catch (error) {
    console.log("ERROR IN GETALLTAGS: ", error);
  }
}

async function addTagsToPost(postId, tagList) {
  try {
    const createPostTagPromises = tagList.map((tag) =>
      createPostTag(postId, tag.id)
    );

    await Promise.all(createPostTagPromises);
    return await getPostById(postId);
  } catch (error) {
    console.log("Error in addtagstopost: ", error);
  }
}

async function getpostById(postId) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
                    SELECT *
                    FROM posts
                    WHERE id=$1;`,
      [postId]
    );

    const {
      rows: [tags],
    } = await client.query(
      `
                      SELECT tags.*
                      FROM tags
                      JOIN post_tags ON tags.id=post_tags."tagId"
                      WHERE post_tags."postId"=$1;`,
      [postId]
    );

    const {
      rows: [author],
    } = await client.query(
      `
                    SELECT id, username, name, location
                    FROM users
                    WHERE id=$1;`,
      [post.authorId]
    );

    post.tags = tags;
    post.author = author;
    delete post.authorId;

    return post;
  } catch (error) {
    console.log("Error in getpostbyId: ", error);
  }
}
// **************END CREATE TAGS******************\\

module.exports = {
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  createTags,
  getAllTags,
  addTagsToPost,
  getpostById,
};
