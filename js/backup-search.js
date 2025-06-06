// Clean CereFlow Search Implementation
class CereFlowSearch {
  constructor() {
    this.form = document.getElementById('strokeSearchForm');
    this.loadingSection = document.getElementById('loadingSection');
    this.resultsSection = document.getElementById('resultsSection');
    this.resultsContent = document.getElementById('resultsContent');
    this.searchButton = document.getElementById('searchButton');
    
    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    console.log('Form submitted');
    
    // Collect form data
    const formData = new FormData(this.form);
    const data = {
      location: formData.get('location'),
      needType: formData.get('needType'),
      insurance: formData.get('healthcare'),
      additionalNeeds: formData.get('additionalNeeds')
    };
    
    console.log('Form data:', data);
    
    // Clear previous results first
    this.clearResults();
    
    // Show loading
    this.showLoading();
    this.hideResults();
    
    try {
      // Simulate AI processing steps
      await this.simulateProcessing();
      
      // Call backend
      const results = await this.searchBackend(data);
      console.log('Backend results:', results);
      
      // Display results
      this.displayResults(results);
      
    } catch (error) {
      console.error('Search failed:', error);
      this.stopBackendProgressAnimation();
      this.showError('Search failed: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  async simulateProcessing() {
    const steps = [
      'Analyzing your location...',
      'Searching global facilities...',
      'Personalizing recommendations...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      const stepElement = document.querySelector(`[data-step="${i + 1}"]`);
      if (stepElement) {
        stepElement.classList.add('active');
      }
      
      const loadingText = document.getElementById('loadingText');
      if (loadingText) {
        loadingText.textContent = steps[i];
      }
      
      await this.delay(1500);
    }
  }

  async searchBackend(data) {
    console.log('Calling backend with:', data);
    
    // Show additional loading state
    this.showBackendProcessing();
    
    const response = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Raw backend response:', result);
    
    return result;
  }

  showBackendProcessing() {
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
      loadingText.innerHTML = '🔄 Searching global healthcare database...<br><small style="opacity: 0.7;">This may take 30-60 seconds as we fetch real-time data</small>';
    }
    
    // Add pulsing animation to indicate backend work
    const scanner = document.querySelector('.scanner-core');
    if (scanner) {
      scanner.style.animation = 'scannerPulse 1s ease-in-out infinite, backendPulse 2s ease-in-out infinite';
    }
    
    // Show a progress indicator for backend processing
    this.startBackendProgressAnimation();
  }

  displayResults(data) {
    console.log('Displaying results:', data);
    
    // Stop the backend progress animation
    this.stopBackendProgressAnimation();
    
    if (!this.resultsContent) {
      console.error('Results content element not found');
      return;
    }

    // Store all results for pagination
    this.allResults = data;
    this.currentPage = 1;
    this.resultsPerPage = 10;
    
    this.renderPaginatedResults();
  }

  renderPaginatedResults() {
    const data = this.allResults;
    const startIndex = (this.currentPage - 1) * this.resultsPerPage;
    const endIndex = startIndex + this.resultsPerPage;
    
    // Update title
    const title = document.getElementById('resultsTitle');
    if (title) {
      title.textContent = `Stroke Resources for ${data.query?.location || 'Your Location'}`;
    }

    // Clear previous results
    this.resultsContent.innerHTML = '';

    // Create results HTML
    let html = '';

    // Add AI recommendation if available (only on first page)
    if (data.query && this.currentPage === 1) {
      html += `
        <div class="ai-recommendation">
          <h4>🤖 AI Analysis</h4>
          <p>Found ${data.facilities?.length || 0} facilities for ${data.query.location}</p>
          <p>Search type: ${data.query.needType}</p>
        </div>
      `;
    }

    // Display paginated facilities
    if (data.facilities && data.facilities.length > 0) {
      const paginatedFacilities = data.facilities.slice(startIndex, endIndex);
      
      html += '<div class="facilities-section">';
      html += `<h4>🏥 Medical Facilities (${startIndex + 1}-${Math.min(endIndex, data.facilities.length)} of ${data.facilities.length})</h4>`;
      
      paginatedFacilities.forEach(facility => {
        html += `
          <div class="facility-card">
            <h5>${facility.name || 'Unknown Facility'}</h5>
            <p><strong>Address:</strong> ${facility.address || 'Address not available'}</p>
            <p><strong>Phone:</strong> ${facility.phone || 'Phone not available'}</p>
            <p><strong>Type:</strong> ${facility.type || 'Medical facility'}</p>
            ${facility.services ? `<p><strong>Services:</strong> ${facility.services.join(', ')}</p>` : ''}
            ${facility.reason ? `<p><strong>Why recommended:</strong> ${facility.reason}</p>` : ''}
          </div>
        `;
      });
      
      html += '</div>';
      
      // Add pagination controls
      html += this.createPaginationControls(data.facilities.length);
    }

    // Display alternative resources (only on first page to avoid duplication)
    if (data.alternative_resources && data.alternative_resources.length > 0 && this.currentPage === 1) {
      html += '<div class="alternatives-section">';
      html += '<h4>🌐 Additional Resources</h4>';
      
      data.alternative_resources.forEach(resource => {
        html += `
          <div class="resource-card">
            <h5>${resource.name || 'Unknown Resource'}</h5>
            <p>${resource.description || 'No description available'}</p>
            <p><strong>Contact:</strong> ${resource.contact || 'Contact not available'}</p>
          </div>
        `;
      });
      
      html += '</div>';
    }

    // Display emergency info (only on first page)
    if (data.emergency_info && this.currentPage === 1) {
      html += `
        <div class="emergency-section">
          <h4>🚨 Emergency Information</h4>
          <p><strong>Emergency Number:</strong> ${data.emergency_info.emergency_number || 'Call local emergency'}</p>
          ${data.emergency_info.stroke_hotline ? `<p><strong>Stroke Hotline:</strong> ${data.emergency_info.stroke_hotline}</p>` : ''}
        </div>
      `;
    }

    // If no results
    if (!data.facilities?.length && !data.alternative_resources?.length) {
      html += `
        <div class="no-results">
          <h4>No specific facilities found</h4>
          <p>We couldn't find specific stroke facilities for ${data.query?.location || 'your location'}, but emergency services are still available.</p>
          <p>Contact local hospitals or emergency services for immediate assistance.</p>
        </div>
      `;
    }

    // Add results to page
    this.resultsContent.innerHTML = html;
    this.showResults();
  }

  createPaginationControls(totalResults) {
    const totalPages = Math.ceil(totalResults / this.resultsPerPage);
    
    if (totalPages <= 1) return '';
    
    let paginationHTML = '<div class="pagination-controls">';
    
    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `<button class="btn-pagination" onclick="cereflowSearch.changePage(${this.currentPage - 1})">← Previous</button>`;
    }
    
    // Page info
    paginationHTML += `<span class="page-info">Page ${this.currentPage} of ${totalPages}</span>`;
    
    // Next button
    if (this.currentPage < totalPages) {
      paginationHTML += `<button class="btn-pagination" onclick="cereflowSearch.changePage(${this.currentPage + 1})">Next →</button>`;
    }
    
    paginationHTML += '</div>';
    
    return paginationHTML;
  }

