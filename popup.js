let chart = null;

function msToTime(ms) {
  const minutes = Math.floor(ms / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${minutes}m ${seconds}s`;
}

function calculateAngle(x, y) {
  return Math.atan2(y, x) * 180 / Math.PI;
}

function updatePieChart(productiveTime, nonProductiveTime) {
  const total = productiveTime + nonProductiveTime;
  const productivePercent = total > 0 ? Math.round((productiveTime / total) * 100) : 0;
  const nonProductivePercent = 100 - productivePercent;

  const pieChart = document.getElementById('pieChart');
  const tooltip = document.getElementById('pieTooltip');
  
  if (!pieChart || !tooltip) return;

  pieChart.style.setProperty('--productive-percent', productivePercent + '%');

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

  pieChart.addEventListener('mousemove', (e) => {
    const rect = pieChart.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    const distance = Math.sqrt(x * x + y * y);
    const isWithinPie = distance <= rect.width / 2;

    if (!isWithinPie) {
      if (isHovering) {
        tooltip.style.opacity = '0';
        isHovering = false;
      }
      return;
    }

    let angle = calculateAngle(x, y) + 180;
    const isProductive = angle <= (productivePercent / 100 * 360);

    if (currentSection !== isProductive || !isHovering) {
      currentSection = isProductive;
      isHovering = true;

      const tooltipText = isProductive
        ? `Productive: ${msToTime(productiveTime)}`
        : `Non-Productive: ${msToTime(nonProductiveTime)}`;

      tooltip.textContent = tooltipText;
      tooltip.style.opacity = '1';
    }

    const tooltipX = e.clientX - rect.left;
    const tooltipY = e.clientY - rect.top - tooltip.offsetHeight - 10; // 10px offset from cursor

    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${tooltipY}px`;
  });
  pieChart.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    isHovering = false;
    currentSection = null;
  });
}

function updateTopSites(siteVisits) {
  const sitesList = document.getElementById('sitesList');
  if (!sitesList) return;
  
  sitesList.innerHTML = '';

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

function updateDisplay() {
  chrome.storage.local.get(['productiveTime', 'nonProductiveTime', 'siteVisits'], (data) => {
    updatePieChart(data.productiveTime || 0, data.nonProductiveTime || 0);
    updateTopSites(data.siteVisits || {});
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateDisplay();
  
  setInterval(updateDisplay, 1000);
});