const footerNav = document.querySelector("#footerNav");

const token = localStorage.getItem("accessToken");

function displayFooter() {
  if (!footerNav) {
    return;
  }

  if (token) {
    footerNav.innerHTML = `
      <a href="./index.html">Browse</a>
      <a href="./create-listing.html">Sell</a>
      <a href="./profile.html">My profile</a>
    `;
  } else {
    footerNav.innerHTML = `
      <a href="./index.html">Browse</a>
      <a href="./login.html">Log in</a>
      <a href="./register.html" class="btn btn-light btn-sm">
        Sign up
      </a>
    `;
  }
}

displayFooter();