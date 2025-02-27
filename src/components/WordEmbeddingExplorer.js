// src/components/WordEmbeddingExplorer.js
import React, { useState, useEffect, useRef } from 'react';
import LoadingIndicator from './shared/LoadingIndicator';
import { getWordInContextEmbeddings } from '../services/embeddingService';
import { createEmbeddingVisualization } from '../services/visualizationService';

const DEFAULT_CONTEXTS = [
  "The [WORD] is deep and meaningful.",
  "She felt a sense of [WORD] in her heart.",
  "The sky reflects a perfect [WORD].",
  "His poem contained elements of [WORD].",
  "Ancient philosophers discussed [WORD] at length.",
  "The artist expressed [WORD] through colors.",
  "In modern society, [WORD] has changed meaning.",
  "Children often understand [WORD] intuitively."
];

const WordEmbeddingExplorer = ({ apiProvider }) => {
  const [word, setWord] = useState('');
  const [contexts, setContexts] = useState(DEFAULT_CONTEXTS.join('\n'));
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  // Refs for visualization
  const visualizationRef = useRef(null);
  const vizInstanceRef = useRef(null);
  
  // Analyze the word in different contexts
  const analyzeWord = async () => {
    if (!word.trim()) {
      setError('Please enter a word to explore');
      return;
    }
    
    const contextList = contexts
      .split('\n')
      .map(c => c.trim())
      .filter(c => c && c.includes('[WORD]'));
      
    if (contextList.length === 0) {
      setError('Please provide at least one context with [WORD] placeholder');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const results = await getWordInContextEmbeddings(
        word.trim(),
        contextList,
        apiProvider
      );
      
      setResults(results);
      setHighlightedIndex(-1);
    } catch (err) {
      setError(`Error: ${err.message || 'Failed to get embeddings'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Create or update visualization when results change
  useEffect(() => {
    if (results && results.embeddings && results.embeddings.length > 0) {
      const labels = results.sentences.map((sentence, index) => 
        `${index + 1}: ${sentence.substring(0, 20)}${sentence.length > 20 ? '...' : ''}`
      );
      
      // Initialize or update visualization
      if (!vizInstanceRef.current) {
        vizInstanceRef.current = createEmbeddingVisualization(
          'embedding-visualization',
          results.embeddings,
          labels
        );
      } else {
        vizInstanceRef.current.update(results.embeddings, labels);
      }
    }
  }, [results]);
  
  // Handle sentence hovering to highlight points
  const handleSentenceHover = (index) => {
    setHighlightedIndex(index);
    
    // Highlight the corresponding point in the visualization
    if (vizInstanceRef.current && results) {
      const colors = results.embeddings.map((_, i) => 
        i === index ? '#FF5733' : '#1f77b4'
      );
      
      vizInstanceRef.current.update(
        results.embeddings,
        results.sentences.map((sentence, i) => 
          `${i + 1}: ${sentence.substring(0, 20)}${sentence.length > 20 ? '...' : ''}`
        ),
        colors
      );
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Word Embedding Explorer</h1>
      <p className="text-gray-600 mb-6">
        Explore how a word's meaning shifts in different contexts through embedding visualization.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Enter a word to explore:</label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., love, freedom, harmony"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Contexts (one per line, use [WORD] as placeholder):</label>
            <textarea
              value={contexts}
              onChange={(e) => setContexts(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded h-48 font-mono text-sm"
            />
          </div>
          
          <button
            onClick={analyzeWord}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Word'}
          </button>
          
          {error && (
            <div className="mt-4 text-red-500">
              {error}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-3">Visualization</h2>
          {loading && (
            <div className="flex justify-center items-center h-48">
              <LoadingIndicator />
            </div>
          )}
          
          {!loading && !results && (
            <div className="flex justify-center items-center h-48 text-gray-500">
              Enter a word and click "Analyze Word" to see visualization
            </div>
          )}
          
          {!loading && results && (
            <div>
              <div id="embedding-visualization" ref={visualizationRef} className="h-64 w-full"></div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Drag to rotate the visualization. Points represent the word in different contexts.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {results && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-3">Context Sentences</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.sentences.map((sentence, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  highlightedIndex === index 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onMouseEnter={() => handleSentenceHover(index)}
                onMouseLeave={() => handleSentenceHover(-1)}
              >
                <span className="text-indigo-600 font-medium mr-2">{index + 1}:</span>
                {sentence.replace(
                  word,
                  `<span class="font-bold text-indigo-700">${word}</span>`
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-medium mb-3">Insights</h2>
            <p className="text-gray-700">
              The visualization shows how the word "<strong>{word}</strong>" shifts in meaning across different contexts.
              Points that are closer together represent more similar meanings.
            </p>
            <p className="text-gray-700 mt-2">
              This demonstrates how transformer models capture context-dependent semantic shifts,
              unlike traditional word embeddings that assign one vector per word.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordEmbeddingExplorer;
