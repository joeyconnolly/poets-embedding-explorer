// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WordEmbeddingExplorer from './components/WordEmbeddingExplorer';
import AnalogyMachine from './components/AnalogyMachine';
import ContextMorphingPlayground from './components/ContextMorphingPlayground';
import SynestheticEmbeddingLandscape from './components/SynestheticEmbeddingLandscape';
import TransformerSonnetGenerator from './components/TransformerSonnetGenerator';
import ApiKeyModal from './components/shared/ApiKeyModal';

function App() {
  const [apiProvider, setApiProvider] = useState(localStorage.getItem('api_provider') || 'huggingface');
  const [showApiModal, setShowApiModal] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  
  useEffect(() => {
    // Check if API keys are set
    const hfKey = localStorage.getItem('hf_api_key');
    const openaiKey = localStorage.getItem('openai_api_key');
    
    setIsApiKeySet((apiProvider === 'huggingface' && hfKey) || 
                  (apiProvider === 'openai' && openaiKey));
    
    // If no API key is set, show the modal
    if (!hfKey && !openaiKey) {
      setShowApiModal(true);
    }
  }, [apiProvider]);
  
  const handleApiProviderChange = (e) => {
    const provider = e.target.value;
    setApiProvider(provider);
    localStorage.setItem('api_provider', provider);
  };
  
  const closeApiModal = (success) => {
    setShowApiModal(false);
    if (success) {
      setIsApiKeySet(true);
    }
  };
  
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <nav className="bg-white shadow-md p-4">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-2xl font-semibold text-indigo-600">Poet's Embedding Explorer</span>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex items-center">
                <span className="mr-2 text-gray-700">API:</span>
                <select 
                  value={apiProvider}
                  onChange={handleApiProviderChange}
                  className="py-1 px-2 border border-gray-300 rounded text-sm"
                >
                  <option value="huggingface">Hugging Face</option>
                  <option value="openai">OpenAI</option>
                </select>
                <button 
                  onClick={() => setShowApiModal(true)}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  {isApiKeySet ? 'Change Key' : 'Set API Key'}
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
            <div className="flex flex-wrap">
              <Link
                to="/"
                className="text-center py-3 px-4 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200"
              >
                Word Explorer
              </Link>
              <Link
                to="/analogy"
                className="text-center py-3 px-4 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200"
              >
                Analogy Machine
              </Link>
              <Link
                to="/context"
                className="text-center py-3 px-4 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200"
              >
                Context Morphing
              </Link>
              <Link
                to="/synesthetic"
                className="text-center py-3 px-4 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200"
              >
                Synesthetic Landscape
              </Link>
              <Link
                to="/sonnet"
                className="text-center py-3 px-4 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200"
              >
                Sonnet Generator
              </Link>
            </div>
          </div>
          
          <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6">
            <Routes>
              <Route path="/" element={<WordEmbeddingExplorer apiProvider={apiProvider} />} />
              <Route path="/analogy" element={<AnalogyMachine apiProvider={apiProvider} />} />
              <Route path="/context" element={<ContextMorphingPlayground apiProvider={apiProvider} />} />
              <Route path="/synesthetic" element={<SynestheticEmbeddingLandscape apiProvider={apiProvider} />} />
              <Route path="/sonnet" element={<TransformerSonnetGenerator apiProvider={apiProvider} />} />
            </Routes>
          </div>
        </div>
        
        <footer className="bg-gray-100 text-center p-4 text-gray-600 text-sm">
          <p>Built with React and D3.js for GitHub Pages</p>
          <p className="mt-1">Powered by transformer embeddings via {apiProvider === 'huggingface' ? 'Hugging Face API' : 'OpenAI API'}</p>
        </footer>
        
        {showApiModal && (
          <ApiKeyModal 
            apiProvider={apiProvider} 
            onClose={closeApiModal} 
          />
        )}
      </div>
    </Router>
  );
}

export default App;
