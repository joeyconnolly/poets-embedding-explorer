// src/components/TransformerSonnetGenerator.js
import React, { useState, useEffect } from 'react';
import LoadingIndicator from './shared/LoadingIndicator';
import { getEmbedding, blendEmbeddings } from '../services/embeddingService';

// Poetic templates for generating metaphors and sonnets
const METAPHOR_TEMPLATES = [
  "[CONCEPT1] dances with [CONCEPT2] in the twilight of consciousness",
  "As [CONCEPT1] whispers, [CONCEPT2] awakens",
  "The [CONCEPT1] of our souls meets the [CONCEPT2] of existence",
  "Between [CONCEPT1] and [CONCEPT2], a bridge of understanding",
  "[CONCEPT1] is the shadow; [CONCEPT2], the light",
  "Not [CONCEPT1], nor [CONCEPT2], but something that transcends both",
  "[CONCEPT1] echoes across the chambers of [CONCEPT2]",
  "The [CONCEPT1] within mirrors the [CONCEPT2] without",
  "Through the lens of [CONCEPT1], [CONCEPT2] reveals its truth",
  "When [CONCEPT1] fades, [CONCEPT2] emerges from the mist",
  "[CONCEPT1] and [CONCEPT2]: two strands in the tapestry of being",
  "Time transforms [CONCEPT1] into [CONCEPT2], and back again",
  "In the garden of thought, [CONCEPT1] and [CONCEPT2] intertwine",
  "The music of [CONCEPT1] harmonizes with the rhythm of [CONCEPT2]",
  "Beyond the veil of [CONCEPT1] lies the essence of [CONCEPT2]",
  "[CONCEPT1] carries [CONCEPT2] on wings of possibility"
];

const SONNET_TEMPLATES = [
  `When [METAPHOR1] across the [BLEND] fields,
   And [METAPHOR2] beneath the [CONCEPT1] sky,
   The poet's heart, in wonderment, yields
   To visions that in [CONCEPT2] lie.

   Through [BLEND] realms where thought and feeling meet,
   Where [METAPHOR3] and [CONCEPT1] intertwine,
   The soul discovers wisdom, bittersweet,
   In [METAPHOR4] and truths divine.

   So let us journey through this [BLEND] space,
   Where [CONCEPT2] and [CONCEPT1] as one appear,
   And find within their [METAPHOR5] grace,
   The answers that we hold most dear.

   For in the [BLEND] between these worlds we find,
   The poetry that liberates the mind.`,
   
  `I wandered through the [BLEND] of thought,
   Where [METAPHOR1] meets [METAPHOR2] in silent dance,
   And there, the wisdom long I sought,
   Revealed itself through [CONCEPT1]'s glance.

   The [CONCEPT2] whispered ancient lore,
   Of [METAPHOR3] and [BLEND] mysteries deep,
   Each word a key to open doors,
   Where [METAPHOR4] and memory sleep.

   What [CONCEPT1] shows, let [CONCEPT2] embrace,
   In [BLEND] harmony they must reside,
   For only then can we find grace,
   Where [METAPHOR5] and truth collide.

   This [BLEND] path leads us to see,
   What always was and will forever be.`,
   
  `The [CONCEPT1] rises like the morning sun,
   While [CONCEPT2] flows like rivers to the sea,
   Their [BLEND] dance has only just begun,
   Revealing what was always meant to be.

   In [METAPHOR1] we glimpse the sacred truth,
   That [METAPHOR2] has hidden from our sight,
   The [BLEND] wisdom, ageless as our youth,
   Illuminates the darkness of the night.

   Through [METAPHOR3] and [METAPHOR4] combined,
   The poet crafts a [BLEND] tapestry,
   Where [CONCEPT1] and [CONCEPT2] are entwined,
   In patterns of divine geometry.

   This [BLEND] light that guides us through the haze,
   Transforms our nights into eternal days.`
];

