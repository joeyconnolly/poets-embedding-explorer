// src/components/AnalogyMachine.js
import React, { useState, useEffect, useRef } from 'react';
import LoadingIndicator from './shared/LoadingIndicator';
import { getEmbedding, performWordVectorArithmetic, findSimilarWords } from '../services/embeddingService';
import { createEmbeddingVisualization, animateEmbeddingTransition } from '../services/visualizationService';

// Common poetic word list for finding similar words
const POETIC_WORD_LIST = [
  'love', 'beauty', 'heart', 'soul', 'dream', 'whisper',
  'eternity', 'memory', 'shadow', 'light', 'darkness', 'silence',
  'voice', 'spirit', 'nature', 'ocean', 'sky', 'moon', 'sun',
  'star', 'flower', 'wind', 'storm', 'peace', 'passion', 'desire',
  'longing', 'sorrow', 'joy', 'hope', 'faith', 'truth', 'grace',
  'freedom', 'wisdom', 'time', 'death', 'life', 'birth', 'infinity',
  'mystery', 'reflection', 'journey', 'paradise', 'flame', 'ice',
  'dance', 'song', 'poetry', 'music', 'harmony', 'melody', 'rhythm',
  'echo', 'universe', 'celestial', 'terrestrial', 'eternal', 'ephemeral',
  'divine', 'mortal', 'sacred', 'profane', 'innocence', 'experience'
];

