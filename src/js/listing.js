import { getListing, placeBid } from "./api/listings.js";
import { getProfile } from "./api/profiles.js";
import "./ui/image-fallback.js";

const listingContainer = document.querySelector("#listing");

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
 * @param {string} endsAt - The date and time the auction ends.
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
 * Formats the date of a bid.
 * @param {string} date - The date the bid was created.
 * @returns {string} The formatted date.
 */
function formatBidDate(date) {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
 * @returns {string} A valid HTTP or HTTPS image URL.
 */
function getSafeImageUrl(url) {
  const placeholder = "./assets/no_image_yet.png";

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
 * Creates the image gallery for a listing.
 * @param {Object} listing - The current listing.
 * @returns {string} HTML for the image gallery.
 */
function createImageGallery(listing) {
  const media =
    listing.media?.length > 0
      ? listing.media
      : [
          {
            url: "./assets/no_image_yet.png",
            alt: listing.title,
          },
        ];

  const mainImage = media[0];

  const mainImageUrl = escapeHTML(
    getSafeImageUrl(mainImage.url),
  );

  const mainImageAlt = escapeHTML(
    mainImage.alt || listing.title,
  );

  return `
    <div class="listing-gallery">
      <img
        src="${mainImageUrl}"
        alt="${mainImageAlt}"
        class="listing-image"
        id="mainListingImage"
      />

      ${
        media.length > 1
          ? `
            <div class="listing-thumbnails">
              ${media
                .map(
                  (image, index) => `
                    <button
                      type="button"
                      class="listing-thumbnail ${index === 0 ? "active" : ""}"
                      data-image="${escapeHTML(getSafeImageUrl(image.url))}"
                      data-alt="${escapeHTML(image.alt || listing.title)}"
                      aria-label="View image ${index + 1}"
                    >
                      <img
                        src="${escapeHTML(getSafeImageUrl(image.url))}"
                        alt=""
                        loading="lazy"
                      />
                    </button>
                  `,
                )
                .join("")}
            </div>
          `
          : ""
      }
    </div>
  `;
}

/**
 * Creates the bidding section depending on login state.
 * @param {Object} listing - The current listing.
 * @param {Object|null} profile - The logged-in profile.
 * @returns {string} HTML for the bidding section.
 */
function createBidSection(listing, profile) {
  if (new Date(listing.endsAt) <= new Date()) {
    return `
      <div class="visitor-bid-box">
        <h2>Auction ended</h2>
        <p>This auction is no longer accepting bids.</p>
      </div>
    `;
  }

  if (!token || !profile) {
    return `
      <div class="visitor-bid-box">
        <h2>Want to place a bid?</h2>

        <p>Log in to bid on this listing.</p>

        <a
          href="./login.html"
          class="btn btn-primary"
        >
          Log in to bid
        </a>
      </div>
    `;
  }

  if (listing.seller?.name === profile.name) {
    return `
      <div class="visitor-bid-box">
        <h2>Your listing</h2>

        <p>You cannot bid on your own listing.</p>

        <a
          href="./edit-listing.html?id=${escapeHTML(encodeURIComponent(listing.id))}"
          class="btn btn-outline-primary"
        >
          Edit listing
        </a>
      </div>
    `;
  }

  const highestBid = getHighestBid(listing.bids);

  return `
    <div class="visitor-bid-box">
      <h2>Place a bid</h2>

      <form id="bidForm">
        <div class="mb-3">
          <label
            for="bidAmount"
            class="form-label"
          >
            Your bid
          </label>

          <input
            type="number"
            class="form-control"
            id="bidAmount"
            name="bidAmount"
            min="${highestBid + 1}"
            step="1"
            required
          />
        </div>

        <p class="small">
          You have
          <strong>
            ${profile.credits.toLocaleString()} credits
          </strong>
          available.
        </p>

        <div
          id="bidMessage"
          class="mb-3"
          aria-live="polite"
        ></div>

        <button
          type="submit"
          class="btn btn-primary"
        >
          Place bid
        </button>
      </form>
    </div>
  `;
}

/**
 * Sets up the image gallery thumbnail buttons.
 */
function setupImageGallery() {
  const mainImage = document.querySelector("#mainListingImage");
  const thumbnails = document.querySelectorAll(".listing-thumbnail");

  if (!mainImage || thumbnails.length === 0) {
    return;
  }

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", () => {
      mainImage.src = thumbnail.dataset.image;
      mainImage.alt = thumbnail.dataset.alt;

      thumbnails.forEach((item) => {
        item.classList.remove("active");
      });

      thumbnail.classList.add("active");
    });
  });
}

