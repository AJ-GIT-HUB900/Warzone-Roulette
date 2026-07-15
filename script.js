// ==========================================
// Urzikstan Tactical Overlay Engine [v2.1]
// ==========================================

/* --- Core Configuration & Data Sets [Season 3 META] --- */
// Expanded data arrays for maximum complexity

const dropLocationsUrzikstan = [
    // [Name, VisualCoordinates (X% Y%), TerrainType, POI_ID]
    ["Levin Resort", "38% 30%", "Urb_HighRise", "RESORT_COMPLEX"],
    ["Popov Power", "72% 21%", "Ind_Industrial", "POWER_GRID"],
    ["Zaravan City", "18% 70%", "Urb_Dense", "CITY_CENTER"],
    ["Shahin Manor", "88% 50%", "Urb_LowRise", "MANOR_ESTATE"],
    ["Old Town", "54% 68%", "Urb_HighRise", "OLD_TOWN"],
    ["Urzikstan Cargo", "10% 41%", "Ind_Seaport", "CARGO_DOCKS"],
    ["Low Town", "45% 82%", "Urb_Slum", "LOW_TOWN"],
    ["Orlov Military Base", "91% 15%", "Mil_Complex", "MIL_BASE"],
    ["Zaravan Suburbs", "34% 52%", "Urb_Slum", "SUBURBS_NORTH"],
    ["Seaport District", "15% 23%", "Ind_Seaport", "PORT_DOCKS"],
    ["Hadiqa Farms", "65% 58%", "Env_Agri", "FARMLANDS"],
    ["Urzikstan Stadium (POI)", "51% 37%", "Urb_Special", "STADIUM_DOMED"] // The Domed structure in image_0.png
];

const primaryWeapons = [
    ["MCW", "Assault Rifle"], ["SVA 545", "Assault Rifle"], ["MTZ-556", "Assault Rifle"],
    ["Holger 556", "Assault Rifle"], ["RAM-7", "Assault Rifle"], ["BP50", "Assault Rifle"],
    ["BAS-B", "Battle Rifle"], ["MTZ-762", "Battle Rifle"], ["Sidewinder", "Battle Rifle"],
    ["HR-68", "Sniper Rifle"], ["KATT-AMR", "Sniper Rifle"], ["XRK Stalker", "Sniper Rifle"],
    ["Pulemyot 762", "LMG"], ["DG-58 LSW", "LMG"], ["TAQ Eradicator", "LMG"], ["Bruen Mk9", "LMG"],
    ["Rival-9", "SMG"], ["WSP Swarm", "SMG"], ["Striker", "SMG"], ["AMR9", "SMG"],
    ["Haymaker", "Shotgun"], ["Lockwood 680", "Shotgun"], ["Riveter", "Shotgun"]
];

const secondaryWeapons = [
    ["WSP Swarm (Akimbo)", "SMG [A]"], ["Striker (Akimbo)", "SMG [A]"], ["Rival-9 (Akimbo)", "SMG [A]"],
    ["COR-45 (Akimbo)", "Handgun [A]"], ["Renetti", "Handgun"], ["Combat Knife", "Melee"],
    ["Haymaker (Tactical)", "Shotgun"], ["Lockwood 680", "Shotgun"]
];

// Complex positional data derived from image_0.png coordinate space
const aerialTargets = [
    { id: "helicopter-a", coords: "17% 8%" }, // The left one with dust
    { id: "helicopter-b", coords: "77% 20%" } // The right one
];

const fixedPois = [
    { id: "distant-stadium", coords: "51% 37%" } // The large dome
];

/* --- System State Management --- */
let sessionLogEntryCount = 0;
let isRolling = false;
let currentRollSequence = null; // Store interval ID

