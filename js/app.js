// CereFlow - Main Application Logic
// Handles global app functionality, modals, and emergency information

class CereFlowApp {
  constructor() {
    this.currentModal = null;
    this.userCountry = 'US'; // Default
    
    this.init();
  }
  
  init() {
    this.bindGlobalEvents();
    this.detectUserCountry();
    this.updateEmergencyBanner();
    this.initializeAccessibility();
  }
  
  bindGlobalEvents() {
    // Modal close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentModal) {
        this.closeModal(this.currentModal);
      }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
    
    // Update emergency number on location input
    const locationInput = document.querySelector('input[name="location"]');
    if (locationInput) {
      locationInput.addEventListener('input', this.updateEmergencyBasedOnLocation.bind(this));
    }
  }
  
  async detectUserCountry() {
    try {
      // Try to detect country from timezone or other browser info
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.userCountry = this.getCountryFromTimezone(timezone);
      
      // Try to get more precise location if permission granted
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            // In a real app, you'd geocode this to get country
            console.log('User location detected for emergency services');
          },
          (error) => {
            console.log('Location access denied:', error.message);
          },
          { timeout: 5000, enableHighAccuracy: false }
        );
      }
    } catch (error) {
      console.log('Country detection failed:', error);
    }
  }
  
  getCountryFromTimezone(timezone) {
    const timezoneToCountry = {
      'America/New_York': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Los_Angeles': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'Europe/London': 'UK',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Europe/Rome': 'IT',
      'Europe/Madrid': 'ES',
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
      'Asia/Tokyo': 'JP',
      'Asia/Kolkata': 'IN'
    };
    
    return timezoneToCountry[timezone] || 'US';
  }
  
  updateEmergencyBanner() {
    const emergencyNumber = document.getElementById('local-emergency');
    if (emergencyNumber && EMERGENCY_NUMBERS[this.userCountry]) {
      emergencyNumber.textContent = EMERGENCY_NUMBERS[this.userCountry].emergency;
    }
  }
  
  updateEmergencyBasedOnLocation(event) {
    const location = event.target.value.toLowerCase();
    
    // Try to detect country from location input
    const detectedCountry = this.detectCountryFromInput(location);
    if (detectedCountry) {
      this.userCountry = detectedCountry;
      this.updateEmergencyBanner();
    }
  }
  
  detectCountryFromInput(location) {
    const countryPatterns = {
      'US': ['usa', 'united states', 'america', 'new york', 'california', 'texas', 'florida'],
      'UK': ['uk', 'united kingdom', 'england', 'london', 'manchester', 'birmingham'],
      'CA': ['canada', 'toronto', 'vancouver', 'montreal', 'calgary'],
      'AU': ['australia', 'sydney', 'melbourne', 'brisbane', 'perth'],
      'DE': ['germany', 'berlin', 'munich', 'hamburg', 'cologne'],
      'FR': ['france', 'paris', 'lyon', 'marseille', 'toulouse'],
      'ES': ['spain', 'madrid', 'barcelona', 'valencia', 'seville'],
      'IT': ['italy', 'rome', 'milan', 'naples', 'turin'],
      'JP': ['japan', 'tokyo', 'osaka', 'kyoto', 'yokohama'],
      'IN': ['india', 'mumbai', 'delhi', 'bangalore', 'chennai']
    };
    
    for (const [country, patterns] of Object.entries(countryPatterns)) {
      if (patterns.some(pattern => location.includes(pattern))) {
        return country;
      }
    }
    
    return null;
  }
  
  initializeAccessibility() {
    // Add keyboard navigation for custom elements
    document.querySelectorAll('.result-card, .info-card').forEach(card => {
      card.setAttribute('tabindex', '0');
      
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const firstLink = card.querySelector('a, button');
          if (firstLink) {
            firstLink.click();
          }
        }
      });
    });
    
    // Add skip links for screen readers
    this.addSkipLinks();
    
    // Initialize focus management
    this.initializeFocusManagement();
  }
  
  addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#search';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--primary-blue);
      color: white;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
      border-radius: 4px;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
  
  initializeFocusManagement() {
    // Trap focus in modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.currentModal) {
        this.trapFocusInModal(e);
      }
    });
  }
  
  trapFocusInModal(e) {
    const modal = document.getElementById(this.currentModal);
    if (!modal) return;
    
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
}

