import {
  getProfile,
  updateProfile,
} from "./api/profiles.js";

const editProfileForm =
  document.querySelector("#editProfileForm");

const profileMessage =
  document.querySelector("#profileMessage");

const token = localStorage.getItem("accessToken");
const name = localStorage.getItem("name");

if (!token || !name) {
  window.location.href = "./login.html";
}

/**
 * Fills the form with the user's current profile information.
 * @param {Object} profile - The user's profile.
 */
function fillProfileForm(profile) {
  document.querySelector("#avatar").value =
    profile.avatar?.url || "";

  document.querySelector("#banner").value =
    profile.banner?.url || "";

  document.querySelector("#bio").value =
    profile.bio || "";
}

/**
 * Loads the current profile.
 */
async function loadProfile() {
  try {
    const profile = await getProfile(name);

    fillProfileForm(profile);
  } catch (error) {
    console.error(error);

    profileMessage.textContent =
      "Could not load profile.";

    profileMessage.className =
      "alert alert-danger";
  }
}

editProfileForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    profileMessage.textContent = "";
    profileMessage.className = "mb-4";

    const formData = new FormData(editProfileForm);

    const avatarUrl =
      formData.get("avatar").trim();

    const bannerUrl =
      formData.get("banner").trim();

    const bio = formData.get("bio").trim();

    const profileData = {
      bio,
      avatar: {
        url: avatarUrl,
        alt: `${name} avatar`,
      },
      banner: {
        url: bannerUrl,
        alt: `${name} banner`,
      },
    };

    try {
      await updateProfile(name, profileData);

      profileMessage.textContent =
        "Profile updated successfully!";

      profileMessage.className =
        "alert alert-success";

      setTimeout(() => {
        window.location.href = "./profile.html";
      }, 1000);
    } catch (error) {
      console.error(error);

      profileMessage.textContent =
        error.message;

      profileMessage.className =
        "alert alert-danger";
    }
  },
);

loadProfile();