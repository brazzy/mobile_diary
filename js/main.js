// main.js - Main entry point for the application

document.addEventListener('DOMContentLoaded', () => {
    initializeHeader();
    initializeSettingsModal();
    initializeLinkCombobox();
    initializeApp();
});

// Global variables to store the current day data and date
let currentDayData = null;
let currentDate = new Date();

/**
 * Initialize the application
 * - Compute the current date
 * - Fetch day data
 * - Display day content in the UI
 */
async function initializeApp() {
    try {
        // Reset to current date
        currentDate = new Date();
        
        // Load the day data for the current date
        await loadDayForDate(currentDate);
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
 * Format a date object into the format required by the API: "YYYY-MM-DD (EEE)"
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDateForApi(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get day name abbreviation (Sun, Mon, etc.)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];
    
    return `${year}-${month}-${day} (${dayName})`;
}

/**
 * Load and display the day data for a specific date
 * @param {Date} date - The date to load
 */
async function loadDayForDate(date) {
    try {
        // Format the date for the API
        const formattedDate = formatDateForApi(date);
        
        // Fetch the day data
        currentDayData = await fetchDay(formattedDate);
        
        // Display the day content in the UI
        displayDayContent(currentDayData);
    } catch (error) {
        console.error(`Failed to load day for date ${date}:`, error);
        throw error;
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
    
    const saveStatus = document.getElementById('status-message');
    saveStatus.textContent = '\u00a0';


    // Create save button
    const saveButton = document.createElement('button');
    saveButton.id = 'save-diary-btn';
    saveButton.textContent = 'Save';
    saveButton.className = 'action-button';
    saveButton.addEventListener('click', saveDiaryEntry);
    container.appendChild(saveButton);
    
}

function initializeHeader() {
    // Add event listeners for the prev-day and next-day buttons
    document.getElementById('prev-day').addEventListener('click', navigateToPreviousDay);
    document.getElementById('next-day').addEventListener('click', navigateToNextDay);
    
    // Initialize date picker with current date and add event listener
    const datePicker = document.getElementById('date-picker');
    
    // Format the date for the input (YYYY-MM-DD)
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    datePicker.value = `${year}-${month}-${day}`;
    
    // Add event listener for date changes
    datePicker.addEventListener('change', navigateToSelectedDate);
}

/**
 * Navigate to the previous day
 */
async function navigateToPreviousDay() {
    try {        
        // Calculate the previous day
        const prevDay = new Date(currentDate);
        prevDay.setDate(prevDay.getDate() - 1);
        
        // Update the current date
        currentDate = prevDay;
        
        // Load the day data for the new date
        await loadDayForDate(currentDate);
    } catch (error) {
        console.error('Failed to navigate to previous day:', error);
        alert('Failed to navigate to previous day: ' + error.message);
    }
}

/**
 * Navigate to the next day
 */
async function navigateToNextDay() {
    try {
        // Calculate the next day
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Update the current date
        currentDate = nextDay;
        
        // Load the day data for the new date
        await loadDayForDate(currentDate);
    } catch (error) {
        console.error('Failed to navigate to next day:', error);
        alert('Failed to navigate to next day: ' + error.message);
    }
}

/**
 * Save the current diary entry to the backend
 */
async function saveDiaryEntry() {
    try {
        // Get the text from the textarea
        const textElement = document.getElementById('diary-text');
        const updatedText = textElement.value;
        
        // Update the current day data with the new text
        currentDayData.text = updatedText;
        
        // Save the updated day data to the backend
        await updateDay(currentDayData);
        
        // Show success message
        const saveStatus = document.getElementById('status-message');
        saveStatus.textContent = 'Saved successfully!';
        saveStatus.className = 'success';
        
        // Clear the success message after 3 seconds
        setTimeout(() => {
            saveStatus.textContent = '\u00a0';
            saveStatus.className = '';
        }, 3000);
    } catch (error) {
        console.error('Failed to save diary entry:', error);
        
        // Show error message
        const saveStatus = document.getElementById('status-message');
        saveStatus.textContent = `Error: ${error.message}`;
        saveStatus.className = 'error';
    }
}

/**
 * Navigate to the selected date from the date picker
 */
async function navigateToSelectedDate(event) {
    try {
        // Get the selected date from the date picker
        const selectedDate = new Date(event.target.value);
        
        // Ensure the date is valid
        if (isNaN(selectedDate.getTime())) {
            throw new Error('Invalid date selected');
        }
        
        // Update the current date
        currentDate = selectedDate;
        
        // Load the day data for the selected date
        await loadDayForDate(currentDate);
    } catch (error) {
        console.error('Failed to navigate to selected date:', error);
        alert('Failed to navigate to selected date: ' + error.message);
    }
}

/**
 * Initialize the link combobox functionality
 */
function initializeLinkCombobox() {
    const linkBtn = document.getElementById('link-btn');
    const combobox = document.getElementById('link-combobox');
    const closeBtn = document.getElementById('close-combobox');
    const searchInput = document.getElementById('link-search');
    const resultsList = document.getElementById('link-results');
    
    let debounceTimer;
    let selectedIndex = -1;
    
    // Show combobox when link button is clicked
    linkBtn.addEventListener('click', () => {
        combobox.style.display = 'block';
        searchInput.focus();
    });
    
    // Hide combobox when close button is clicked
    closeBtn.addEventListener('click', () => {
        combobox.style.display = 'none';
        searchInput.value = '';
        resultsList.innerHTML = '';
    });
    
    // Handle input with debounce
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        
        // Reset selected index when input changes
        selectedIndex = -1;
        
        const searchText = searchInput.value.trim();
        if (searchText.length === 0) {
            resultsList.innerHTML = '';
            return;
        }
        
        // Debounce for 500ms
        debounceTimer = setTimeout(async () => {
            try {
                // Call the search function from api.js
                const results = await search(searchText);
                displaySearchResults(results);
            } catch (error) {
                console.error('Search failed:', error);
                resultsList.innerHTML = `<li class="error">Error: ${error.message}</li>`;
            }
        }, 500);
    });
    
    // Handle keyboard navigation in results
    searchInput.addEventListener('keydown', (event) => {
        const items = resultsList.querySelectorAll('li');
        
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelectedItem(items);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelectedItem(items);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < items.length) {
                // Insert selected item
                insertLinkToTextarea(items[selectedIndex].textContent);
            } else {
                // Insert current input value
                insertLinkToTextarea(searchInput.value);
            }
            // Close combobox
            combobox.style.display = 'none';
            searchInput.value = '';
            resultsList.innerHTML = '';
        } else if (event.key === 'Escape') {
            // Close combobox
            combobox.style.display = 'none';
            searchInput.value = '';
            resultsList.innerHTML = '';
        }
    });
    
    // Display search results in the list
    function displaySearchResults(results) {
        resultsList.innerHTML = '';
        
        if (results.length === 0) {
            resultsList.innerHTML = '<li>No results found</li>';
            return;
        }
        
        results.forEach((result, index) => {
            const li = document.createElement('li');
            li.textContent = result;
            li.addEventListener('click', () => {
                insertLinkToTextarea(result);
                combobox.style.display = 'none';
                searchInput.value = '';
                resultsList.innerHTML = '';
            });
            resultsList.appendChild(li);
        });
    }
    
    // Update the selected item in the list
    function updateSelectedItem(items) {
        // Remove selected class from all items
        items.forEach(item => item.classList.remove('selected'));
        
        // Add selected class to current item
        if (selectedIndex >= 0 && selectedIndex < items.length) {
            items[selectedIndex].classList.add('selected');
            // Ensure the selected item is visible
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }
    
    // Insert link to textarea at cursor position
    function insertLinkToTextarea(text) {
        const textarea = document.getElementById('diary-text');
        if (!textarea) return;
        
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const value = textarea.value;
        
        // Create the link format: [[text]]
        const link = `[[${text}]]`;
        
        // Insert the link at cursor position
        textarea.value = value.substring(0, startPos) + link + value.substring(endPos);
        
        // Set cursor position after the inserted link
        const newCursorPos = startPos + link.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
    }
}