// Global Modal Functions
function showEmergencyNumbers() {
  const modal = document.getElementById('emergencyModal');
  const grid = document.getElementById('emergencyGrid');
  
  if (!modal || !grid) return;
  
  // Clear existing content
  grid.innerHTML = '';
  
  // Populate emergency numbers
  Object.entries(EMERGENCY_NUMBERS).forEach(([country, info]) => {
    const countryElement = document.createElement('div');
    countryElement.className = 'emergency-country';
    
    countryElement.innerHTML = `
      <div class="country-name">${getCountryName(country)}</div>
      <div class="emergency-numbers">
        Emergency: <span class="emergency-number">${info.emergency}</span><br>
        Stroke Line: <span class="emergency-number">${info.stroke}</span>
      </div>
    `;
    
    grid.appendChild(countryElement);
  });
  
  showModal('emergencyModal');
}

function getCountryName(countryCode) {
  const countryNames = {
    'US': 'United States',
    'CA': 'Canada', 
    'UK': 'United Kingdom',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'JP': 'Japan',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'ZA': 'South Africa',
    'SG': 'Singapore',
    'KR': 'South Korea'
  };
  
  return countryNames[countryCode] || countryCode;
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  modal.classList.add('visible');
  modal.setAttribute('aria-hidden', 'false');
  
  // Set current modal for escape key handling
  if (window.cereflowApp) {
    window.cereflowApp.currentModal = modalId;
  }
  
  // Focus first focusable element
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) {
    firstFocusable.focus();
  }
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  modal.classList.remove('visible');
  modal.setAttribute('aria-hidden', 'true');
  
  // Clear current modal
  if (window.cereflowApp) {
    window.cereflowApp.currentModal = null;
  }
  
  // Restore body scroll
  document.body.style.overflow = '';
  
  // Return focus to trigger element
  const triggerElement = document.querySelector(`[onclick*="${modalId}"]`);
  if (triggerElement) {
    triggerElement.focus();
  }
}