  changePage(newPage) {
    this.currentPage = newPage;
    this.renderPaginatedResults();
    
    // Scroll to top of results
    if (this.resultsSection) {
      this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  showLoading() {
    if (this.loadingSection) {
      this.loadingSection.style.display = 'block';
      this.loadingSection.setAttribute('aria-hidden', 'false');
      
      // Reset progress bar
      const progressFill = document.getElementById('progressFill');
      const progressText = document.getElementById('progressText');
      
      if (progressFill && progressText) {
        progressFill.style.width = '0%';
        progressText.textContent = '0% Complete';
      }
      
      // Reset loading text
      const loadingText = document.getElementById('loadingText');
      if (loadingText) {
        loadingText.textContent = 'Advanced AI is processing your medical needs and scanning global healthcare networks';
      }
    }
  }

  hideLoading() {
    if (this.loadingSection) {
      this.loadingSection.style.display = 'none';
      this.loadingSection.setAttribute('aria-hidden', 'true');
    }
  }

  showResults() {
    if (this.resultsSection) {
      this.resultsSection.style.display = 'block';
      this.resultsSection.setAttribute('aria-hidden', 'false');
      this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  hideResults() {
    if (this.resultsSection) {
      this.resultsSection.style.display = 'none';
      this.resultsSection.setAttribute('aria-hidden', 'true');
    }
  }

  showError(message) {
    if (this.resultsContent) {
      this.resultsContent.innerHTML = `
        <div class="error-message">
          <h4>❌ Search Error</h4>
          <p>${message}</p>
          <p>Please try again or check your internet connection.</p>
        </div>
      `;
      this.showResults();
    }
  }

  startBackendProgressAnimation() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
      let progress = 0;
      const increment = 1;
      const maxProgress = 90; // Don't go to 100% until actual completion
      
      this.progressInterval = setInterval(() => {
        if (progress < maxProgress) {
          progress += increment;
          progressFill.style.width = `${progress}%`;
          progressText.textContent = `${progress}% Complete`;
          
          // Add some realistic messages at certain milestones
          const loadingText = document.getElementById('loadingText');
          if (loadingText) {
            if (progress === 20) {
              loadingText.innerHTML = '🔍 Scanning medical facilities...<br><small style="opacity: 0.7;">Analyzing hospital capabilities and specializations</small>';
            } else if (progress === 40) {
              loadingText.innerHTML = '🏥 Evaluating stroke care centers...<br><small style="opacity: 0.7;">Checking availability and emergency services</small>';
            } else if (progress === 60) {
              loadingText.innerHTML = '📊 Processing insurance compatibility...<br><small style="opacity: 0.7;">Matching with your healthcare coverage</small>';
            } else if (progress === 80) {
              loadingText.innerHTML = '🎯 Personalizing recommendations...<br><small style="opacity: 0.7;">Finalizing results for your location</small>';
            }
          }
        }
      }, 500); // Update every 500ms for smoother progress
    }
  }

  stopBackendProgressAnimation() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    
    // Complete the progress bar
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
      progressFill.style.width = '100%';
      progressText.textContent = '100% Complete';
    }
  }

  clearResults() {
    if (this.resultsContent) {
      this.resultsContent.innerHTML = '';
    }
    this.allResults = null;
    this.currentPage = 1;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing CereFlow Search...');
  window.cereflowSearch = new CereFlowSearch();
});