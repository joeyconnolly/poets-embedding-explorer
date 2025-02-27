// src/components/shared/ApiKeyModal.js
import React, { useState, useEffect } from 'react';

const ApiKeyModal = ({ apiProvider, onClose }) => {
  const [huggingFaceKey, setHuggingFaceKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Load existing keys from localStorage
    const hfKey = localStorage.getItem('hf_api_key') || '';
    const oaiKey = localStorage.getItem('openai_api_key') || '';
    
    setHuggingFaceKey(hfKey);
    setOpenaiKey(oaiKey);
  }, []);
  
  const handleSave = () => {
    if (apiProvider === 'huggingface' && !huggingFaceKey) {
      setError('Please enter a Hugging Face API key');
      return;
    }
    
    if (apiProvider === 'openai' && !openaiKey) {
      setError('Please enter an OpenAI API key');
      return;
    }
    
    // Save to localStorage
    if (huggingFaceKey) {
      localStorage.setItem('hf_api_key', huggingFaceKey);
    }
    
    if (openaiKey) {
      localStorage.setItem('openai_api_key', openaiKey);
    }
    
    onClose(true);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Setup API Key</h2>
        
        <p className="text-gray-600 mb-4">
          This app requires an API key to generate embeddings. Your key is stored locally in your browser and never sent to our servers.
        </p>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Hugging Face API Key</label>
          <input
            type="password"
            value={huggingFaceKey}
            onChange={(e) => setHuggingFaceKey(e.target.value)}
            className={`w-full p-2 border rounded ${apiProvider === 'huggingface' ? 'border-indigo-300' : 'border-gray-300'}`}
            placeholder="Enter your Hugging Face API key"
          />
          <div className="mt-1 text-xs text-gray-500">
            <a 
              href="https://huggingface.co/settings/tokens" 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              Get a Hugging Face API key
            </a>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">OpenAI API Key</label>
          <input
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            className={`w-full p-2 border rounded ${apiProvider === 'openai' ? 'border-indigo-300' : 'border-gray-300'}`}
            placeholder="Enter your OpenAI API key"
          />
          <div className="mt-1 text-xs text-gray-500">
            <a 
              href="https://platform.openai.com/account/api-keys" 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              Get an OpenAI API key
            </a>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
