import { createListing } from "./api/listings.js";

const createListingForm =
  document.querySelector("#createListingForm");

const listingMessage =
  document.querySelector("#listingMessage");

const mediaInputs =
  document.querySelector("#mediaInputs");

const addImageButton =
  document.querySelector("#addImageBtn");

const token = localStorage.getItem("accessToken");

if (!token) {
  window.location.href = "./login.html";
}

function addImageInput() {
  const mediaInput = document.createElement("div");

  mediaInput.className =
    "media-input d-flex gap-2 mb-2";

  mediaInput.innerHTML = `
    <input
      type="url"
      class="form-control"
      name="media"
      placeholder="https://example.com/image.jpg"
      maxlength="300"
    />

    <button
      type="button"
      class="btn btn-outline-danger remove-image-btn"
    >
      Remove
    </button>
  `;

  mediaInputs.appendChild(mediaInput);
}

addImageButton.addEventListener(
  "click",
  addImageInput,
);

mediaInputs.addEventListener("click", (event) => {
  if (
    event.target.classList.contains(
      "remove-image-btn",
    )
  ) {
    event.target.closest(".media-input").remove();
  }
});

createListingForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    listingMessage.textContent = "";
    listingMessage.className = "mb-4";

    const formData = new FormData(createListingForm);

    const title = formData.get("title").trim();

    const description = formData
      .get("description")
      .trim();

    const endsAt = new Date(
      formData.get("endsAt"),
    ).toISOString();

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
      endsAt,
      tags,
    };

    if (media.length > 0) {
      listingData.media = media;
    }

    try {
      const listing =
        await createListing(listingData);

      listingMessage.textContent =
        "Listing created successfully!";

      listingMessage.className =
        "alert alert-success";

      setTimeout(() => {
        window.location.href =
          `./listing.html?id=${listing.id}`;
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