/* --- DOM Element Cache --- */
const elements = {
    appWrapper: document.getElementById("app-wrapper"),
    visualizer: document.getElementById("background-visualizer"),
    metaTicker: document.getElementById("meta-ticker"),
    appStatus: document.getElementById("application-status"),
    
    rollBtn: document.getElementById("roll-btn"),
    weaponDisplay: document.getElementById("weapon-display-area"),
    
    dropLocation: document.getElementById("drop-location"),
    visualCoords: document.getElementById("visual-coords"),
    visualTerrain: document.getElementById("visual-terrain"),
    
    primary: document.getElementById("primary-weapon"),
    primaryRole: document.getElementById("primary-role"),
    secondary: document.getElementById("secondary-weapon"),
    secondaryRole: document.getElementById("secondary-role"),
    
    sessionLog: document.getElementById("session-log"),
    poiLayer: document.getElementById("poi-visualization-layer"),
    targetLocation: document.getElementById("visual-target-location")
};

/* --- Core Logic Functions --- */

/**
 * Initialize the scene by positioning POI markers 
 * based on image_0.png visual coordinate space.
 */
function initializeSceneVisuals() {
    console.log(">> Initializing Visual Scene Context (image_0.png)");
    elements.metaTicker.textContent = `IMAGE_CONTEXT: image_0.png`;
    
    // Position the Aerial Targets (Helicopters)
    aerialTargets.forEach(target => {
        const marker = document.getElementById(target.id);
        if(marker) {
            const [x, y] = target.coords.split(' ');
            marker.style.left = x;
            marker.style.top = y;
            console.log(`>> Positioning Aerial Target [${target.id}] at ${target.coords}`);
        }
    });

    // Position Fixed POIs (Stadium)
    fixedPois.forEach(poi => {
        const marker = document.getElementById(poi.id);
        if(marker) {
            const [x, y] = poi.coords.split(' ');
            marker.style.left = x;
            marker.style.top = y;
            console.log(`>> Positioning Fixed POI [${poi.id}] at ${poi.coords}`);
        }
    });
}

/**
 * Executes the complex Roulette sequence: animation -> data generation -> display update -> visual feedback
 */
function rollTacticalRoulette() {
    // Safety check: Prevent spam clicking
    if (isRolling) return;
    isRolling = true;

    // 1. SYSTEM STATE: TRIGGERED
    logSessionEntry("System trigger received.", "roll-trigger");
    elements.rollBtn.dataset.state = "rolling";
    elements.appStatus.textContent = "RUNNING ALGORITHM...";
    elements.appStatus.className = "status-active";
    
    // Hide weapons while rolling
    elements.weaponDisplay.classList.add("locked-off");
    elements.weaponDisplay.classList.remove("locked-on");
    
    // reset location visualization
    resetVisualTarget();

    // 2. THE ANIMATION: Complex multi-slot rapid update
    // Impressive visualization: rapid data change every 75ms for 1.2s
    const animationDuration = 1200; 
    const updateInterval = 75; 
    let animationStep = 0;

    currentRollSequence = setInterval(() => {
        animationStep++;
        
        // Rapid random data display for chaotic visualization
        // Locations
        const tempDrop = generateRandomIndex(dropLocationsUrzikstan);
        elements.dropLocation.textContent = tempDrop[0];
        elements.dropLocation.className = "status-warning";
        
        // Weapons (Primaries)
        const tempPrimary = generateRandomIndex(primaryWeapons);
        elements.primary.textContent = tempPrimary[0];
        
        // Weapons (Secondaries)
        const tempSecondary = generateRandomIndex(secondaryWeapons);
        elements.secondary.textContent = tempSecondary[0];
        
        // Coordinate Ticker (Pure visual effect, random coordinates in Urzikstan space)
        elements.visualCoords.textContent = `${Math.floor(Math.random()*100)}% ${Math.floor(Math.random()*100)}%`;

        // Duration Check: Stop the animation
        if (animationStep * updateInterval >= animationDuration) {
            clearInterval(currentRollSequence);
            
            // 3. GENERATE FINAL DATA
            executeRouletteCompletion();
        }
    }, updateInterval);
}

/**
 * Handle the completion of the roulette sequence: Final data lock and feedback visualization
 */
