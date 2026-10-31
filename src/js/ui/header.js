import { getProfile } from "../api/profiles.js";

const token = localStorage.getItem("accessToken");
const name = localStorage.getItem("name");

const mainNav = document.querySelector("#mainNav");

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
  const profileButton =
    document.querySelector("#profileButton");

  const profileMenu =
    document.querySelector("#profileMenu");

  const logoutButton =
    document.querySelector("#logoutButton");

  if (!profileButton || !profileMenu) {
    return;
  }

  profileButton.addEventListener("click", () => {
    profileMenu.classList.toggle("show");

    const isOpen =
      profileMenu.classList.contains("show");

    profileButton.setAttribute(
      "aria-expanded",
      isOpen,
    );
  });

  logoutButton?.addEventListener(
    "click",
    logout,
  );

  document.addEventListener(
    "click",
    (event) => {
      if (
        !profileMenu.contains(event.target) &&
        !profileButton.contains(event.target)
      ) {
        profileMenu.classList.remove("show");

        profileButton.setAttribute(
          "aria-expanded",
          "false",
        );
      }
    },
  );
}

/**
 * Displays the navigation for a logged-in user.
 */
async function displayLoggedInHeader() {
  if (!mainNav || !token || !name) {
    return;
  }

  try {
    const profile = await getProfile(name);

    const avatar = profile.avatar?.url;

    mainNav.innerHTML = `
      <ul
        class="navbar-nav ms-auto align-items-md-center gap-md-3"
      >
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
          <span class="credit-badge">
            ${profile.credits.toLocaleString()} credits
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
            >
              ${
                avatar
                  ? `
                    <img
                      src="${avatar}"
                      alt=""
                      class="profile-avatar"
                    />
                  `
                  : profile.name
                      .charAt(0)
                      .toUpperCase()
              }
            </button>

            <span class="mobile-profile-name">
              ${profile.name}
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
  } catch (error) {
    console.error(
      "Could not load profile:",
      error,
    );
  }
}

displayLoggedInHeader();