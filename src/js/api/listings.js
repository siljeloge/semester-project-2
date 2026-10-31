import { AUCTION_LISTINGS_URL } from "./config.js";

/**
 * Fetches all active auction listings from the API.
 * Uses pagination to retrieve listings from all available pages.
 * @returns {Promise<Array>} All active auction listings.
 */
export async function getListings() {
  let allListings = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await fetch(
      `${AUCTION_LISTINGS_URL}?_active=true&_bids=true&limit=100&page=${page}`,
    );

    if (!response.ok) {
      throw new Error("Could not fetch listings");
    }

    const result = await response.json();

    allListings = [
      ...allListings,
      ...result.data,
    ];

    hasMorePages = !result.meta.isLastPage;

    page++;
  }

  return allListings;
}

/**
 * Fetches a single auction listing.
 * @param {string} id - The listing ID.
 * @returns {Promise<Object>} The auction listing.
 */
export async function getListing(id) {
  const response = await fetch(
    `${AUCTION_LISTINGS_URL}/${id}?_bids=true&_seller=true`,
  );

  if (!response.ok) {
    throw new Error("Could not fetch listing");
  }

  const result = await response.json();

  return result.data;
}

/**
 * Places a bid on a listing.
 * @param {string} id - The listing ID.
 * @param {number} amount - The amount to bid.
 * @returns {Promise<Object>} The updated listing.
 */
export async function placeBid(id, amount) {
  const accessToken =
    localStorage.getItem("accessToken");

  const apiKey =
    localStorage.getItem("apiKey");

  const response = await fetch(
    `${AUCTION_LISTINGS_URL}/${id}/bids`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message ||
      "Could not place bid.";

    throw new Error(message);
  }

  return result.data;
}

/**
 * Creates a new auction listing.
 * @param {Object} listingData - The listing data.
 * @returns {Promise<Object>} The created listing.
 */
export async function createListing(
  listingData,
) {
  const accessToken =
    localStorage.getItem("accessToken");

  const apiKey =
    localStorage.getItem("apiKey");

  const response = await fetch(
    AUCTION_LISTINGS_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(listingData),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message ||
      "Could not create listing.";

    throw new Error(message);
  }

  return result.data;
}

/**
 * Updates an existing auction listing.
 * @param {string} id - The listing ID.
 * @param {Object} listingData - The updated listing data.
 * @returns {Promise<Object>} The updated listing.
 */
export async function updateListing(
  id,
  listingData,
) {
  const accessToken =
    localStorage.getItem("accessToken");

  const apiKey =
    localStorage.getItem("apiKey");

  const response = await fetch(
    `${AUCTION_LISTINGS_URL}/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(listingData),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message ||
      "Could not update listing.";

    throw new Error(message);
  }

  return result.data;
}

/**
 * Deletes an auction listing.
 * @param {string} id - The listing ID.
 */
export async function deleteListing(id) {
  const accessToken =
    localStorage.getItem("accessToken");

  const apiKey =
    localStorage.getItem("apiKey");

  const response = await fetch(
    `${AUCTION_LISTINGS_URL}/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
      },
    },
  );

  if (!response.ok) {
    let message =
      "Could not delete listing.";

    try {
      const result = await response.json();

      message =
        result.errors?.[0]?.message ||
        message;
    } catch {
      // DELETE responses may not contain JSON.
    }

    throw new Error(message);
  }
}