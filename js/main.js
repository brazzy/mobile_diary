// main.js - Main entry point for the application

document.addEventListener('DOMContentLoaded', () => {
    initializeHeader();
    initializeSettingsModal();
    initializeApp();
});

// Global variable to store the current day data
let currentDayData = null;

/**
 * Initialize the application
 * - Compute the current date
 * - Fetch day data
 * - Display day content in the UI
 */
async function initializeApp() {
    try {
        // Get the current date in the format required by the API: "YYYY-MM-DD (EEE)"
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        // Get day name abbreviation (Sun, Mon, etc.)
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[now.getDay()];
        
        const formattedDate = `${year}-${month}-${day} (${dayName})`;
        
        // Update the day message
        document.getElementById('day-message').textContent = '';
        
        // Fetch the day data
        currentDayData = await fetchDay(formattedDate);
        
        // Display the day content in the UI
        displayDayContent(currentDayData);
    } catch (error) {
        console.error('Failed to initialize app:', error);
        document.getElementById('diary-container').innerHTML = `
            <div class="error-message">
                <h3>Error loading diary</h3>
                <p>${error.message}</p>
                <p>Please check your settings and try again.</p>
            </div>
        `;
    }
}

/**
 * Display day content in the UI
 * @param {Object} dayData - The day data to display
 */
function displayDayContent(dayData) {
    if (!dayData) return;
    
    // Get the container
    const container = document.getElementById('diary-container');
    
    // Clear previous content (except the current-day element)
    const currentDayElement = document.getElementById('current-day');
    container.innerHTML = '';
    container.appendChild(currentDayElement);
    
    // Create title element (header)
    const titleElement = document.createElement('h2');
    titleElement.id = 'diary-title';
    titleElement.textContent = dayData.title || 'Untitled';
    container.appendChild(titleElement);
    
    // Create text element (textarea)
    const textElement = document.createElement('textarea');
    textElement.id = 'diary-text';
    textElement.value = dayData.text || '';
    textElement.placeholder = 'Write your diary entry here...';
    
    // Set appropriate height for the textarea
    textElement.rows = 15;
    textElement.style.width = '100%';
    textElement.style.boxSizing = 'border-box';
        
    container.appendChild(textElement);
}

function initializeHeader() {
}

