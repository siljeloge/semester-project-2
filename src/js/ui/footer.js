const footerNav = document.querySelector("#footerNav");

/**
 * Displays footer navigation based on the user's login status.
 */
function displayFooter() {
  if (!footerNav) {
    return;
  }

  const token = localStorage.getItem("accessToken");

  const browseLink = `
    <a href="./index.html">Browse</a>
  `;

  const loggedInLinks = `
    <a href="./create-listing.html">Sell</a>
    <a href="./profile.html">My profile</a>
  `;

  const loggedOutLinks = `
    <a href="./login.html">Log in</a>
    <a href="./register.html" class="btn btn-light btn-sm">
      Sign up
    </a>
  `;

  footerNav.innerHTML = `
    ${browseLink}
    ${token ? loggedInLinks : loggedOutLinks}
  `;
}

displayFooter();
