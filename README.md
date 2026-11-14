# MyBid – Semester Project 2

MyBid is a student auction website developed as part of Semester Project 2 at Noroff. Registered users can create auction listings, place bids using virtual credits, and manage their profiles. Visitors can browse, search, and view listings without creating an account.

The application is built with HTML, Vanilla JavaScript, Bootstrap 5, Sass, and the Noroff API v2.

## Live Website

[Visit MyBid](https://siljeloge.github.io/semester-project-2/)

## Features

### All Users
- Browse auction listings
- Search listings by keywords
- Filter listings by bid status
- Sort listings by newest, oldest, or ending soon
- View listing details and image galleries
- View bid history
- See countdown timers for active auctions
- Load more listings

### Registered Users
- Register using a `@stud.noroff.no` email address
- Log in and log out
- View available credits
- Create, edit, and delete their own listings
- Place bids on other users' listings
- View their own listings and bidding activity
- Update their profile bio, avatar, and banner

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (ES6 modules)
- Bootstrap 5
- Sass
- Noroff API v2 – Auction House API
- Figma
- GitHub Projects
- GitHub Pages

## Installation

To run the project locally:

1. Clone the repository:

   `git clone https://github.com/siljeloge/semester-project-2.git`

2. Navigate to the project folder:

   `cd semester-project-2`

3. Install dependencies:

   `npm install`

4. Compile the Sass files:

   `npm run build`

5. Open `index.html` using a local development server, such as VS Code Live Server.

### Development

To watch for Sass changes during development:

`npm run dev`

## Project Structure

The project uses separate JavaScript modules for API requests, authentication, page functionality, and reusable UI components.

- `src/js/api/` – API configuration and requests
- `src/js/ui/` – Reusable interface elements
- `src/js/` – Page-specific functionality
- `src/scss/` – Sass stylesheets
- `dist/css/` – Compiled CSS
- HTML files – Individual application pages

## Design and Prototypes

MyBid was designed in Figma before development.

The design includes a style guide with a logo, colour palette, typography, and reusable components, as well as high-fidelity desktop and mobile layouts.

The visual identity uses burgundy and pink colours, with DM Sans and DM Serif Display typography.

Separate interactive prototypes were created for desktop and mobile to demonstrate the application's navigation, layouts, and main user interfaces.

- **[Figma Design and Style Guide](https://www.figma.com/design/vvYF0E5yLa3NAApYB4bhQJ/Semester-Project-2---mybid?node-id=1-4)**
- **[Desktop Interactive Prototype](https://www.figma.com/proto/vvYF0E5yLa3NAApYB4bhQJ/Semester-Project-2---mybid?node-id=9-178&p=f&viewport=17%2C241%2C0.3&t=zv9PsaBtSfToAwNt-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=9%3A178&page-id=1%3A2)**
- **[Mobile Interactive Prototype](https://www.figma.com/proto/vvYF0E5yLa3NAApYB4bhQJ/Semester-Project-2---mybid?node-id=77-1619&p=f&viewport=-894%2C20%2C0.39&t=1zadKj1Pe2Euhq9A-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=77%3A1619&page-id=1%3A3)**

## Project Management

GitHub Projects was used to organise development tasks using a Kanban board and a Roadmap view.

Tasks were organised into Todo, In Progress, Testing, and Done to track progress throughout the project.

[GitHub Projects Board](https://github.com/users/siljeloge/projects/7)

## Testing

The application was manually tested throughout development, including:

- Registration, login, and logout
- Browsing, searching, sorting, and filtering listings
- Creating, editing, and deleting listings
- Placing bids and viewing bid history
- Displaying and updating credit balances
- Editing profile information
- Visitor restrictions
- Responsive layouts on different screen sizes

Browser developer tools and Lighthouse were also used to identify potential issues and areas for improvement.

## Deployment

The application is deployed using GitHub Pages.

The compiled CSS is included in the repository so the deployed website can load the styling without requiring a separate build process.

## Author

Developed by Silje Loge as part of Semester Project 2 at Noroff.

[GitHub Repository](https://github.com/siljeloge/semester-project-2)