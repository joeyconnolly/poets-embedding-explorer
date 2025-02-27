// API service for making calls to embedding APIs
const ApiService = {
  // Get the API key based on provider
  getApiKey: function(provider) {
    if (provider === 'huggingface') {
      return localStorage.getItem('hf_api_key') || '';
    } else if (provider === 'openai') {
      return localStorage.getItem('openai_api_key') || '';
    }
    return '';
  },

  // Set API key
  setApiKey: function(provider, key) {
    if (provider === 'huggingface') {
      localStorage.setItem('hf_api_key', key);
    } else if (provider === 'openai') {
      localStorage.setItem('openai_api_key', key);
    }
  },

  // Function to get embeddings from Hugging Face
  getHuggingFaceEmbedding: async function(text) {
    const apiKey = this.getApiKey('huggingface');
    if (!apiKey) {
      throw new Error('Hugging Face API key not set');
    }

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ inputs: text }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching embedding from Hugging Face:", error);
      throw error;
    }
  },

  // Function to get embeddings from OpenAI
  getOpenAIEmbedding: async function(text) {
    const apiKey = this.getApiKey('openai');
    if (!apiKey) {
      throw new Error('OpenAI API key not set');
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/embeddings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            input: text,
            model: "text-embedding-ada-002",
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error("Error fetching embedding from OpenAI:", error);
      throw error;
    }
  },

  // Function to get embedding based on selected provider
  getEmbedding: async function(text, provider = "huggingface") {
    if (provider === "openai") {
      return this.getOpenAIEmbedding(text);
    } else {
      return this.getHuggingFaceEmbedding(text);
    }
  }
};
