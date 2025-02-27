// Main JavaScript to initialize everything
document.addEventListener('DOMContentLoaded', function() {
  // Initialize tab switching
  initializeTabs();
  
  // Initialize API key modal
  initializeApiKeyModal();
  
  // Initialize features
  WordExplorer.init();
  // Initialize other features as they're implemented
  
  // Check for API key and show modal if not set
  checkApiKeys();
});

// Tab switching functionality
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const contentSections = document.querySelectorAll('.content-section');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Deactivate all tabs
      tabButtons.forEach(btn => {
        btn.classList.remove('text-indigo-700', 'border-b-2', 'border-indigo-600');
        btn.classList.add('text-gray-500');
      });
      
      // Hide all content sections
      contentSections.forEach(section => {
        section.classList.add('hidden');
      });
      
      // Activate clicked tab
      this.classList.remove('text-gray-500');
      this.classList.add('text-indigo-700', 'border-b-2', 'border-indigo-600');
      
      // Show corresponding content
      const tabId = this.id;
      const contentId = tabId.replace('tab-', 'content-');
      document.getElementById(contentId).classList.remove('hidden');
    });
  });
}

// API key modal functionality
function initializeApiKeyModal() {
  const modal = document.getElementById('apiKeyModal');
  const openButton = document.getElementById('changeApiKey');
  const cancelButton = document.getElementById('cancelApiKey');
  const saveButton = document.getElementById('saveApiKey');
  
  // Load existing API keys
  const hfKey = localStorage.getItem('hf_api_key') || '';
  const openaiKey = localStorage.getItem('openai_api_key') || '';
  
  document.getElementById('huggingFaceKey').value = hfKey;
  document.getElementById('openaiKey').value = openaiKey;
  
  // Open modal button
  openButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });
  
  // Cancel button
  cancelButton.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  
  // Save button
  saveButton.addEventListener('click', () => {
    const hfKey = document.getElementById('huggingFaceKey').value.trim();
    const openaiKey = document.getElementById('openaiKey').value.trim();
    const apiProvider = document.getElementById('apiProvider').value;
    
    // Validate based on selected provider
    if (apiProvider === 'huggingface' && !hfKey) {
      document.getElementById('apiKeyError').textContent = 'Please enter a Hugging Face API key';
      document.getElementById('apiKeyError').classList.remove('hidden');
      return;
    }
    
    if (apiProvider === 'openai' && !openaiKey) {
      document.getElementById('apiKeyError').textContent = 'Please enter an OpenAI API key';
      document.getElementById('apiKeyError').classList.remove('hidden');
      return;
    }
    
    // Save API keys
    localStorage.setItem('hf_api_key', hfKey);
    localStorage.setItem('openai_api_key', openaiKey);
    modal.classList.add('hidden');
    
    // Update button text
    updateApiButtonText();
  });
}

// Check if API keys are set
function checkApiKeys() {
  const hfKey = localStorage.getItem('hf_api_key');
  const openaiKey = localStorage.getItem('openai_api_key');
  const apiProvider = document.getElementById('apiProvider').value;
  
  // If no key is set for the selected provider, show the modal
  if ((apiProvider === 'huggingface' && !hfKey) || 
      (apiProvider === 'openai' && !openaiKey)) {
    document.getElementById('apiKeyModal').classList.remove('hidden');
  }
  
  // Update the change key button text
  updateApiButtonText();
  
  // Add event listener for API provider change
  document.getElementById('apiProvider').addEventListener('change', function() {
    checkApiKeys();
  });
}

// Update API button text
function updateApiButtonText() {
  const apiProvider = document.getElementById('apiProvider').value;
  const hfKey = localStorage.getItem('hf_api_key');
  const openaiKey = localStorage.getItem('openai_api_key');
  
  const button = document.getElementById('changeApiKey');
  
  if ((apiProvider === 'huggingface' && hfKey) || 
      (apiProvider === 'openai' && openaiKey)) {
    button.textContent = 'Change API Key';
  } else {
    button.textContent = 'Set API Key';
  }
}
