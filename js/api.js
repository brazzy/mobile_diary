// api.js - Communication with backend

/**
 * Creates headers with basic authentication from localStorage credentials
 * @returns {Headers} Headers object with Authorization if credentials exist
 */
function createAuthHeaders() {
    const user = localStorage.getItem('user') || '';
    const password = localStorage.getItem('password') || '';
    const headers = new Headers();
    if (user) headers.append('Authorization', 'Basic ' + btoa(user + ':' + password));
    return headers;
}

/**
 * Creates a UTC timestamp in the format "YYYYMMDDHHMMSSsss"
 * @returns {string} UTC timestamp string
 */
function createUTCTimestamp() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
}

/**
 * Fetches content for a specific day from the backend
 * @param {string} date - The date of the day, in the format "YYYY-MM-DD (EEE)" e.g. "2025-08-03 (Sun)"
 * @returns {Promise<Object>} - Object containing the fetched content and status information
 */
async function fetchDay(date) {
    const baseUrl = localStorage.getItem('baseUrl');
    if (!baseUrl || !date) {
        throw new Error('Missing configuration or item title.');
    }

    const headers = createAuthHeaders();
    const url = `${baseUrl}/recipes/default/tiddlers/${encodeURIComponent(date)}`;
    const response = await fetch(url, { headers });
    
    if(response.status == 404) {
        const currentTimestamp = createUTCTimestamp();
        return {
            bag: "default",
            type: "text/vnd.tiddlywiki",
            title: date,
            text: "",
            tags: "Journal",
            modified: currentTimestamp,
            created: currentTimestamp,
        };

    }
    else if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    return response.json();        
}


/**
 * Updates a day on the server
 * @param {Object} dayData - The day data to update
 * @returns {Promise<Object>} - Object containing status information
 */
async function updateDay(dayData) {
    const baseUrl = localStorage.getItem('baseUrl');
    const headers = createAuthHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Requested-With', 'TiddlyWiki');

    const currentTimestamp = createUTCTimestamp();
    dayData.modified = currentTimestamp;

    // Send the day data to the server
    const url = `${baseUrl}/recipes/default/tiddlers/${encodeURIComponent(dayData.title)}`;
    const putResponse = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(dayData)
    });
        
    if (!putResponse.ok) throw new Error(`HTTP Error creating task: ${putResponse.status}`);
        
    return dayData;
}

/**
 * Searches for tiddlers matching the search text
 * @param {string} searchText - The text to search for
 * @returns {Promise<string[]>} - Array of matching tiddler titles
 */
async function search(searchText) {
    const baseUrl = localStorage.getItem('baseUrl');
    if (!baseUrl) {
        throw new Error('Missing base URL configuration.');
    }

    const headers = createAuthHeaders();
    const filterValue = `[regexp[(?i).*${searchText}.*]]`;
    const url = `${baseUrl}/recipes/default/tiddlers.json?filter=${encodeURIComponent(filterValue)}`;
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
    const tiddlers = await response.json();
    
    // Extract titles from the tiddlers array
    return tiddlers.map(tiddler => tiddler.title);
}

/**
 * Uploads an image to the server
 * @param {ArrayBuffer} imageData - The image data as ArrayBuffer
 * @param {string} title - The title for the image
 * @returns {Promise<Object>} - Object containing the uploaded image data and status information
 */
async function uploadImage(imageData, title) {
    const baseUrl = localStorage.getItem('baseUrl');
    if (!baseUrl || !title) {
        throw new Error('Missing configuration or image title.');
    }
    // Determine image type based on title suffix
    const imageType = title.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    // Variable to store the final image data
    let base64ImageData;

    // Dynamically load the Jimp library
    try {
        // Create a script element to load the Jimp library
        if (!window.Jimp) {
            const { Jimp } = await import('/files/jimp_1.6.0.js');
            window.Jimp = Jimp;
        }
        
        // Create a Jimp image from the ArrayBuffer
        const jimpImage = await window.Jimp.fromBuffer(imageData);
        
        // Check if the image is wider than 900 pixels
        if (jimpImage.bitmap.width > 900) {
            // Resize the image to 900 width while maintaining aspect ratio
            jimpImage.resize({ w: 900 });
        }
        
        // Convert to base64 for storage
        base64ImageData = await jimpImage.getBase64(imageType, {quality: 80});
        // remove data url prefic
        base64ImageData = base64ImageData.split(',')[1];
    } catch (error) {
        console.error('Image processing failed:', error);
        throw new Error('Failed to process image data');
    }

    const headers = createAuthHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Requested-With', 'TiddlyWiki');
    
    // Create the data object
    const imageObject = {
        title: title,
        text: base64ImageData,  // base64 encoded image data
        type: imageType,
        created: createUTCTimestamp(),
    };

    // Send the image data to the server
    const url = `${baseUrl}/recipes/default/tiddlers/${encodeURIComponent(title)}`;
    const putResponse = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(imageObject)
    });
        
    if (!putResponse.ok) throw new Error(`HTTP Error uploading image: ${putResponse.status}`);
        
    return imageObject;
}

// Export the API functions
export { fetchDay, updateDay, search, uploadImage };
