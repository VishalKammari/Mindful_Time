// List of non-productive websites
const nonProductiveSites = [
  'twitter.com',
  'x.com',
  'instagram.com',
  'facebook.com',
  'reddit.com',
  'youtube.com'
];

// Function to get domain from URL
function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

// Function to check if it's a new day
function isNewDay(lastResetDate) {
  const today = new Date();
  const lastReset = new Date(lastResetDate);
  return today.getDate() !== lastReset.getDate() ||
         today.getMonth() !== lastReset.getMonth() ||
         today.getFullYear() !== lastReset.getFullYear();
}

// Function to reset counters
async function resetCounters() {
  await chrome.storage.local.set({
    productiveTime: 0,
    nonProductiveTime: 0,
    lastResetDate: new Date().toISOString(),
    siteVisits: {}
  });
}

// Initialize storage with default values
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({
    productiveTime: 0,
    nonProductiveTime: 0,
    lastActiveTime: Date.now(),
    currentTab: null,
    lastResetDate: new Date().toISOString(),
    warningShown: false,
    siteVisits: {}
  });
});

// Check for new day and reset if needed
async function checkAndResetDaily() {
  const data = await chrome.storage.local.get('lastResetDate');
  if (isNewDay(data.lastResetDate)) {
    await resetCounters();
  }
}

// Update site visit time
async function updateSiteTime(url, timeSpent) {
  if (!url) return;
  
  const domain = getDomain(url);
  const data = await chrome.storage.local.get('siteVisits');
  const siteVisits = data.siteVisits || {};
  
  siteVisits[domain] = (siteVisits[domain] || 0) + timeSpent;
  
  await chrome.storage.local.set({ siteVisits });
}

// Function to update time for current tab
async function updateCurrentTabTime() {
  await checkAndResetDaily();
  
  const data = await chrome.storage.local.get(['lastActiveTime', 'currentTab']);
  const currentTime = Date.now();
  const timeSpent = currentTime - data.lastActiveTime;

  if (data.currentTab) {
    const isProductive = !nonProductiveSites.some(site => data.currentTab.includes(site));
    if (isProductive) {
      const productiveTime = (await chrome.storage.local.get('productiveTime')).productiveTime;
      await chrome.storage.local.set({ productiveTime: productiveTime + timeSpent });
    } else {
      const nonProductiveTime = (await chrome.storage.local.get('nonProductiveTime')).nonProductiveTime;
      await chrome.storage.local.set({ nonProductiveTime: nonProductiveTime + timeSpent });
    }
    
    // Update site visit time
    await updateSiteTime(data.currentTab, timeSpent);
  }

  await chrome.storage.local.set({ lastActiveTime: currentTime });
}

// Check current tab every second
setInterval(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    await chrome.storage.local.set({ currentTab: tab.url });
    await updateCurrentTabTime();
  }
}, 1000);

// Track tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateCurrentTabTime();
  const tab = await chrome.tabs.get(activeInfo.tabId);
  await chrome.storage.local.set({
    currentTab: tab.url
  });
});

// Track URL changes within the same tab
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  await updateCurrentTabTime();
  await chrome.storage.local.set({
    currentTab: details.url
  });
});

// Intercept navigation to non-productive sites
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId === 0) {
    const url = details.url;
    const isNonProductive = nonProductiveSites.some(site => url.includes(site));
    
    if (isNonProductive) {
      const data = await chrome.storage.local.get('warningShown');
      
      if (!data.warningShown) {
        await chrome.storage.local.set({ 
          pendingUrl: url,
          warningShown: true
        });
        
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL('warning.html')
        });
        
        return { cancel: true };
      }
      
      await chrome.storage.local.set({ warningShown: false });
    }
  }
}); 