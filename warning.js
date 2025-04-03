const continueButton = document.getElementById('continue');

// Disable continue button initially
continueButton.disabled = true;

// Enable continue button after 5 seconds
setTimeout(() => {
    continueButton.disabled = false;
    continueButton.focus();
}, 5000);

// Handle continue button click
continueButton.addEventListener('click', () => {
    // Get the target URL from storage
    chrome.storage.local.get(['pendingUrl'], (result) => {
        if (result.pendingUrl) {
            // Get current tab and update its URL
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.update(tabs[0].id, {
                        url: result.pendingUrl
                    });
                }
            });
        }
    });
});