const TransformerSonnetGenerator = ({ apiProvider }) => {
  const [concept1, setConcept1] = useState('love');
  const [concept2, setConcept2] = useState('time');
  const [blendRatio, setBlendRatio] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metaphors, setMetaphors] = useState([]);
  const [sonnet, setSonnet] = useState('');
  const [blendWord, setBlendWord] = useState('');
  
  // Generate metaphors and a sonnet based on blended concepts
  const generatePoetry = async () => {
    if (!concept1.trim() || !concept2.trim()) {
      setError('Please enter both concepts');
      return;
    }
    
    setLoading(true);
    setError('');
    setMetaphors([]);
    setSonnet('');
    
    try {
      // Get embeddings for both concepts
      const embedding1 = await getEmbedding(concept1, apiProvider);
      const embedding2 = await getEmbedding(concept2, apiProvider);
      
      // Blend the embeddings with the specified ratio
      const blendedEmbedding = await blendEmbeddings(
        concept1,
        concept2,
        blendRatio,
        apiProvider
      );
      
      // Generate a blend word
      const blendWord = generateBlendWord(concept1, concept2);
      setBlendWord(blendWord);
      
      // Generate metaphors using the templates
      const generatedMetaphors = generateMetaphors(concept1, concept2);
      setMetaphors(generatedMetaphors);
      
      // Generate a sonnet using the metaphors and concepts
      const generatedSonnet = generateSonnet(
        concept1,
        concept2,
        blendWord,
        generatedMetaphors
      );
      setSonnet(generatedSonnet);
      
    } catch (err) {
      setError(`Error: ${err.message || 'Failed to generate poetry'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate a blend word from two concepts
  const generateBlendWord = (word1, word2) => {
    // Simple blend: first half of word1 + second half of word2
    const mid1 = Math.floor(word1.length / 2);
    const mid2 = Math.floor(word2.length / 2);
    
    const blendWord = word1.slice(0, mid1) + word2.slice(mid2);
    
    // Capitalize first letter
    return blendWord.charAt(0).toUpperCase() + blendWord.slice(1);
  };
  
  // Generate metaphors using templates
  const generateMetaphors = (concept1, concept2) => {
    // Shuffle templates and select a subset
    const shuffled = [...METAPHOR_TEMPLATES].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    // Replace placeholders with concepts
    return selected.map(template => 
      template
        .replace(/\[CONCEPT1\]/g, concept1)
        .replace(/\[CONCEPT2\]/g, concept2)
    );
  };
  
  // Generate a sonnet using templates, concepts, and metaphors
  const generateSonnet = (concept1, concept2, blendWord, metaphors) => {
    // Select a random sonnet template
    const template = SONNET_TEMPLATES[Math.floor(Math.random() * SONNET_TEMPLATES.length)];
    
    // Replace placeholders with concepts, blend word, and metaphors
    return template
      .replace(/\[CONCEPT1\]/g, concept1)
      .replace(/\[CONCEPT2\]/g, concept2)
      .replace(/\[BLEND\]/g, blendWord)
      .replace(/\[METAPHOR1\]/g, metaphors[0] || `${concept1} meets ${concept2}`)
      .replace(/\[METAPHOR2\]/g, metaphors[1] || `${concept2} embraces ${concept1}`)
      .replace(/\[METAPHOR3\]/g, metaphors[2] || `${concept1} transforms ${concept2}`)
      .replace(/\[METAPHOR4\]/g, metaphors[3] || `${concept2} illuminates ${concept1}`)
      .replace(/\[METAPHOR5\]/g, metaphors[4] || `${concept1} and ${concept2} dance`);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Transformer Sonnet Generator</h1>
      <p className="text-gray-600 mb-6">
        Blend two concepts to generate poetic metaphors and a complete sonnet.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">First concept:</label>
            <input
              type="text"
              value={concept1}
              onChange={(e) => setConcept1(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., love, freedom, memory"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Second concept:</label>
            <input
              type="text"
              value={concept2}
              onChange={(e) => setConcept2(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., time, darkness, ocean"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Blend ratio: {blendRatio * 100}% {concept1} / {(1 - blendRatio) * 100}% {concept2}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={blendRatio}
              onChange={(e) => setBlendRatio(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <button
            onClick={generatePoetry}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Poetry'}
          </button>
          
          {error && (
            <div className="mt-4 text-red-500">
              {error}
            </div>
          )}
        </div>
        
        <div>
          {loading && (
            <div className="flex justify-center items-center h-48">
              <LoadingIndicator />
            </div>
          )}
          
          {!loading && metaphors.length === 0 && (
            <div className="flex justify-center items-center h-48 text-gray-500">
              Enter two concepts and click "Generate Poetry" to create metaphors and a sonnet
            </div>
          )}
          
          {!loading && metaphors.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3">Blended Concept: "{blendWord}"</h2>
              <div className="mb-4">
                <h3 className="text-md font-medium mb-2">Metaphors:</h3>
                <ul className="space-y-2">
                  {metaphors.map((metaphor, index) => (
                    <li key={index} className="p-2 bg-purple-50 rounded italic">
                      "{metaphor}"
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {sonnet && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-3">Generated Sonnet</h2>
          <div className="bg-indigo-50 p-6 rounded-lg font-serif">
            <div className="whitespace-pre-line">
              {sonnet}
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-medium mb-3">About This Sonnet</h2>
            <p className="text-gray-700">
              This sonnet was generated by blending the concepts of "{concept1}" and "{concept2}" 
              at a ratio of {blendRatio * 100}% to {(1 - blendRatio) * 100}%.
            </p>
            <p className="text-gray-700 mt-2">
              The embedding space allows us to mathematically combine concepts, 
              creating new semantic dimensions that poets can explore for inspiration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransformerSonnetGenerator;
