import { API_BASE_URL } from "./config.js";

/**
 * Registers a new user.
 * @param {string} name - The user's username.
 * @param {string} email - The user's student email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The registered user.
 */
export async function registerUser(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message || "Registration failed.";

    throw new Error(message);
  }

  return result.data;
}

/**
 * Logs in a registered user.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The logged-in user.
 */
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message || "Login failed.";

    throw new Error(message);
  }

  return result.data;
}

/**
 * Creates an API key for the logged-in user.
 * @param {string} accessToken - The user's access token.
 * @returns {Promise<string>} The API key.
 */
export async function createApiKey(accessToken) {
  const response = await fetch(`${API_BASE_URL}/auth/create-api-key`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "MyBid",
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message || "Could not create API key.";

    throw new Error(message);
  }

  return result.data.key;
}