const { Client } = require("pg");

async function createUser({ username, password, name, location }) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO users(username, password, name, location) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `,
      [username, password, name, location]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

const client = new Client("postgres://localhost:5432/juicebox");

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active
     FROM users;
    `
  );
  return rows;
}

module.exports = {
  client,
  getAllUsers,
  createUser,
};
