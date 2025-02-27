// src/services/api.js

/**
 * Service for making calls to embedding APIs
 */

// Function to get embeddings from Hugging Face
export const getHuggingFaceEmbedding = async (text, apiKey) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey || localStorage.getItem('hf_api_key') || ''}`,
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
};

// Function to get embeddings from OpenAI
export const getOpenAIEmbedding = async (text, apiKey) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey || localStorage.getItem('openai_api_key') || ''}`,
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
};

// Function to get embedding based on selected provider
export const getEmbedding = async (text, provider = "huggingface", apiKey = "") => {
  if (provider === "openai") {
    return getOpenAIEmbedding(text, apiKey);
  } else {
    return getHuggingFaceEmbedding(text, apiKey);
  }
};
