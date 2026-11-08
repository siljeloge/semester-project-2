
import { createListing } from "./api/listings.js";

const createListingForm = document.querySelector("#createListingForm");
const listingMessage = document.querySelector("#listingMessage");
const mediaInputs = document.querySelector("#mediaInputs");
const addImageButton = document.querySelector("#addImageBtn");

const token = localStorage.getItem("accessToken");

if (!token) {
  window.location.href = "./login.html";
}

/**
 * Displays feedback to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The Bootstrap alert type.
 */
function showListingMessage(message, type = "danger") {
  if (!listingMessage) {
    return;
  }

  listingMessage.textContent = message;
  listingMessage.className = `alert alert-${type}`;
}

/**
 * Checks whether a URL uses HTTP or HTTPS.
 * @param {string} url - The URL to validate.
 * @returns {boolean} Whether the URL is valid.
 */
function isValidImageUrl(url) {
  try {
    const parsedUrl = new URL(url);

    return (
      parsedUrl.protocol === "https:" ||
      parsedUrl.protocol === "http:"
    );
  } catch {
    return false;
  }
}

/**
 * Adds a new image URL input to the form.
 */
function addImageInput() {
  if (!mediaInputs) {
    return;
  }

  const mediaInput = document.createElement("div");
  mediaInput.className = "media-input d-flex gap-2 mb-2";

  mediaInput.innerHTML = `
    <input
      type="url"
      class="form-control"
      name="media"
      placeholder="https://example.com/image.jpg"
      aria-label="Additional image URL"
      maxlength="300"
    />

    <button
      type="button"
      class="btn btn-outline-danger remove-image-btn"
      aria-label="Remove image URL"
    >
      Remove
    </button>
  `;

  mediaInputs.appendChild(mediaInput);
}

/**
 * Handles creating a new auction listing.
 * @param {SubmitEvent} event - The form submit event.
 */
async function handleCreateListing(event) {
  event.preventDefault();

  const submitButton = createListingForm.querySelector(
    'button[type="submit"]',
  );

  if (submitButton?.disabled) {
    return;
  }

  const originalButtonText = submitButton?.textContent;

  listingMessage.textContent = "";
  listingMessage.className = "mb-4";

  const formData = new FormData(createListingForm);

  const title = String(formData.get("title") || "").trim();

  const description = String(
    formData.get("description") || "",
  ).trim();

  const endDateValue = String(formData.get("endsAt") || "");

  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const imageUrls = formData
    .getAll("media")
    .map((url) => String(url).trim())
    .filter(Boolean);

  // Validate required fields.
  if (!title || !description || !endDateValue) {
    showListingMessage("Please fill in all required fields.");
    return;
  }

  // Validate the auction end date.
  const endDate = new Date(endDateValue);

  if (Number.isNaN(endDate.getTime())) {
    showListingMessage("Please enter a valid end date.");
    return;
  }

  if (endDate <= new Date()) {
    showListingMessage(
      "The auction end date must be in the future.",
    );
    return;
  }

  // Validate all image URLs.
  if (imageUrls.some((url) => !isValidImageUrl(url))) {
    showListingMessage(
      "Please enter valid image URLs starting with http:// or https://.",
    );
    return;
  }

  const media = imageUrls.map((url, index) => ({
    url,
    alt: index === 0 ? title : `${title} image ${index + 1}`,
  }));

  const listingData = {
    title,
    description,
    endsAt: endDate.toISOString(),
    tags,
  };

  if (media.length > 0) {
    listingData.media = media;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Creating listing...";
  }

  try {
    const listing = await createListing(listingData);

    showListingMessage(
      "Listing created successfully!",
      "success",
    );

    setTimeout(() => {
      window.location.href =
        `./listing.html?id=${encodeURIComponent(listing.id)}`;
    }, 1000);
  } catch (error) {
    console.error("Could not create listing:", error);

    showListingMessage(
      error.message || "Could not create listing. Please try again.",
    );

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}

if (addImageButton && mediaInputs) {
  addImageButton.addEventListener("click", addImageInput);

  // Remove image inputs using event delegation.
  mediaInputs.addEventListener("click", (event) => {
    const removeButton = event.target.closest(
      ".remove-image-btn",
    );

    if (removeButton) {
      removeButton.closest(".media-input")?.remove();
    }
  });
}

if (createListingForm && listingMessage) {
  listingMessage.setAttribute("aria-live", "polite");

  createListingForm.addEventListener(
    "submit",
    handleCreateListing,
  );
}
