
import { getProfile } from "../api/profiles.js";

const token = localStorage.getItem("accessToken");
const name = localStorage.getItem("name");

const mainNav = document.querySelector("#mainNav");

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
 * Returns a valid avatar URL or null.
 * @param {string} url - The avatar URL.
 * @returns {string|null} A valid URL or null.
 */
function getSafeAvatarUrl(url) {
  if (!url) {
    return null;
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
    return null;
  }

  return null;
}

/**
 * Logs the user out and returns to the home page.
 */
function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("apiKey");
  localStorage.removeItem("name");
  localStorage.removeItem("email");

  // Remove old values from earlier development too.
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "./index.html";
}

/**
 * Sets up the profile dropdown menu.
 */
function setupProfileMenu() {
  const profileButton = document.querySelector("#profileButton");
  const profileMenu = document.querySelector("#profileMenu");
  const logoutButton = document.querySelector("#logoutButton");

  if (!profileButton || !profileMenu) {
    return;
  }

  function closeProfileMenu() {
    profileMenu.classList.remove("show");
    profileButton.setAttribute("aria-expanded", "false");
  }

  profileButton.addEventListener("click", () => {
    const isOpen = profileMenu.classList.toggle("show");

    profileButton.setAttribute("aria-expanded", String(isOpen));
  });

  logoutButton?.addEventListener("click", logout);

  // Close the menu when clicking outside it.
  document.addEventListener("click", (event) => {
    if (
      !profileMenu.contains(event.target) &&
      !profileButton.contains(event.target)
    ) {
      closeProfileMenu();
    }
  });

  // Close the menu using the Escape key.
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      profileMenu.classList.contains("show")
    ) {
      closeProfileMenu();
      profileButton.focus();
    }
  });
}

/**
 * Displays the navigation for a logged-in user.
 * @param {Object|null} profile - The logged-in profile.
 */
function renderLoggedInHeader(profile = null) {
  if (!mainNav) {
    return;
  }

  const avatar = getSafeAvatarUrl(profile?.avatar?.url);
  const profileName = escapeHTML(profile?.name || name || "User");

  const initial = escapeHTML(
    (profile?.name || name || "U").charAt(0).toUpperCase(),
  );

  const credits = Number(profile?.credits);

  mainNav.innerHTML = `
    <ul class="navbar-nav ms-auto align-items-md-center gap-md-3">
      <li class="nav-item">
        <a
          class="nav-link"
          href="./index.html"
        >
          Browse
        </a>
      </li>

      <li class="nav-item">
        <a
          class="nav-link"
          href="./create-listing.html"
        >
          Sell
        </a>
      </li>

      <li class="nav-item">
        <span
          class="credit-badge"
          id="headerCredits"
        >
          ${
            Number.isFinite(credits) && profile?.credits != null
              ? `${credits.toLocaleString()} credits`
              : "Credits unavailable"
          }
        </span>
      </li>

      <li class="nav-item profile-menu-wrapper">
        <div class="mobile-profile-row">
          <button
            class="profile-button"
            type="button"
            id="profileButton"
            aria-label="Open profile menu"
            aria-expanded="false"
            aria-controls="profileMenu"
          >
            ${
              avatar
                ? `
                  <img
                    src="${escapeHTML(avatar)}"
                    alt=""
                    class="profile-avatar"
                  />
                `
                : initial
            }
          </button>

          <span class="mobile-profile-name">
            ${profileName}
          </span>
        </div>

        <div
          class="profile-menu"
          id="profileMenu"
        >
          <a href="./profile.html">
            My profile
          </a>

          <button
            type="button"
            id="logoutButton"
          >
            Log out
          </button>
        </div>
      </li>
    </ul>
  `;

  setupProfileMenu();
}

/**
 * Loads and displays the logged-in navigation.
 */
async function displayLoggedInHeader() {
  if (!mainNav || !token || !name) {
    return;
  }

  try {
    const profile = await getProfile(name);
    renderLoggedInHeader(profile);
  } catch (error) {
    console.error("Could not load profile:", error);

    // Keep navigation available if the profile request fails.
    renderLoggedInHeader();
  }
}

/**
 * Updates the credit balance displayed in the header.
 */
async function updateHeaderCredits() {
  if (!token || !name) {
    return;
  }

  try {
    const profile = await getProfile(name);
    const creditBadge = document.querySelector("#headerCredits");

    if (creditBadge) {
      creditBadge.textContent =
        `${profile.credits.toLocaleString()} credits`;
    }
  } catch (error) {
    console.error("Could not update header credits:", error);
  }
}

displayLoggedInHeader();

document.addEventListener("creditsUpdated", updateHeaderCredits);
