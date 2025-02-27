// src/components/ContextMorphingPlayground.js
import React, { useState, useEffect, useRef } from 'react';
import LoadingIndicator from './shared/LoadingIndicator';
import { getEmbedding } from '../services/embeddingService';
import { createEmbeddingVisualization, animateEmbeddingTransition } from '../services/visualizationService';

const ContextMorphingPlayground = ({ apiProvider }) => {
  const [sentence, setSentence] = useState("The poet explored the vast ocean of creativity.");
  const [targetWord, setTargetWord] = useState("ocean");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [embeddings, setEmbeddings] = useState([]);
  const [contexts, setContexts] = useState([]);
  
  // Refs for visualization
  const visualizationRef = useRef(null);
  const vizInstanceRef = useRef(null);
  
  // Generate alternative contexts for the target word
  const generateContexts = async () => {
    if (!sentence.trim()) {
      setError('Please enter a sentence');
      return;
    }
    
    if (!targetWord.trim() || !sentence.includes(targetWord.trim())) {
      setError('Target word must be present in the sentence');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Generate variations of the sentence by replacing words around the target
      const words = sentence.split(/\s+/);
      const targetIndex = words.findIndex(w => w.includes(targetWord));
      
      if (targetIndex === -1) {
        setError('Target word not found in sentence');
        setLoading(false);
        return;
      }
      
      // Generate contextual variations
      const variations = generateSentenceVariations(words, targetIndex);
      
      // Get embeddings for all variations
      const embeddingResults = await Promise.all(
        variations.map(variation => getEmbedding(variation, apiProvider))
      );
      
      setEmbeddings(embeddingResults);
      setContexts(variations);
      
    } catch (err) {
      setError(`Error: ${err.message || 'Failed to generate contexts'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate variations of the sentence by modifying context words
  const generateSentenceVariations = (words, targetIndex) => {
    const variations = [words.join(' ')]; // Original sentence
    
    // List of adjectives to replace if an adjective is present before the target
    const adjectives = [
      'vast', 'deep', 'boundless', 'infinite', 'mysterious',
      'calm', 'turbulent', 'serene', 'dark', 'bright'
    ];
    
    // List of verbs to replace if a verb is present before the target (with 1-word buffer)
    const verbs = [
      'explored', 'discovered', 'navigated', 'entered', 'traversed',
      'observed', 'witnessed', 'experienced', 'contemplated', 'understood'
    ];
    
    // Adjective replacement (if there's a word before target)
    if (targetIndex > 0) {
      // Try to replace the word directly before target (potential adjective)
      for (const adj of adjectives) {
        if (adj !== words[targetIndex - 1]) {
          const newWords = [...words];
          newWords[targetIndex - 1] = adj;
          variations.push(newWords.join(' '));
          
          if (variations.length >= 5) break; // Limit variations
        }
      }
    }
    
    // Verb replacement (look for verbs 2-3 positions before target)
    if (targetIndex > 1) {
      for (let i = 1; i <= Math.min(3, targetIndex); i++) {
        for (const verb of verbs) {
          if (verb !== words[targetIndex - i]) {
            const newWords = [...words];
            newWords[targetIndex - i] = verb;
            variations.push(newWords.join(' '));
            
            if (variations.length >= 10) break; // Limit variations
          }
        }
        if (variations.length >= 10) break;
      }
    }
    
    // For shorter sentences, generate more variations with both verb and adjective changes
    if (variations.length < 5 && targetIndex > 1) {
      for (const verb of verbs) {
        for (const adj of adjectives) {
          if (verb !== words[targetIndex - 2] && adj !== words[targetIndex - 1]) {
            const newWords = [...words];
            newWords[targetIndex - 2] = verb;
            newWords[targetIndex - 1] = adj;
            variations.push(newWords.join(' '));
            
            if (variations.length >= 10) break;
          }
        }
        if (variations.length >= 10) break;
      }
    }
    
    return variations.slice(0, 10); // Return up to 10 variations
  };
  
  // Create or update visualization when embeddings change
  useEffect(() => {
    if (embeddings.length > 0) {
      const labels = contexts.map((ctx, i) => 
        i === 0 ? 'Original' : `Variation ${i}`
      );
      
      // Color the original sentence differently
      const colors = embeddings.map((_, i) => 
        i === 0 ? '#E91E63' : '#2196F3'
      );
      
      // Initialize or update visualization
      if (!vizInstanceRef.current) {
        vizInstanceRef.current = createEmbeddingVisualization(
          'context-visualization',
          embeddings,
          labels,
          colors
        );
      } else {
        vizInstanceRef.current.update(embeddings, labels, colors);
      }
    }
  }, [embeddings, contexts]);
  
  // Get the highlighted sentence with target word emphasized
  const getHighlightedSentence = (text) => {
    if (!targetWord.trim() || !text.includes(targetWord)) return text;
    
    return text.replace(
      new RegExp(`(${targetWord})`, 'gi'),
      '<span class="font-bold text-indigo-700">$1</span>'
    );
  };
  
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Context Morphing Playground</h1>
      <p className="text-gray-600 mb-6">
        Explore how a word's meaning adapts to its surrounding context through embedding shifts.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Enter a sentence:</label>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
              placeholder="Enter a poetic sentence containing your target word"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Target word:</label>
            <input
              type="text"
              value={targetWord}
              onChange={(e) => setTargetWord(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Word to track in context"
            />
            <p className="text-sm text-gray-500 mt-1">
              This word must appear in your sentence.
            </p>
          </div>
          
          <button
            onClick={generateContexts}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Context Variations'}
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
              Enter a sentence and target word, then click "Generate Context Variations"
            </div>
          )}
          
          {!loading && embeddings.length > 0 && (
            <div>
              <div id="context-visualization" ref={visualizationRef} className="h-64 w-full"></div>
              <div className="mt-2 text-sm">
                <div className="flex items-center mb-1">
                  <span className="w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
                  <span>Original sentence</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span>Variations</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {contexts.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-3">Context Variations</h2>
          <div className="grid grid-cols-1 gap-3">
            {contexts.map((ctx, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  index === 0 
                    ? 'border-pink-300 bg-pink-50' 
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="text-sm font-medium mb-1 text-gray-500">
                  {index === 0 ? 'Original:' : `Variation ${index}:`}
                </div>
                <div 
                  dangerouslySetInnerHTML={{ __html: getHighlightedSentence(ctx) }}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-medium mb-3">Contextual Insights</h2>
            <p className="text-gray-700">
              The visualization shows how the embedding of "{targetWord}" shifts based on the surrounding words.
              Notice how different surrounding contexts cause subtle meaning changes reflected in the embedding space.
            </p>
            <p className="text-gray-700 mt-2">
              This demonstrates the contextual nature of transformer embeddings,
              which capture nuanced meaning based on the entire sentence structure.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextMorphingPlayground;
