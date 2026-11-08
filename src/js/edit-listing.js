
import {
  getListing,
  updateListing,
  deleteListing,
} from "./api/listings.js";

const editListingForm = document.querySelector("#editListingForm");
const listingMessage = document.querySelector("#listingMessage");
const deleteListingBtn = document.querySelector("#deleteListingBtn");
const mediaInputs = document.querySelector("#mediaInputs");
const addImageButton = document.querySelector("#addImageBtn");

const token = localStorage.getItem("accessToken");
const name = localStorage.getItem("name");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let canEdit = false;
let isProcessing = false;

if (!token || !name) {
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
 * Enables or disables the listing editing controls.
 * @param {boolean} disabled - Whether controls should be disabled.
 */
function setFormDisabled(disabled) {
  if (editListingForm) {
    editListingForm
      .querySelectorAll("input, textarea, select, button")
      .forEach((element) => {
        element.disabled = disabled;
      });
  }

  if (addImageButton) {
    addImageButton.disabled = disabled;
  }

  if (deleteListingBtn) {
    deleteListingBtn.disabled = disabled;
  }
}

/**
 * Creates an image URL input.
 * @param {string} url - The existing image URL.
 * @param {boolean} removable - Whether the input can be removed.
 */
function createImageInput(url = "", removable = true) {
  if (!mediaInputs) {
    return;
  }

  const mediaInput = document.createElement("div");
  mediaInput.className = "media-input d-flex gap-2 mb-2";

  const input = document.createElement("input");
  input.type = "url";
  input.className = "form-control";
  input.name = "media";
  input.value = url;
  input.placeholder = "https://example.com/image.jpg";
  input.maxLength = 300;
  input.setAttribute("aria-label", "Image URL");

  mediaInput.appendChild(input);

  if (removable) {
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className =
      "btn btn-outline-danger remove-image-btn";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", "Remove image URL");

    mediaInput.appendChild(removeButton);
  }

  mediaInputs.appendChild(mediaInput);
}

/**
 * Fills the edit form with the current listing data.
 * @param {Object} listing - The listing to edit.
 */
function fillForm(listing) {
  const titleInput = document.querySelector("#title");
  const descriptionInput = document.querySelector("#description");
  const tagsInput = document.querySelector("#tags");

  if (titleInput) {
    titleInput.value = listing.title || "";
  }

  if (descriptionInput) {
    descriptionInput.value = listing.description || "";
  }

  if (tagsInput) {
    tagsInput.value = listing.tags?.join(", ") || "";
  }

  mediaInputs.innerHTML = "";

  if (listing.media?.length > 0) {
    listing.media.forEach((image) => {
      createImageInput(image.url);
    });
  } else {
    createImageInput("", false);
  }
}

/**
 * Loads the listing and checks ownership.
 */
async function loadListing() {
  if (!token || !name) {
    return;
  }

  setFormDisabled(true);

  if (!id) {
    showListingMessage("Listing not found.");
    return;
  }

  try {
    const listing = await getListing(id);

    if (listing.seller?.name !== name) {
      showListingMessage(
        "You can only edit your own listings.",
      );
      return;
    }

    fillForm(listing);

    canEdit = true;
    setFormDisabled(false);
  } catch (error) {
    console.error("Could not load listing:", error);

    showListingMessage(
      "Could not load listing. Please refresh the page to try again.",
    );
  }
}

/**
 * Handles updating an existing listing.
 * @param {SubmitEvent} event - The form submit event.
 */
async function handleUpdateListing(event) {
  event.preventDefault();

  if (!canEdit || isProcessing || !id) {
    return;
  }

  listingMessage.textContent = "";
  listingMessage.className = "mb-4";

  const formData = new FormData(editListingForm);

  const title = String(formData.get("title") || "").trim();

  const description = String(
    formData.get("description") || "",
  ).trim();

  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const imageUrls = formData
    .getAll("media")
    .map((url) => String(url).trim())
    .filter(Boolean);

  if (!title || !description) {
    showListingMessage("Please fill in all required fields.");
    return;
  }

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
    tags,
    media,
  };

  isProcessing = true;
  setFormDisabled(true);

  showListingMessage("Saving changes...", "info");

  try {
    await updateListing(id, listingData);

    showListingMessage(
      "Listing updated successfully!",
      "success",
    );

    setTimeout(() => {
      window.location.href =
        `./listing.html?id=${encodeURIComponent(id)}`;
    }, 1000);
  } catch (error) {
    console.error("Could not update listing:", error);

    showListingMessage(
      error.message || "Could not update listing. Please try again.",
    );

    isProcessing = false;
    setFormDisabled(false);
  }
}

/**
 * Handles deleting a listing after confirmation.
 */
async function handleDeleteListing() {
  if (!canEdit || isProcessing || !id) {
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this listing? This cannot be undone.",
  );

  if (!confirmed) {
    return;
  }

  isProcessing = true;
  setFormDisabled(true);

  showListingMessage("Deleting listing...", "info");

  try {
    await deleteListing(id);

    window.location.href = "./profile.html";
  } catch (error) {
    console.error("Could not delete listing:", error);

    showListingMessage(
      error.message || "Could not delete listing. Please try again.",
    );

    isProcessing = false;
    setFormDisabled(false);
  }
}

// Set up the page only when the required elements exist.
if (editListingForm && listingMessage && mediaInputs) {
  listingMessage.setAttribute("aria-live", "polite");

  // Keep editing disabled until ownership has been verified.
  setFormDisabled(true);

  addImageButton?.addEventListener("click", () => {
    if (canEdit && !isProcessing) {
      createImageInput();
    }
  });

  // Remove image inputs using event delegation.
  mediaInputs.addEventListener("click", (event) => {
    if (!canEdit || isProcessing) {
      return;
    }

    const removeButton = event.target.closest(
      ".remove-image-btn",
    );

    if (removeButton) {
      removeButton.closest(".media-input")?.remove();
    }
  });

  editListingForm.addEventListener(
    "submit",
    handleUpdateListing,
  );

  deleteListingBtn?.addEventListener(
    "click",
    handleDeleteListing,
  );

  loadListing();
}
