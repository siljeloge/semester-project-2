import { API_BASE_URL } from "./config.js";

/**
 * Creates the headers needed for authenticated API requests.
 * @returns {Object} Authentication headers.
 */
function getHeaders() {
  const accessToken = localStorage.getItem("accessToken");
  const apiKey = localStorage.getItem("apiKey");

  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Noroff-API-Key": apiKey,
  };
}

/**
 * Gets an auction profile.
 * @param {string} name - The profile username.
 * @returns {Promise<Object>} The profile data.
 */
export async function getProfile(name) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/${name}`,
    {
      headers: getHeaders(),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message || "Could not load profile.";

    throw new Error(message);
  }

  return result.data;
}

/**
 * Gets listings created by a profile.
 * @param {string} name - The profile username.
 * @returns {Promise<Array>} The user's listings.
 */
export async function getProfileListings(name) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/${name}/listings?_bids=true`,
    {
      headers: getHeaders(),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message ||
      "Could not load profile listings.";

    throw new Error(message);
  }

  return result.data;
}

/**
 * Gets listings the user has placed bids on.
 * @param {string} name - The profile username.
 * @returns {Promise<Array>} Listings the user has bid on.
 */
export async function getProfileBids(name) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/${name}/bids?_listings=true`,
    {
      headers: getHeaders(),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message ||
      "Could not load your bids.";

    throw new Error(message);
  }

  return result.data;
}

/**
 * Updates the logged-in user's profile.
 * @param {string} name - The profile username.
 * @param {Object} profileData - The updated profile data.
 * @returns {Promise<Object>} The updated profile.
 */
export async function updateProfile(name, profileData) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/${name}`,
    {
      method: "PUT",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message ||
      "Could not update profile.";

    throw new Error(message);
  }

  return result.data;
}