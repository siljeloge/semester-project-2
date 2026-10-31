import {
  getListing,
  updateListing,
  deleteListing,
} from "./api/listings.js";

const editListingForm =
  document.querySelector("#editListingForm");

const listingMessage =
  document.querySelector("#listingMessage");

const deleteListingBtn =
  document.querySelector("#deleteListingBtn");

const mediaInputs =
  document.querySelector("#mediaInputs");

const addImageButton =
  document.querySelector("#addImageBtn");

const token = localStorage.getItem("accessToken");
const name = localStorage.getItem("name");

const params = new URLSearchParams(
  window.location.search,
);

const id = params.get("id");

if (!token) {
  window.location.href = "./login.html";
}

/**
 * Creates an image URL input.
 * @param {string} url - The existing image URL.
 * @param {boolean} removable - Whether the input can be removed.
 */
function createImageInput(
  url = "",
  removable = true,
) {
  const mediaInput =
    document.createElement("div");

  mediaInput.className =
    "media-input d-flex gap-2 mb-2";

  mediaInput.innerHTML = `
    <input
      type="url"
      class="form-control"
      name="media"
      value="${url}"
      placeholder="https://example.com/image.jpg"
      maxlength="300"
    />

    ${
      removable
        ? `
          <button
            type="button"
            class="btn btn-outline-danger remove-image-btn"
          >
            Remove
          </button>
        `
        : ""
    }
  `;

  mediaInputs.appendChild(mediaInput);
}

/**
 * Fills the edit form with the current listing data.
 * @param {Object} listing - The listing to edit.
 */
function fillForm(listing) {
  document.querySelector("#title").value =
    listing.title || "";

  document.querySelector("#description").value =
    listing.description || "";

  document.querySelector("#tags").value =
    listing.tags?.join(", ") || "";

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
 * Loads the listing that should be edited.
 */
async function loadListing() {
  if (!id) {
    listingMessage.textContent =
      "Listing not found.";

    listingMessage.className =
      "alert alert-danger";

    editListingForm
      .querySelectorAll(
        "input, textarea, button",
      )
      .forEach((element) => {
        element.disabled = true;
      });

    return;
  }

  try {
    const listing = await getListing(id);

    if (listing.seller?.name !== name) {
      listingMessage.textContent =
        "You can only edit your own listings.";

      listingMessage.className =
        "alert alert-danger";

      editListingForm
        .querySelectorAll(
          "input, textarea, button",
        )
        .forEach((element) => {
          element.disabled = true;
        });

      return;
    }

    fillForm(listing);
  } catch (error) {
    console.error(error);

    listingMessage.textContent =
      "Could not load listing.";

    listingMessage.className =
      "alert alert-danger";
  }
}

addImageButton.addEventListener(
  "click",
  () => {
    createImageInput();
  },
);

mediaInputs.addEventListener(
  "click",
  (event) => {
    if (
      event.target.classList.contains(
        "remove-image-btn",
      )
    ) {
      event.target
        .closest(".media-input")
        .remove();
    }
  },
);

editListingForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    listingMessage.textContent = "";
    listingMessage.className = "mb-4";

    const formData =
      new FormData(editListingForm);

    const title =
      formData.get("title").trim();

    const description =
      formData.get("description").trim();

    const tags = formData
      .get("tags")
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const imageUrls = formData
      .getAll("media")
      .map((url) => url.trim())
      .filter((url) => url);

    const media = imageUrls.map(
      (url, index) => ({
        url,
        alt:
          index === 0
            ? title
            : `${title} image ${index + 1}`,
      }),
    );

    const listingData = {
      title,
      description,
      tags,
      media,
    };

    try {
      await updateListing(
        id,
        listingData,
      );

      listingMessage.textContent =
        "Listing updated successfully!";

      listingMessage.className =
        "alert alert-success";

      setTimeout(() => {
        window.location.href =
          `./listing.html?id=${id}`;
      }, 1000);
    } catch (error) {
      console.error(error);

      listingMessage.textContent =
        error.message;

      listingMessage.className =
        "alert alert-danger";
    }
  },
);

deleteListingBtn.addEventListener(
  "click",
  async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteListing(id);

      window.location.href =
        "./profile.html";
    } catch (error) {
      console.error(error);

      listingMessage.textContent =
        error.message;

      listingMessage.className =
        "alert alert-danger";
    }
  },
);

loadListing();