function showDisclaimer() {
  const modal = document.createElement('div');
  modal.className = 'modal visible';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeCustomModal(this)"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h4>Medical Disclaimer</h4>
        <button class="modal-close" onclick="closeCustomModal(this)" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body">
        <div style="max-height: 400px; overflow-y: auto;">
          <h5>Important Medical Information</h5>
          <p><strong>This website is for informational purposes only and does not provide medical advice.</strong></p>
          
          <h6>Emergency Situations</h6>
          <p>If you are experiencing a medical emergency, including stroke symptoms, call your local emergency number immediately:</p>
          <ul>
            <li>🇺🇸 United States: 911</li>
            <li>🇬🇧 United Kingdom: 999</li>
            <li>🇨🇦 Canada: 911</li>
            <li>🇦🇺 Australia: 000</li>
            <li>🇪🇺 European Union: 112</li>
          </ul>
          
          <h6>Stroke Warning Signs - Act F.A.S.T.</h6>
          <ul>
            <li><strong>Face drooping:</strong> Does one side of the face droop or is it numb?</li>
            <li><strong>Arm weakness:</strong> Is one arm weak or numb?</li>
            <li><strong>Speech difficulty:</strong> Is speech slurred or strange?</li>
            <li><strong>Time to call emergency services:</strong> If any of these signs are present, call immediately</li>
          </ul>
          
          <h6>Website Limitations</h6>
          <p>This website:</p>
          <ul>
            <li>Does not replace professional medical advice, diagnosis, or treatment</li>
            <li>Provides general information that may not apply to your specific situation</li>
            <li>May not have the most current facility information</li>
            <li>Cannot guarantee the accuracy of all listed resources</li>
          </ul>
          
          <h6>Your Responsibilities</h6>
          <p>Always:</p>
          <ul>
            <li>Verify facility information before visiting</li>
            <li>Consult with healthcare professionals for medical decisions</li>
            <li>Check with your insurance provider for coverage information</li>
            <li>Confirm that facilities accept your insurance or payment method</li>
          </ul>
          
          <p><strong>By using this website, you acknowledge that you understand these limitations and agree to use the information responsibly.</strong></p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function showPrivacy() {
  const modal = document.createElement('div');
  modal.className = 'modal visible';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeCustomModal(this)"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h4>Privacy Policy</h4>
        <button class="modal-close" onclick="closeCustomModal(this)" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body">
        <div style="max-height: 400px; overflow-y: auto;">
          <h5>Your Privacy Matters</h5>
          <p>CereFlow is committed to protecting your privacy and personal information.</p>
          
          <h6>Information We Don't Collect</h6>
          <p>This website operates without:</p>
          <ul>
            <li>User accounts or registration</li>
            <li>Storing personal information on servers</li>
            <li>Tracking cookies for advertising</li>
            <li>Sharing data with third parties</li>
          </ul>
          
          <h6>Information That Stays Local</h6>
          <p>All search information you enter:</p>
          <ul>
            <li>Remains on your device</li>
            <li>Is not sent to our servers</li>
            <li>Is automatically cleared when you close your browser</li>
            <li>Is not stored or logged anywhere</li>
          </ul>
          
          <h6>Location Services</h6>
          <p>If you choose to share your location:</p>
          <ul>
            <li>It's only used to improve search results</li>
            <li>It's not stored or transmitted</li>
            <li>You can deny permission at any time</li>
            <li>The website works without location access</li>
          </ul>
          
          <h6>External Links</h6>
          <p>When you click links to hospitals, organizations, or other websites:</p>
          <ul>
            <li>You're leaving our website</li>
            <li>Those sites have their own privacy policies</li>
            <li>We're not responsible for their privacy practices</li>
          </ul>
          
          <h6>Technical Information</h6>
          <p>Standard web server logs may temporarily record:</p>
          <ul>
            <li>IP addresses (automatically deleted)</li>
            <li>Browser type (for compatibility)</li>
            <li>Page visit times (for performance)</li>
          </ul>
          
          <h6>Contact</h6>
          <p>Questions about privacy? Contact us at: <a href="mailto:privacy@cereflow.org">privacy@cereflow.org</a></p>
          
          <p><em>Last updated: December 2024</em></p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function closeCustomModal(element) {
  const modal = element.closest('.modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

// Utility Functions
function formatPhoneNumber(phone, countryCode) {
  // Basic international phone formatting
  if (phone.startsWith('+')) {
    return phone;
  }
  
  const countryPrefixes = {
    'US': '+1',
    'CA': '+1', 
    'UK': '+44',
    'AU': '+61',
    'DE': '+49',
    'FR': '+33',
    'ES': '+34',
    'IT': '+39',
    'JP': '+81',
    'IN': '+91'
  };
  
  const prefix = countryPrefixes[countryCode] || '+1';
  return `${prefix}-${phone}`;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  // Haversine formula for calculating distance between coordinates
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function shareResults(title, text, url) {
  if (navigator.share) {
    navigator.share({
      title: title,
      text: text,
      url: url
    }).catch(err => console.log('Share failed:', err));
  } else {
    // Fallback: copy to clipboard
    const shareText = `${title}\n${text}\n${url}`;
    navigator.clipboard.writeText(shareText).then(() => {
      showNotification('Results copied to clipboard!');
    }).catch(() => {
      showNotification('Unable to share results');
    });
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--primary-blue);
    color: white;
    padding: var(--space-4);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .notification-success { background: var(--success-green) !important; }
  .notification-warning { background: var(--warning-orange) !important; }
  .notification-error { background: var(--error-red) !important; }
`;
document.head.appendChild(notificationStyles);

// Performance monitoring
function trackPerformance() {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        // Track if it's too slow
        if (loadTime > 5000) {
          console.warn('Page load time is slow:', loadTime);
        }
      }, 0);
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.cereflowApp = new CereFlowApp();
  trackPerformance();
  
  // Add loading states for images
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    img.addEventListener('error', () => {
      img.style.display = 'none';
    });
  });
  
  console.log('CereFlow app initialized successfully');
});