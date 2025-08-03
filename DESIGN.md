# PURPOSE
- "Mobile Diary" implements a mobile client for the diary functionality in TiddlyWiki. it is a pure HTML5, CSS, and JavaScript application.

# FUNCTIONALITY
- It shows a diary entry for the current day and allows to edit it.
- The user can navigate to the previous or next day via buttons in the header or swiping.
- A date selector allows skipping to any day.

# BACKEND
- The [API of TiddlyWiki](https://tiddlywiki.com/#WebServer%20API) is used to retrieve, create and update diary entries.
- A base URL and authentication data for  HTTP Basic Auth are stored in local storage 
  and can be edited via the application's settings.

# STRUCTURE
- The application entry point is diary.html
- style.css contains the stylesheet
- JavaScript code is organized into modular components in the js/ directory:
  - main.js: Main entry point that initializes all components
  - init.js: Setup, initialization, and helper functions
  - api.js: Communication with the backend TiddlyWiki server
  - settings.js: Settings management functionality
