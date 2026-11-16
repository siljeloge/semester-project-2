import { getListings } from "./api/listings.js";
import "./ui/image-fallback.js";

const listingsContainer = document.querySelector("#listings");
const endingSoonContainer = document.querySelector("#endingSoonListings");
const searchInput = document.querySelector("#search");
const searchForm = document.querySelector(".hero-search");
const sortSelect = document.querySelector("#sort");
const loadMoreButton = document.querySelector("#loadMoreBtn");
const filterButtons = document.querySelectorAll(".filter-btn");

let allListings = [];
let currentListings = [];
let visibleListings = 8;
let activeFilter = "all";

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
  const end = new Date(endsAt);
  const now = new Date();
  const difference = end - now;

  if (difference <= 0) {
    return "Ended";
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  const minutes = Math.floor((difference / (1000 * 60)) % 60);

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
 * @returns {string} A safe image URL.
 */
function getSafeImageUrl(url) {
  const placeholder = "./assets/no_image_yet.png";

  if (!url) {
    return placeholder;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:") {
      return parsedUrl.href;
    }
  } catch {
    return placeholder;
  }

  return placeholder;
}

/**
 * Creates the HTML for a listing card.
 * @param {Object} listing - The auction listing.
 * @param {boolean} priority - Whether the image should load first.
 * @returns {string} HTML for the listing card.
 */
function createListingCard(listing, priority = false) {
  const image = escapeHTML(getSafeImageUrl(listing.media?.[0]?.url));

  const imageAlt = escapeHTML(listing.media?.[0]?.alt || listing.title);

  const title = escapeHTML(listing.title);
  const listingId = encodeURIComponent(listing.id);
  const highestBid = getHighestBid(listing.bids);

  return `
    <div class="col-12 col-sm-6 col-lg-3">
      <a
        href="./listing.html?id=${listingId}"
        class="auction-card-link"
      >
        <article class="auction-card h-100">
          <img
            src="${image}"
            class="auction-card-img"
            alt="${imageAlt}"
            loading="${priority ? "eager" : "lazy"}"
            fetchpriority="${priority ? "high" : "auto"}"
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
        </article>
      </a>
    </div>
  `;
}

/**
 * Displays the four listings ending soonest.
 * @param {Array} listings - The auction listings.
 */
function displayEndingSoon(listings) {
  const endingSoonListings = [...listings]
    .filter((listing) => new Date(listing.endsAt) > new Date())
    .sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt))
    .slice(0, 4);

  endingSoonContainer.innerHTML = endingSoonListings
    .map((listing, index) => createListingCard(listing, index === 0))
    .join("");
}

/**
 * Displays the currently visible listings.
 * @param {Array} listings - The listings to display.
 */
function displayListings(listings) {
  if (listings.length === 0) {
    listingsContainer.innerHTML = `
      <div class="col-12">
        <p>No listings found.</p>
      </div>
    `;

    loadMoreButton.style.display = "none";
    return;
  }

  const listingsToShow = listings.slice(0, visibleListings);

  listingsContainer.innerHTML = listingsToShow
    .map((listing) => createListingCard(listing))
    .join("");

  loadMoreButton.style.display =
    visibleListings >= listings.length ? "none" : "inline-block";
}

/**
 * Applies search, bid filtering and sorting
 * to the auction listings.
 */
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  let filteredListings = [...allListings];

  // Search by title, tags and description.
  if (searchTerm) {
    filteredListings = filteredListings.filter((listing) => {
      const title = listing.title?.toLowerCase() || "";
      const tags = listing.tags?.join(" ").toLowerCase() || "";
      const description = listing.description?.toLowerCase() || "";

      return (
        title.includes(searchTerm) ||
        tags.includes(searchTerm) ||
        description.includes(searchTerm)
      );
    });
  }

  // Filter by bid status.
  if (activeFilter === "has-bids") {
    filteredListings = filteredListings.filter(
      (listing) => listing.bids?.length > 0,
    );
  }

  if (activeFilter === "no-bids") {
    filteredListings = filteredListings.filter(
      (listing) => !listing.bids || listing.bids.length === 0,
    );
  }

  // Sort the filtered results.
  const sortValue = sortSelect.value;

  if (sortValue === "newest") {
    filteredListings.sort((a, b) => new Date(b.created) - new Date(a.created));
  }

  if (sortValue === "oldest") {
    filteredListings.sort((a, b) => new Date(a.created) - new Date(b.created));
  }

  if (sortValue === "ending-soon") {
    filteredListings.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
  }

  currentListings = filteredListings;
  visibleListings = 8;

  displayListings(currentListings);
}

/**
 * Loads eight more listings.
 */
function loadMoreListings() {
  visibleListings += 8;
  displayListings(currentListings);
}

/**
 * Loads listings from the API.
 */
async function loadListings() {
  try {
    allListings = await getListings();

    displayEndingSoon(allListings);
    applyFilters();
  } catch (error) {
    console.error(error);

    listingsContainer.innerHTML = `
      <div class="col-12">
        <p>
          Something went wrong while loading listings.
        </p>
      </div>
    `;

    endingSoonContainer.innerHTML = `
      <div class="col-12">
        <p>
          Could not load ending soon listings.
        </p>
      </div>
    `;

    loadMoreButton.style.display = "none";
  }
}

// Search while typing.
searchInput.addEventListener("input", applyFilters);

// Search button.
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  applyFilters();

  document.querySelector("#browse").scrollIntoView({
    behavior: "smooth",
  });
});

// Sort listings.
sortSelect.addEventListener("change", applyFilters);

// Filter listings by bid status.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      filterButton.classList.remove("active");
      filterButton.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    applyFilters();
  });
});

// Load more listings.
loadMoreButton.addEventListener("click", loadMoreListings);

loadListings();
