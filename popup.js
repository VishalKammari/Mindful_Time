let chart = null;

// Convert milliseconds to minutes and seconds
function msToTime(ms) {
  const minutes = Math.floor(ms / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${minutes}m ${seconds}s`;
}

// Calculate angle between two points
function calculateAngle(x, y) {
  return Math.atan2(y, x) * 180 / Math.PI;
}

// Update the pie chart and handle hover functionality
function updatePieChart(productiveTime, nonProductiveTime) {
  const total = productiveTime + nonProductiveTime;
  const productivePercent = total > 0 ? Math.round((productiveTime / total) * 100) : 0;
  const nonProductivePercent = 100 - productivePercent;

  const pieChart = document.getElementById('pieChart');
  const tooltip = document.getElementById('pieTooltip');
  
  if (!pieChart || !tooltip) return;

  // Update the pie chart using CSS custom property
  pieChart.style.setProperty('--productive-percent', productivePercent + '%');

  // Update percentages in legend
  const productivePercentElement = document.getElementById('productivePercent');
  const nonProductivePercentElement = document.getElementById('nonProductivePercent');
  
  if (productivePercentElement) {
    productivePercentElement.textContent = `Productive (${productivePercent}%)`;
  }
  if (nonProductivePercentElement) {
    nonProductivePercentElement.textContent = `Non-Productive (${nonProductivePercent}%)`;
  }

  let isHovering = false;
  let currentSection = null;

  // Handle mouse movement over pie chart
  pieChart.addEventListener('mousemove', (e) => {
    const rect = pieChart.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle relative to center
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    // Check if mouse is within pie chart radius
    const distance = Math.sqrt(x * x + y * y);
    const isWithinPie = distance <= rect.width / 2;

    if (!isWithinPie) {
      if (isHovering) {
        tooltip.style.opacity = '0';
        isHovering = false;
      }
      return;
    }

    // Calculate angle (0-360)
    let angle = calculateAngle(x, y) + 180;
    const isProductive = angle <= (productivePercent / 100 * 360);

    // Only update if section changed
    if (currentSection !== isProductive || !isHovering) {
      currentSection = isProductive;
      isHovering = true;

      const tooltipText = isProductive
        ? `Productive: ${msToTime(productiveTime)}`
        : `Non-Productive: ${msToTime(nonProductiveTime)}`;

      tooltip.textContent = tooltipText;
      tooltip.style.opacity = '1';
    }

    // Update tooltip position
    const tooltipX = e.clientX - rect.left;
    const tooltipY = e.clientY - rect.top - tooltip.offsetHeight - 10; // 10px offset from cursor

    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${tooltipY}px`;
  });

  // Handle mouse leave
  pieChart.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    isHovering = false;
    currentSection = null;
  });
}

// Update top sites list
function updateTopSites(siteVisits) {
  const sitesList = document.getElementById('sitesList');
  if (!sitesList) return;
  
  sitesList.innerHTML = '';

  // Convert to array and sort by time spent
  const sites = Object.entries(siteVisits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  sites.forEach(([domain, time]) => {
    const siteItem = document.createElement('div');
    siteItem.className = 'site-item';
    
    const siteName = document.createElement('div');
    siteName.className = 'site-name';
    siteName.textContent = domain;
    
    const siteTime = document.createElement('div');
    siteTime.className = 'site-time';
    siteTime.textContent = msToTime(time);
    
    siteItem.appendChild(siteName);
    siteItem.appendChild(siteTime);
    sitesList.appendChild(siteItem);
  });
}

// Update the display with current statistics
function updateDisplay() {
  chrome.storage.local.get(['productiveTime', 'nonProductiveTime', 'siteVisits'], (data) => {
    updatePieChart(data.productiveTime || 0, data.nonProductiveTime || 0);
    updateTopSites(data.siteVisits || {});
  });
}

// Initial display update
document.addEventListener('DOMContentLoaded', () => {
  updateDisplay();
  
  // Set up periodic updates
  setInterval(updateDisplay, 1000);
});