/**
 * Displays a single auction listing.
 * @param {Object} listing - The listing from the API.
 * @param {Object|null} profile - The logged-in profile.
 */
function displayListing(listing, profile = null) {
  const highestBid = getHighestBid(listing.bids);

  listingContainer.innerHTML = `
    <div class="row g-4 g-lg-5">
      <div class="col-12 col-lg-7">
        ${createImageGallery(listing)}
      </div>

      <div class="col-12 col-lg-5">
        <span class="countdown-badge">
          ${formatTimeLeft(listing.endsAt)}
        </span>

        <h1 class="listing-title">
          ${escapeHTML(listing.title)}
        </h1>

        <div class="listing-bid">
          <p class="bid-label mb-1">
            Current bid:
          </p>

          <p class="listing-price">
            ${
              highestBid > 0
                ? `${highestBid.toLocaleString()} credits`
                : "No bids yet"
            }
          </p>
        </div>

        <p class="listing-seller">
          Listed by
          <strong>
            ${escapeHTML(listing.seller?.name || "Unknown")}
          </strong>
        </p>

        <p class="listing-description">
          ${escapeHTML(listing.description || "No description provided.")}
        </p>

        ${createBidSection(listing, profile)}
      </div>
    </div>

    <section class="bid-history mt-5">
      <h2 class="mb-4">Bid history</h2>

      ${
        listing.bids?.length
          ? `
            <div class="table-responsive">
              <table class="table bid-table">
                <thead>
                  <tr>
                    <th scope="col">Bidder</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Time</th>
                  </tr>
                </thead>

                <tbody>
                  ${[...listing.bids]
                    .sort((a, b) => b.amount - a.amount)
                    .map(
                      (bid) => `
                        <tr>
                          <td>
                            ${escapeHTML(bid.bidder?.name || "Unknown")}
                          </td>

                          <td>
                            <strong>
                              ${bid.amount.toLocaleString()}
                              credits
                            </strong>
                          </td>

                          <td>
                            ${formatBidDate(bid.created)}
                          </td>
                        </tr>
                      `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
          : `
            <p class="text-secondary">
              No bids have been placed yet.
            </p>
          `
      }
    </section>
  `;

  setupImageGallery();

  const bidForm = document.querySelector("#bidForm");

  if (bidForm) {
    bidForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const bidMessage = document.querySelector("#bidMessage");
      const bidInput = document.querySelector("#bidAmount");
      const submitButton = bidForm.querySelector('button[type="submit"]');

      const bidAmount = Number(bidInput.value);
      const minimumBid = getHighestBid(listing.bids) + 1;

      if (!Number.isSafeInteger(bidAmount) || bidAmount < minimumBid) {
        bidMessage.textContent = `Your bid must be at least ${minimumBid} credits and a whole number.`;
        bidMessage.className = "alert alert-danger";
        return;
      }

      if (new Date(listing.endsAt) <= new Date()) {
        bidMessage.textContent = "This auction has ended.";
        bidMessage.className = "alert alert-danger";
        return;
      }

      submitButton.disabled = true;

      try {
        await placeBid(listing.id, bidAmount);

        bidMessage.textContent = "Bid placed successfully!";
        bidMessage.className = "alert alert-success";

        // Tell the header to refresh the credit balance.
        document.dispatchEvent(new Event("creditsUpdated"));

        setTimeout(() => {
          loadListing();
        }, 800);
      } catch (error) {
        console.error(error);

        bidMessage.textContent =
          error.message || "Could not place your bid.";

        bidMessage.className = "alert alert-danger";
        submitButton.disabled = false;
      }
    });
  }
}

/**
 * Loads a single listing using the ID from the URL.
 */
async function loadListing() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    listingContainer.innerHTML = `
      <p>Listing not found.</p>
    `;
    return;
  }

  try {
    const listing = await getListing(id);

    let profile = null;

    if (token && name) {
      try {
        profile = await getProfile(name);
      } catch (error) {
        console.error("Could not load profile:", error);
      }
    }

    displayListing(listing, profile);
  } catch (error) {
    console.error(error);

    listingContainer.innerHTML = `
      <p>
        Something went wrong while loading the listing.
      </p>
    `;
  }
}

loadListing();