function executeRouletteCompletion() {
    console.log(">> Algorithm completion phase initiated.");
    
    // Randomly select final indices
    const finalDrop = generateRandomIndex(dropLocationsUrzikstan);
    const finalPrimary = generateRandomIndex(primaryWeapons);
    const finalSecondary = generateRandomIndex(secondaryWeapons);

    // 4. UI UPDATE: DISPLAY FINAL DATA
    // Drop Location Panel
    elements.dropLocation.textContent = finalDrop[0];
    elements.dropLocation.className = "status-neutral"; // Reset pulsing text
    elements.visualCoords.textContent = finalDrop[1];
    elements.visualTerrain.textContent = finalDrop[2];

    // Primary Slot
    elements.primary.textContent = finalPrimary[0];
    elements.primaryRole.textContent = finalPrimary[1];

    // Secondary Slot
    elements.secondary.textContent = finalSecondary[0];
    elements.secondaryRole.textContent = finalSecondary[1];

    // Unlock Weapons Panel
    elements.weaponDisplay.classList.remove("locked-off");
    elements.weaponDisplay.classList.add("locked-on");

    // 5. COMPLEX VISUAL FEEDBACK: Location POI Lock-on
    visualizeLocationLockon(finalDrop[1]);

    // 6. SYSTEM STATE: COMPLETE
    elements.rollBtn.dataset.state = "idle";
    elements.appStatus.textContent = "DELEGATION LOCKED.";
    elements.appStatus.className = "status-neutral";

    // Update Intelligence Log
    logSessionEntry(`Location lock established: [${finalDrop[3]}: ${finalDrop[0]}]`, "location-lock");
    logSessionEntry(`Weapon lock [P]: <span type="P">${finalPrimary[0]}</span>`, "weapon-lock");
    logSessionEntry(`Weapon lock [S]: <span type="S">${finalSecondary[0]}</span>`, "weapon-lock");

    // reset rolling state
    isRolling = false;
}

/* --- Visual and Utility Functions --- */

/**
 * Position and lock-on the target location marker based 
 * on image_0.png visual coordinate space.
 */
function visualizeLocationLockon(coordinateString) {
    const [x, y] = coordinateString.split(' ');
    console.log(`>> Visualization Target locked: ${coordinateString}`);
    
    // Position the absolute marker
    elements.targetLocation.style.left = x;
    elements.targetLocation.style.top = y;
    
    // Trigger visual state change (CSS animation)
    elements.targetLocation.classList.remove("locked-off");
    elements.targetLocation.classList.add("locked-on");
}

function resetVisualTarget() {
    elements.targetLocation.classList.add("locked-off");
    elements.targetLocation.classList.remove("locked-on");
}

/**
 * Add a context-aware entry to the Intelligence Log panel
 */
function logSessionEntry(message, type = "default") {
    sessionLogEntryCount++;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entryId = `#${sessionLogEntryCount.toString().padStart(3, '0')}`;
    
    // Create detailed HTML entry structure
    const entryHTML = `<div class="log-entry ${type}">
        <span class="log-id">${entryId}</span> 
        <span class="log-time">[${timestamp}]</span> 
        <span class="log-prefix">>></span> 
        <span class="log-msg">${message}</span>
    </div>`;
    
    // Add to top of log and scroll to ensure visibility
    elements.sessionLog.innerHTML += entryHTML;
    elements.sessionLog.scrollTop = elements.sessionLog.scrollHeight;
}

/**
 * Complex data generator: Selects random entry and performs validation (no secondary primary meta check example)
 */
function generateRandomIndex(arrayData) {
    // Maximum possible amount of complex logic: check for meta notes
    let selectedIndex = Math.floor(Math.random() * arrayData.length);
    let selectedEntry = arrayData[selectedIndex];
    
    // Complex validation (example): Ensure secondary role doesn't conflict with main aesthetic of 'Snow Suit Camo' character.
    // (A very complex, niche optimization rule)
    if(selectedEntry.length > 2 && selectedEntry[1] === "Melee" && elements.metaTicker.textContent.includes("SNOW_SUIT")) {
         console.log(">> Meta validation [MELEE_CONFLICT] triggered for 'Snow Suit'. Rerolling Secondary.");
         // Basic Reroll
         return generateRandomIndex(arrayData);
    }

    return selectedEntry;
}


/* --- Execution Initialization --- */

// 1. Initialize Visual Scene POIs on Image Context
initializeSceneVisuals();

// 2. Event Listener: Tactical Trigger
elements.rollBtn.addEventListener("click", rollTacticalRoulette);
