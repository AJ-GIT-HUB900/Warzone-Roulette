Warzone-Roulette
# Warzone Drop and Loadout Roulette

A lightweight, browser-based randomized generator for Call of Duty: Warzone. When your squad cannot agree on a drop spot or you want to challenge yourselves with chaotic weapon combinations, this tool makes the tactical decisions for you.

## Features

* **Drop Randomizer:** Instantly selects a landing zone from the current Warzone map.
* **Loadout Generator:** Forces a random Primary and Secondary weapon combination.
* **Responsive Design:** Dark, high-contrast UI that scales perfectly on both desktop and mobile devices, making it easy to use during the pre-game lobby.
* **Zero Dependencies:** Built entirely with plain HTML, CSS, and JavaScript. No installations or package managers required.

## Technologies Used

* HTML5
* CSS3
* Vanilla JavaScript

## Getting Started

### Running Locally

To run this project on your own machine, you only need a web browser.

1. Clone this repository:
   `git clone https://github.com/AJ-GIT-HUB900/warzone-roulette.git`
2. Navigate into the project directory.
3. Double-click the `index.html` file to open it in your default web browser. 

### Hosting on GitHub Pages

Since this is a static web app, you can host it for free directly from this repository to share with your friends.

1. Go to your repository **Settings** on GitHub.
2. Navigate to the **Pages** section on the left sidebar.
3. Under **Build and deployment**, set the Source to **Deploy from a branch**.
4. Select your `main` (or `master`) branch and click **Save**.
5. Wait a few minutes, and GitHub will provide you with a live URL to share with your squad.

## Customization

Call of Duty updates frequently, bringing new maps and weapon metas. You can easily update this app to reflect the current season.

1. Open `script.js` in your text editor.
2. Locate the `dropLocations`, `primaryWeapons`, and `secondaryWeapons` arrays at the top of the file.
3. Add, remove, or modify the text inside these arrays to match the current game data. 
4. Save the file and refresh your browser. The randomizer will automatically adjust to the new list sizes.

## License

This project is open-source and available for anyone to use, modify, or distribute.
