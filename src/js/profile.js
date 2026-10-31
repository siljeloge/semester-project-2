import {
  getProfile,
  getProfileListings,
  getProfileBids,
} from "./api/profiles.js";

const profileContainer =
  document.querySelector("#profile");

const token = localStorage.getItem("accessToken");
const name = localStorage.getItem("name");

/**
 * Gets the highest bid from a list of bids.
 * @param {Array} bids - The bids on a listing.
 * @returns {number} The highest bid amount.
 */
function getHighestBid(bids) {
  if (!bids || bids.length === 0) {
    return 0;
  }

  return Math.max(...bids.map((bid) => bid.amount));
}

/**
 * Formats the remaining time for an auction.
 * @param {string} endsAt - The date the auction ends.
 * @returns {string} The remaining time.
 */
function formatTimeLeft(endsAt) {
  const end = new Date(endsAt);
  const now = new Date();
  const difference = end - now;

  if (difference <= 0) {
    return "Ended";
  }

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24),
  );

  const hours = Math.floor(
    (difference / (1000 * 60 * 60)) % 24,
  );

  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60,
  );

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  return `${hours}h ${minutes}m left`;
}

/**
 * Gets unique listings from the user's bids.
 * @param {Array} bids - The user's bids.
 * @returns {Array} Unique listings the user has bid on.
 */
function getBidListings(bids) {
  if (!bids || bids.length === 0) {
    return [];
  }

  const listings = bids
    .map((bid) => bid.listing)
    .filter((listing) => listing);

  return listings.filter(
    (listing, index, array) =>
      index ===
      array.findIndex(
        (item) => item.id === listing.id,
      ),
  );
}

/**
 * Displays auction cards in the profile.
 * @param {Array} listings - Listings to display.
 * @param {boolean} showEdit - Whether to show an Edit button.
 */
function displayListings(listings, showEdit = false) {
  const listingsContainer =
    document.querySelector("#profileListings");

  if (!listingsContainer) {
    return;
  }

  if (!listings || listings.length === 0) {
    listingsContainer.innerHTML = `
      <div class="col-12">
        <p class="text-secondary">
          No listings to show.
        </p>
      </div>
    `;

    return;
  }

  listingsContainer.innerHTML = "";

  listings.forEach((listing) => {
    const image =
      listing.media?.[0]?.url ||
      "https://placehold.co/600x400";

    const imageAlt =
      listing.media?.[0]?.alt ||
      listing.title ||
      "Auction listing";

    const highestBid = getHighestBid(listing.bids);

    listingsContainer.innerHTML += `
      <div class="col-12 col-sm-6 col-lg-4">
        <article class="auction-card h-100">
          <a
            href="./listing.html?id=${listing.id}"
            class="auction-card-link"
          >
            <img
              src="${image}"
              class="auction-card-img"
              alt="${imageAlt}"
            />

            <div class="p-3">
              <h3>${listing.title}</h3>

              <p class="bid-label mb-1">
                Current bid:
              </p>

              <p class="bid-price">
                ${
                  highestBid > 0
                    ? `${highestBid.toLocaleString()} credits`
                    : "No bids yet"
                }
              </p>

              <span class="countdown-badge">
                ${formatTimeLeft(listing.endsAt)}
              </span>
            </div>
          </a>

          ${
            showEdit
              ? `
                <div class="px-3 pb-3">
                  <a
                    href="./edit-listing.html?id=${listing.id}"
                    class="btn btn-outline-primary w-100"
                  >
                    Edit
                  </a>
                </div>
              `
              : ""
          }
        </article>
      </div>
    `;
  });
}

/**
 * Displays the profile information.
 * @param {Object} profile - The user's profile.
 */
function displayProfile(profile) {
  const avatar =
    profile.avatar?.url ||
    "https://placehold.co/160x160";

  const banner =
    profile.banner?.url ||
    "https://placehold.co/1200x300";

  profileContainer.innerHTML = `
    <div class="profile-banner">
      <img
        src="${banner}"
        alt="${profile.banner?.alt || "Profile banner"}"
      />
    </div>

    <div class="profile-info">
      <div class="profile-avatar-large">
        <img
          src="${avatar}"
          alt="${profile.avatar?.alt || profile.name}"
        />
      </div>

      <div class="profile-details">
        <h1>${profile.name}</h1>

        <p class="profile-bio">
          ${profile.bio || "No bio added yet."}
        </p>

        <span class="credit-badge">
          ${profile.credits.toLocaleString()} credits
        </span>
      </div>

      <a
        href="./edit-profile.html"
        class="btn btn-outline-primary profile-edit-button"
      >
        Edit profile
      </a>
    </div>

    <div class="profile-tabs mt-5">
      <button
        class="profile-tab active"
        type="button"
        id="myListingsTab"
      >
        My listings
      </button>

      <button
        class="profile-tab"
        type="button"
        id="myBidsTab"
      >
        My bids
      </button>
    </div>

    <div
      id="profileListings"
      class="row g-4 mt-2"
    >
      <div class="col-12">
        <p>Loading listings...</p>
      </div>
    </div>
  `;
}

/**
 * Sets up the profile tab buttons.
 * @param {Array} listings - The user's own listings.
 * @param {Array} bidListings - Listings the user has bid on.
 */
function setupTabs(listings, bidListings) {
  const myListingsTab =
    document.querySelector("#myListingsTab");

  const myBidsTab =
    document.querySelector("#myBidsTab");

  myListingsTab.addEventListener("click", () => {
    myListingsTab.classList.add("active");
    myBidsTab.classList.remove("active");

    displayListings(listings, true);
  });

  myBidsTab.addEventListener("click", () => {
    myBidsTab.classList.add("active");
    myListingsTab.classList.remove("active");

    displayListings(bidListings, false);
  });
}

/**
 * Loads the logged-in user's profile.
 */
async function loadProfile() {
  if (!token || !name) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const profile = await getProfile(name);

    displayProfile(profile);

    const listings = await getProfileListings(name);
    const bids = await getProfileBids(name);

    const bidListings = getBidListings(bids);

    displayListings(listings, true);
    setupTabs(listings, bidListings);
  } catch (error) {
    console.error(error);

    profileContainer.innerHTML = `
      <div class="alert alert-danger">
        Could not load profile.
      </div>
    `;
  }
}

loadProfile();