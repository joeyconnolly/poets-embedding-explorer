// Word Embedding Explorer feature
const WordExplorer = {
  init: function() {
    // Add event listener to analyze button
    document.getElementById('analyze-word-button').addEventListener('click', this.analyzeWord.bind(this));
  },

  analyzeWord: async function() {
    const word = document.getElementById('explorer-word').value.trim();
    const contextsText = document.getElementById('explorer-contexts').value;
    const apiProvider = document.getElementById('apiProvider').value;
    
    // Validation
    if (!word) {
      this.showError('Please enter a word to explore');
      return;
    }
    
    const contextList = contextsText
      .split('\n')
      .map(c => c.trim())
      .filter(c => c && c.includes('[WORD]'));
      
    if (contextList.length === 0) {
      this.showError('Please provide at least one context with [WORD] placeholder');
      return;
    }
    
    // Show loading state
    this.showLoading(true);
    this.hideError();
    
    try {
      // Check if API key is set
      if (!ApiService.getApiKey(apiProvider)) {
        document.getElementById('apiKeyModal').classList.remove('hidden');
        this.showLoading(false);
        return;
      }
      
      // Get embeddings
      const results = await EmbeddingService.getWordInContextEmbeddings(
        word,
        contextList,
        apiProvider
      );
      
      // Display results
      this.displayResults(results);
    } catch (err) {
      this.showError(`Error: ${err.message || 'Failed to get embeddings'}`);
    } finally {
      this.showLoading(false);
    }
  },

  displayResults: function(results) {
    // Show visualization
    document.getElementById('explorer-empty').classList.add('hidden');
    document.getElementById('explorer-visualization-container').classList.remove('hidden');
    
    // Create visualization
    const labels = results.sentences.map((sentence, index) => 
      `${index + 1}: ${sentence.substring(0, 20)}${sentence.length > 20 ? '...' : ''}`
    );
    
    VisualizationService.createEmbeddingVisualization(
      'embedding-visualization',
      results.embeddings,
      labels
    );
    
    // Show sentences
    document.getElementById('explorer-results').classList.remove('hidden');
    const sentencesContainer = document.getElementById('explorer-sentences');
    sentencesContainer.innerHTML = '';
    
    results.sentences.forEach((sentence, index) => {
      const sentenceDiv = document.createElement('div');
      sentenceDiv.className = 'p-3 rounded border border-gray-200 hover:bg-gray-50';
      sentenceDiv.innerHTML = `
        <span class="text-indigo-600 font-medium mr-2">${index + 1}:</span>
        ${sentence.replace(
          results.word,
          `<span class="font-bold text-indigo-700">${results.word}</span>`
        )}
      `;
      
      // Add hover effect to highlight in visualization
      sentenceDiv.addEventListener('mouseenter', () => {
        const colors = results.embeddings.map((_, i) => 
          i === index ? '#FF5733' : '#1f77b4'
        );
        
        VisualizationService.createEmbeddingVisualization(
          'embedding-visualization',
          results.embeddings,
          labels,
          colors
        );
        
        sentenceDiv.classList.add('border-indigo-500', 'bg-indigo-50');
      });
      
      sentenceDiv.addEventListener('mouseleave', () => {
        VisualizationService.createEmbeddingVisualization(
          'embedding-visualization',
          results.embeddings,
          labels
        );
        
        sentenceDiv.classList.remove('border-indigo-500', 'bg-indigo-50');
      });
      
      sentencesContainer.appendChild(sentenceDiv);
    });
  },

  showLoading: function(isLoading) {
    if (isLoading) {
      document.getElementById('explorer-loading').classList.remove('hidden');
      document.getElementById('analyze-word-button').textContent = 'Analyzing...';
      document.getElementById('analyze-word-button').disabled = true;
    } else {
      document.getElementById('explorer-loading').classList.add('hidden');
      document.getElementById('analyze-word-button').textContent = 'Analyze Word';
      document.getElementById('analyze-word-button').disabled = false;
    }
  },

  showError: function(message) {
    const errorElement = document.getElementById('explorer-error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  },

  hideError: function() {
    document.getElementById('explorer-error').classList.add('hidden');
  }
};
