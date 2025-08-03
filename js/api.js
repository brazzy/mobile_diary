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
 * Fetches content for a specific day from the backend
 * @param {string} date - The date of the day
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

    const currentTimestamp = new Date().getTime();
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