const AnalogyMachine = ({ apiProvider }) => {
  const [positiveWords, setPositiveWords] = useState(['king', 'woman']);
  const [negativeWords, setNegativeWords] = useState(['man']);
  const [customWord, setCustomWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [similarWords, setSimilarWords] = useState([]);
  const [embeddings, setEmbeddings] = useState([]);
  const [labels, setLabels] = useState([]);
  
  // Refs for visualization
  const visualizationRef = useRef(null);
  const vizInstanceRef = useRef(null);
  
  // Calculate the analogy
  const calculateAnalogy = async () => {
    if (positiveWords.length === 0) {
      setError('Please enter at least one positive word');
      return;
    }
    
    setLoading(true);
    setError('');
    setSimilarWords([]);
    
    try {
      // Get all individual word embeddings for visualization
      const allWords = [...positiveWords, ...negativeWords];
      const allEmbeddings = await Promise.all(
        allWords.map(word => getEmbedding(word, apiProvider))
      );
      
      // Store embeddings for visualization
      setEmbeddings(allEmbeddings);
      setLabels([
        ...positiveWords.map(word => `+${word}`),
        ...negativeWords.map(word => `-${word}`)
      ]);
      
      // Calculate the result embedding using vector arithmetic
      const resultEmbedding = await performWordVectorArithmetic(
        positiveWords,
        negativeWords,
        apiProvider
      );
      
      // Find similar words to the result
      let wordsToSearch = [...POETIC_WORD_LIST];
      
      // Add custom word if provided
      if (customWord.trim()) {
        wordsToSearch = [customWord.trim(), ...wordsToSearch];
      }
      
      // Filter out words that are already in positive/negative lists
      wordsToSearch = wordsToSearch.filter(
        word => !positiveWords.includes(word) && !negativeWords.includes(word)
      );
      
      const similar = await findSimilarWords(
        resultEmbedding,
        wordsToSearch,
        apiProvider
      );
      
      // Update result and similar words
      setResult(resultEmbedding);
      setSimilarWords(similar.slice(0, 10));
      
      // Add result embedding to visualization
      const updatedEmbeddings = [...allEmbeddings, resultEmbedding];
      const updatedLabels = [...labels, 'Result'];
      
      setEmbeddings(updatedEmbeddings);
      setLabels(updatedLabels);
      
    } catch (err) {
      setError(`Error: ${err.message || 'Failed to calculate analogy'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Add word to positive list
  const addPositiveWord = () => {
    if (customWord.trim() && !positiveWords.includes(customWord.trim())) {
      setPositiveWords([...positiveWords, customWord.trim()]);
      setCustomWord('');
    }
  };
  
  // Add word to negative list
  const addNegativeWord = () => {
    if (customWord.trim() && !negativeWords.includes(customWord.trim())) {
      setNegativeWords([...negativeWords, customWord.trim()]);
      setCustomWord('');
    }
  };
  
  // Remove word from positive list
  const removePositiveWord = (word) => {
    setPositiveWords(positiveWords.filter(w => w !== word));
  };
  
  // Remove word from negative list
  const removeNegativeWord = (word) => {
    setNegativeWords(negativeWords.filter(w => w !== word));
  };
  
  // Create or update visualization when embeddings change
  useEffect(() => {
    if (embeddings.length > 0) {
      // Color mapping: positive words, negative words, result
      const colors = embeddings.map((_, i) => {
        if (i < positiveWords.length) return '#4CAF50'; // Green for positive
        if (i < positiveWords.length + negativeWords.length) return '#F44336'; // Red for negative
        return '#2196F3'; // Blue for result
      });
      
      // Initialize or update visualization
      if (!vizInstanceRef.current) {
        vizInstanceRef.current = createEmbeddingVisualization(
          'analogy-visualization',
          embeddings,
          labels,
          colors
        );
      } else {
        // If result was just added, animate transition
        if (result && embeddings.length === labels.length) {
          const startEmbeddings = embeddings.slice(0, embeddings.length - 1);
          animateEmbeddingTransition(
            'analogy-visualization',
            startEmbeddings,
            embeddings,
            labels
          );
        } else {
          vizInstanceRef.current.update(embeddings, labels, colors);
        }
      }
    }
  }, [embeddings, labels, positiveWords.length, negativeWords.length, result]);
  
  // Generate formatted equation
  const getEquation = () => {
    const posTerms = positiveWords.map(word => `${word}`).join(' + ');
    const negTerms = negativeWords.length > 0 
      ? ` - ${negativeWords.join(' - ')}` 
      : '';
    
    return `${posTerms}${negTerms} = ?`;
  };
  
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Analogy Machine</h1>
      <p className="text-gray-600 mb-6">
        Explore word vector arithmetic and discover poetic analogies through embedding calculations.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <label className="text-gray-700 mr-2">Positive words:</label>
              <div className="flex flex-wrap">
                {positiveWords.map((word, index) => (
                  <span 
                    key={index} 
                    className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-2 mb-1 flex items-center"
                  >
                    {word}
                    <button 
                      onClick={() => removePositiveWord(word)}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center mb-2">
              <label className="text-gray-700 mr-2">Negative words:</label>
              <div className="flex flex-wrap">
                {negativeWords.map((word, index) => (
                  <span 
                    key={index} 
                    className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm mr-2 mb-1 flex items-center"
                  >
                    {word}
                    <button 
                      onClick={() => removeNegativeWord(word)}
                      className="ml-1 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-700 mb-2">Add a word:</label>
              <div className="flex">
                <input
                  type="text"
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-l"
                  placeholder="e.g., poetry, autumn, melody"
                />
                <button
                  onClick={addPositiveWord}
                  className="px-3 py-2 bg-green-600 text-white hover:bg-green-700"
                >
                  + Add
                </button>
                <button
                  onClick={addNegativeWord}
                  className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-r"
                >
                  - Add
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-lg mb-4">
            <h3 className="text-lg font-medium mb-2">Equation</h3>
            <div className="text-xl font-mono">{getEquation()}</div>
          </div>
          
          <button
            onClick={calculateAnalogy}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate Analogy'}
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
          
          {!loading && embeddings.length === 0 && (
            <div className="flex justify-center items-center h-48 text-gray-500">
              Enter words and click "Calculate Analogy" to see visualization
            </div>
          )}
          
          {!loading && embeddings.length > 0 && (
            <div>
              <div id="analogy-visualization" ref={visualizationRef} className="h-64 w-full"></div>
              <div className="mt-2 text-sm">
                <div className="flex items-center mb-1">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span>Positive words</span>
                </div>
                <div className="flex items-center mb-1">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  <span>Negative words</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span>Result</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {similarWords.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-3">Similar Words</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarWords.map((wordObj, index) => (
              <div 
                key={index}
                className="p-3 border border-gray-200 rounded hover:bg-gray-50"
              >
                <div className="font-medium">{wordObj.word}</div>
                <div className="text-sm text-gray-500">
                  Similarity: {(wordObj.similarity * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-medium mb-3">Poetic Interpretation</h2>
            <p className="text-gray-700">
              The analogy between <strong>{positiveWords.join(' + ')}</strong>
              {negativeWords.length > 0 && <span> - <strong>{negativeWords.join(' - ')}</strong></span>}
              {similarWords.length > 0 && <span> and <strong>{similarWords[0].word}</strong></span>}
              {' '}reveals the subtle connections between these concepts in the embedding space.
            </p>
            <p className="text-gray-700 mt-2">
              This demonstrates how transformer models encode semantic relationships,
              allowing poets to explore metaphorical connections between words and concepts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalogyMachine;
