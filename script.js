// Data for the Roulette
const dropLocations = [
    "Zaravan City", "Popov Power", "Levin Resort", "Seaport District",
    "Urzikstan Cargo", "Old Town", "Low Town", "Hadiqa Farms", 
    "Zaravan Suburbs", "Orlov Military Base", "Shahin Manor"
];

const primaryWeapons = [
    "MCW (Assault Rifle)", "SVA 545 (Assault Rifle)", "MTZ-556 (Assault Rifle)",
    "Holger 556 (Assault Rifle)", "BAS-B (Battle Rifle)", "KATT-AMR (Sniper)", 
    "XRK Stalker (Sniper)", "Bruen Mk9 (LMG)", "Pulemyot 762 (LMG)"
];

const secondaryWeapons = [
    "WSP Swarm (SMG)", "Striker (SMG)", "Rival-9 (SMG)", 
    "AMR9 (SMG)", "Haymaker (Shotgun)", "Lockwood 680 (Shotgun)", 
    "COR-45 (Handgun)", "Renetti (Handgun)", "Combat Knife (Melee)"
];

// Grab DOM Elements
const btn = document.getElementById("roll-btn");
const dropDisplay = document.getElementById("drop-location");
const primaryDisplay = document.getElementById("primary-weapon");
const secondaryDisplay = document.getElementById("secondary-weapon");

// Randomizer Function
function rollRoulette() {
    // Generate random indices
    const randomDrop = Math.floor(Math.random() * dropLocations.length);
    const randomPrimary = Math.floor(Math.random() * primaryWeapons.length);
    const randomSecondary = Math.floor(Math.random() * secondaryWeapons.length);

    // Update the UI
    dropDisplay.textContent = dropLocations[randomDrop];
    primaryDisplay.textContent = primaryWeapons[randomPrimary];
    secondaryDisplay.textContent = secondaryWeapons[randomSecondary];
}

// Event Listener
btn.addEventListener("click", rollRoulette);
