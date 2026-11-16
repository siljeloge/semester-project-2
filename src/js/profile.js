import {
  getProfile,
  getProfileListings,
  getProfileBids,
} from "./api/profiles.js";
import "./ui/image-fallback.js";

const profileContainer = document.querySelector("#profile");

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
  const difference = new Date(endsAt) - new Date();

  if (difference <= 0) {
    return "Ended";
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  return `${hours}h ${minutes}m left`;
}

/**
 * Escapes special HTML characters in user-submitted content.
 * @param {string} value - The text to escape.
 * @returns {string} The escaped text.
 */
function escapeHTML(value) {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => entities[character],
  );
}

/**
 * Returns a valid image URL or a placeholder.
 * @param {string} url - The image URL.
 * @param {string} placeholder - The fallback image.
 * @returns {string} A valid HTTP or HTTPS image URL.
 */
function getSafeImageUrl(
  url,
  placeholder = "./assets/no_image_yet.png",
) {
  if (!url) {
    return placeholder;
  }

  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.protocol === "https:" ||
      parsedUrl.protocol === "http:"
    ) {
      return parsedUrl.href;
    }
  } catch {
    return placeholder;
  }

  return placeholder;
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
      index === array.findIndex((item) => item.id === listing.id),
  );
}

/**
 * Displays auction cards in the profile.
 * @param {Array} listings - Listings to display.
 * @param {boolean} showEdit - Whether to show an Edit button.
 */
function displayListings(listings, showEdit = false) {
  const listingsContainer = document.querySelector("#profileListings");

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

  listingsContainer.innerHTML = listings
    .map((listing) => {
      const image = escapeHTML(
        getSafeImageUrl(listing.media?.[0]?.url),
      );

      const imageAlt = escapeHTML(
        listing.media?.[0]?.alt || listing.title || "Auction listing",
      );

      const title = escapeHTML(listing.title);
      const listingId = escapeHTML(encodeURIComponent(listing.id));
      const highestBid = getHighestBid(listing.bids);

      return `
        <div class="col-12 col-sm-6 col-lg-4">
          <article class="auction-card h-100">
            <a
              href="./listing.html?id=${listingId}"
              class="auction-card-link"
            >
              <img
                src="${image}"
                class="auction-card-img"
                alt="${imageAlt}"
                loading="lazy"
                decoding="async"
                width="600"
                height="400"
              />

              <div class="p-3">
                <h3>${title}</h3>

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
                      href="./edit-listing.html?id=${listingId}"
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
    })
    .join("");
}

/**
 * Displays the profile information.
 * @param {Object} profile - The user's profile.
 */
function displayProfile(profile) {
  const avatar = escapeHTML(
    getSafeImageUrl(
      profile.avatar?.url,
      "https://placehold.co/160x160",
    ),
  );

  const banner = escapeHTML(
    getSafeImageUrl(
      profile.banner?.url,
      "https://placehold.co/1200x300",
    ),
  );

  const avatarAlt = escapeHTML(
    profile.avatar?.alt || profile.name,
  );

  const bannerAlt = escapeHTML(
    profile.banner?.alt || "Profile banner",
  );

  profileContainer.innerHTML = `
    <div class="profile-banner">
      <img
        src="${banner}"
        alt="${bannerAlt}"
      />
    </div>

    <div class="profile-info">
      <div class="profile-avatar-large">
        <img
          src="${avatar}"
          alt="${avatarAlt}"
        />
      </div>

      <div class="profile-details">
        <h1>${escapeHTML(profile.name)}</h1>

        <p class="profile-bio">
          ${escapeHTML(profile.bio || "No bio added yet.")}
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

    <div
      class="profile-tabs mt-5"
      role="tablist"
      aria-label="Profile listings"
    >
      <button
        class="profile-tab active"
        type="button"
        id="myListingsTab"
        role="tab"
        aria-selected="true"
        aria-controls="profileListings"
        tabindex="0"
      >
        My listings
      </button>

      <button
        class="profile-tab"
        type="button"
        id="myBidsTab"
        role="tab"
        aria-selected="false"
        aria-controls="profileListings"
        tabindex="-1"
      >
        My bids
      </button>
    </div>

    <div
      id="profileListings"
      class="row g-4 mt-2"
      role="tabpanel"
      aria-labelledby="myListingsTab"
      tabindex="0"
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
  const myListingsTab = document.querySelector("#myListingsTab");
  const myBidsTab = document.querySelector("#myBidsTab");
  const panel = document.querySelector("#profileListings");

  const tabs = [myListingsTab, myBidsTab];

  function activateTab(tab) {
    tabs.forEach((item) => {
      const isActive = item === tab;

      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    panel.setAttribute("aria-labelledby", tab.id);

    if (tab === myListingsTab) {
      displayListings(listings, true);
    } else {
      displayListings(bidListings, false);
    }
  }

  myListingsTab.addEventListener("click", () => {
    activateTab(myListingsTab);
  });

  myBidsTab.addEventListener("click", () => {
    activateTab(myBidsTab);
  });

  // Allow switching tabs using the arrow keys.
  tabs.forEach((tab, index) => {
    tab.addEventListener("keydown", (event) => {
      if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight" &&
        event.key !== "Home" &&
        event.key !== "End"
      ) {
        return;
      }

      event.preventDefault();

      let nextIndex;

      if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      } else if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % tabs.length;
      } else {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      }

      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    });
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

  let profile;

  try {
    profile = await getProfile(name);
  } catch (error) {
    console.error("Could not load profile:", error);

    profileContainer.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Could not load profile.
      </div>
    `;

    return;
  }

  displayProfile(profile);

  // Load listings and bids independently.
  const [listingsResult, bidsResult] = await Promise.allSettled([
    getProfileListings(name),
    getProfileBids(name),
  ]);

  let listings = [];
  let bidListings = [];

  if (listingsResult.status === "fulfilled") {
    listings = listingsResult.value;
  } else {
    console.error(
      "Could not load profile listings:",
      listingsResult.reason,
    );
  }

  if (bidsResult.status === "fulfilled") {
    bidListings = getBidListings(bidsResult.value);
  } else {
    console.error(
      "Could not load profile bids:",
      bidsResult.reason,
    );
  }

  displayListings(listings, true);
  setupTabs(listings, bidListings);

  // Show an error if either collection failed to load.
  if (
    listingsResult.status === "rejected" ||
    bidsResult.status === "rejected"
  ) {
    const message = document.createElement("div");

    message.className = "alert alert-warning mt-3";
    message.setAttribute("role", "alert");
    message.textContent =
      "Some profile information could not be loaded. Please refresh the page to try again.";

    profileContainer.appendChild(message);
  }
}

loadProfile();
