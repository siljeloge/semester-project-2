import { getProfile, updateProfile } from "./api/profiles.js";

const editProfileForm = document.querySelector("#editProfileForm");
const profileMessage = document.querySelector("#profileMessage");

const token = localStorage.getItem("accessToken");
const name = localStorage.getItem("name");

let profileLoaded = false;
let isProcessing = false;

if (!token || !name) {
  window.location.href = "./login.html";
}

/**
 * Displays feedback to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The Bootstrap alert type.
 */
function showProfileMessage(message, type = "danger") {
  if (!profileMessage) {
    return;
  }

  profileMessage.textContent = message;
  profileMessage.className = `alert alert-${type}`;
}

/**
 * Checks whether a URL uses HTTP or HTTPS.
 * @param {string} url - The URL to validate.
 * @returns {boolean} Whether the URL is valid.
 */
function isValidImageUrl(url) {
  try {
    const parsedUrl = new URL(url);

    return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Enables or disables the profile form.
 * @param {boolean} disabled - Whether the form should be disabled.
 */
function setFormDisabled(disabled) {
  if (!editProfileForm) {
    return;
  }

  editProfileForm
    .querySelectorAll("input, textarea, button")
    .forEach((element) => {
      element.disabled = disabled;
    });
}

/**
 * Fills the form with the user's current profile information.
 * @param {Object} profile - The user's profile.
 */
function fillProfileForm(profile) {
  const avatarInput = document.querySelector("#avatar");
  const bannerInput = document.querySelector("#banner");
  const bioInput = document.querySelector("#bio");

  if (avatarInput) {
    avatarInput.value = profile.avatar?.url || "";
  }

  if (bannerInput) {
    bannerInput.value = profile.banner?.url || "";
  }

  if (bioInput) {
    bioInput.value = profile.bio || "";
  }
}

/**
 * Loads the current profile information.
 */
async function loadProfile() {
  if (!token || !name || !editProfileForm) {
    return;
  }

  setFormDisabled(true);

  try {
    const profile = await getProfile(name);

    fillProfileForm(profile);

    profileLoaded = true;
    setFormDisabled(false);
  } catch (error) {
    console.error("Could not load profile:", error);

    showProfileMessage(
      "Could not load profile. Please refresh the page to try again.",
    );
  }
}

/**
 * Handles updating the user's profile.
 * @param {SubmitEvent} event - The form submit event.
 */
async function handleUpdateProfile(event) {
  event.preventDefault();

  if (!profileLoaded || isProcessing) {
    return;
  }

  profileMessage.textContent = "";
  profileMessage.className = "mb-4";

  const formData = new FormData(editProfileForm);

  const avatarUrl = String(formData.get("avatar") || "").trim();
  const bannerUrl = String(formData.get("banner") || "").trim();
  const bio = String(formData.get("bio") || "").trim();

  // Validate image URLs when provided.
  if (avatarUrl && !isValidImageUrl(avatarUrl)) {
    showProfileMessage(
      "Please enter a valid avatar URL starting with http:// or https://.",
    );
    return;
  }

  if (bannerUrl && !isValidImageUrl(bannerUrl)) {
    showProfileMessage(
      "Please enter a valid banner URL starting with http:// or https://.",
    );
    return;
  }

  const profileData = {
    bio,
  };

  if (avatarUrl) {
    profileData.avatar = {
      url: avatarUrl,
      alt: `${name} avatar`,
    };
  }

  if (bannerUrl) {
    profileData.banner = {
      url: bannerUrl,
      alt: `${name} banner`,
    };
  }

  isProcessing = true;
  setFormDisabled(true);

  showProfileMessage("Saving profile...", "info");

  try {
    await updateProfile(name, profileData);

    showProfileMessage("Profile updated successfully!", "success");

    setTimeout(() => {
      window.location.href = "./profile.html";
    }, 1000);
  } catch (error) {
    console.error("Could not update profile:", error);

    showProfileMessage(
      error.message || "Could not update profile. Please try again.",
    );

    isProcessing = false;
    setFormDisabled(false);
  }
}

// Set up the page when the required elements exist.
if (editProfileForm && profileMessage) {
  profileMessage.setAttribute("aria-live", "polite");

  // Prevent editing until the current profile has loaded.
  setFormDisabled(true);

  editProfileForm.addEventListener("submit", handleUpdateProfile);

  loadProfile();
}
