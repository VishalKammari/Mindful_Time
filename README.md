# Productivity Tracker Browser Extension
link
https://microsoftedge.microsoft.com/addons/detail/baighpbafnoionmmkonmijpmhbjfnign

A browser extension that helps you track and manage your productive and non-productive screen time.

## Features

- Track screen time across different websites
- Distinguish between productive and non-productive activities
- Real-time monitoring of browsing habits
- Visual statistics and reports
- Warning system for non-productive sites


![Screenshot 2025-04-05 153431](https://github.com/user-attachments/assets/bc8b166c-4568-4f69-855c-72a259364fb1)



## Installation

1. Clone this repository or download the ZIP file
2. Open your browser and navigate to the extensions page
   - For Chrome: `chrome://extensions/`
   - For Edge: `edge://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click on the extension icon in your browser toolbar to open the popup
2. View your productivity statistics and screen time data
3. Manage your productive/non-productive site categories
4. Monitor your daily browsing habits

## Technical Details

- Built with vanilla JavaScript
- Uses Chrome Extension Manifest V3
- Utilizes browser storage for data persistence
- Background service worker for continuous monitoring
- Popup interface for user interaction

## Permissions

This extension requires the following permissions:
- `tabs`: To monitor active tabs and track browsing activity
- `storage`: To save user preferences and browsing data
- `webNavigation`: To track page navigation events
- `host_permissions`: To monitor browsing across all URLs

## Files Structure

- `manifest.json`: Extension configuration
- `background.js`: Background service worker
- `popup.html` & `popup.js`: Main user interface
- `warning.html` & `warning.js`: Warning system
- `style1.css`: Styling for the extension
- `icons/`: Extension icons in various sizes

## Contributing

Feel free to submit issues and enhancement requests!

#

