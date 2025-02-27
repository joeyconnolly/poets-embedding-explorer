// src/components/SynestheticEmbeddingLandscape.js
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import LoadingIndicator from './shared/LoadingIndicator';
import { getEmbedding } from '../services/embeddingService';
import { mapEmbeddingsToColors } from '../services/visualizationService';

const DEFAULT_WORDS = [
  'love', 'ocean', 'fire', 'wisdom', 'melody',
  'silence', 'dream', 'infinity', 'tranquility', 'storm',
  'whisper', 'cosmos', 'harmony', 'shadow', 'dawn'
];

const SynestheticEmbeddingLandscape = ({ apiProvider }) => {
  const [words, setWords] = useState(DEFAULT_WORDS.join('\n'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [embeddings, setEmbeddings] = useState([]);
  const [wordsList, setWordsList] = useState([]);
  const [colorMap, setColorMap] = useState([]);
  
  // Refs for visualization
  const visualizationRef = useRef(null);
  const audioContextRef = useRef(null);
  
  // Visualize the words as a synesthetic landscape
  const visualizeWords = async () => {
    if (!words.trim()) {
      setError('Please enter at least one word');
      return;
    }
    
    // Parse words from textarea
    const wordArray = words
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0);
    
    if (wordArray.length === 0) {
      setError('Please enter at least one word');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Get embeddings for all words
      const embeddingResults = await Promise.all(
        wordArray.map(word => getEmbedding(word, apiProvider))
      );
      
      setEmbeddings(embeddingResults);
      setWordsList(wordArray);
      
      // Map embeddings to colors
      const colors = mapEmbeddingsToColors(embeddingResults);
      setColorMap(colors);
      
    } catch (err) {
      setError(`Error: ${err.message || 'Failed to get embeddings'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Create the synesthetic visualization when embeddings change
  useEffect(() => {
    if (embeddings.length > 0 && wordsList.length === embeddings.length) {
      createSynestheticVisualization();
    }
  }, [embeddings, wordsList]);
  
  // Create a draggable, color-coded visualization
  const createSynestheticVisualization = () => {
    // Clear previous visualization
    d3.select('#synesthetic-visualization').selectAll('*').remove();
    
    const width = visualizationRef.current.clientWidth;
    const height = 400;
    
    // Create SVG container
    const svg = d3.select('#synesthetic-visualization')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Create background gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'background-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
      
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f3e5f5');
      
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#e1bee7');
    
    // Add background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#background-gradient)');
    
    // Calculate positions (initial arrangement in a circle)
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    const positions = wordsList.map((_, i) => {
      const angle = (i / wordsList.length) * 2 * Math.PI;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    // Create word elements
    const wordElements = svg.selectAll('.word')
      .data(wordsList)
      .enter()
      .append('g')
      .attr('class', 'word')
      .attr('transform', (_, i) => `translate(${positions[i].x}, ${positions[i].y})`)
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));
    
    // Add circles
    wordElements.append('circle')
      .attr('r', 36)
      .attr('fill', (_, i) => colorMap[i] || '#9c27b0')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);
    
    // Add text
    wordElements.append('text')
      .text(d => d)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none');
    
    // Add connections between words
    const connections = svg.append('g')
      .attr('class', 'connections');
      
    // Create connections between semantically related words
    for (let i = 0; i < wordsList.length; i++) {
      for (let j = i + 1; j < wordsList.length; j++) {
        connections.append('line')
          .attr('x1', positions[i].x)
          .attr('y1', positions[i].y)
          .attr('x2', positions[j].x)
          .attr('y2', positions[j].y)
          .attr('stroke', '#e1bee7')
          .attr('stroke-width', 1)
          .attr('opacity', 0.3);
      }
    }
    
    // Drag functions
    function dragStarted(event, d) {
      d3.select(this).raise().attr('stroke', 'black');
      
      // Start sound if WebAudio is supported
      playWordSound(d3.select(this));
    }
    
    function dragged(event, d) {
      // Update position of the dragged element
      d3.select(this).attr('transform', `translate(${event.x}, ${event.y})`);
      
      // Update connections
      const index = wordsList.indexOf(d);
      
      connections.selectAll('line').each(function() {
        const line = d3.select(this);
        const x1 = parseFloat(line.attr('x1'));
        const y1 = parseFloat(line.attr('y1'));
        const x2 = parseFloat(line.attr('x2'));
        const y2 = parseFloat(line.attr('y2'));
        
        if (Math.abs(x1 - positions[index].x) < 1 && Math.abs(y1 - positions[index].y) < 1) {
          line.attr('x1', event.x).attr('y1', event.y);
        } else if (Math.abs(x2 - positions[index].x) < 1 && Math.abs(y2 - positions[index].y) < 1) {
          line.attr('x2', event.x).attr('y2', event.y);
        }
      });
      
      // Update the stored position
      positions[index] = { x: event.x, y: event.y };
      
      // Update sound properties based on position
      updateSound(d3.select(this), event.x / width, event.y / height);
    }
    
    function dragEnded(event, d) {
      d3.select(this).attr('stroke', null);
      
      // Stop sound
      stopSound();
    }
  };
  
  // WebAudio functions for sonification
  const playWordSound = (element) => {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Create oscillator
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Set initial frequency based on the color
      const color = element.select('circle').attr('fill');
      const r = parseInt(color.slice(4, color.indexOf(',')), 10);
      const frequency = 220 + (r / 255) * 440; // Map to frequency between 220-660Hz
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      // Set volume
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Start oscillator
      oscillator.start();
      
      // Store reference to oscillator and gain node
      element.datum().oscillator = oscillator;
      element.datum().gainNode = gainNode;
      
    } catch (error) {
      console.error('WebAudio error:', error);
    }
  };
  
  const updateSound = (element, xRatio, yRatio) => {
    if (!element.datum().oscillator) return;
    
    try {
      const oscillator = element.datum().oscillator;
      const gainNode = element.datum().gainNode;
      
      // Update frequency based on X position (220-880Hz)
      const frequency = 220 + xRatio * 660;
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      
      // Update volume based on Y position (quieter at bottom)
      const volume = 0.5 - (yRatio * 0.4);
      gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    } catch (error) {
      console.error('WebAudio update error:', error);
    }
  };
  
  const stopSound = () => {
    d3.selectAll('.word').each(function(d) {
      if (d.oscillator) {
        d.oscillator.stop();
        delete d.oscillator;
        delete d.gainNode;
      }
    });
  };
  
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Synesthetic Embedding Landscape</h1>
      <p className="text-gray-600 mb-6">
        Experience words as colors and sounds in an interactive, draggable space representing embedding relationships.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Words (one per line):</label>
            <textarea
              value={words}
              onChange={(e) => setWords(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows={10}
              placeholder="Enter words, one per line"
            />
          </div>
          
          <button
            onClick={visualizeWords}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Visualizing...' : 'Visualize Words'}
          </button>
          
          {error && (
            <div className="mt-4 text-red-500">
              {error}
            </div>
          )}
          
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded text-sm">
            <h3 className="font-medium text-purple-800 mb-1">Instructions:</h3>
            <ul className="list-disc list-inside text-purple-700 space-y-1">
              <li>Drag words to rearrange them</li>
              <li>Each word's color represents its meaning</li>
              <li>If audio is enabled, hear sounds as you drag</li>
              <li>Related words have subtle connections</li>
            </ul>
          </div>
        </div>
        
        <div className="md:col-span-2">
          {loading && (
            <div className="flex justify-center items-center h-64">
              <LoadingIndicator />
            </div>
          )}
          
          {!loading && wordsList.length === 0 && (
            <div className="flex justify-center items-center h-64 text-gray-500">
              Enter words and click "Visualize Words" to create a synesthetic landscape
            </div>
          )}
          
          <div 
            id="synesthetic-visualization" 
            ref={visualizationRef} 
            className={`w-full ${wordsList.length > 0 ? '' : 'hidden'}`}
          ></div>
        </div>
      </div>
      
      {wordsList.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-medium mb-3">Synesthetic Interpretation</h2>
          <p className="text-gray-700">
            This visualization maps word embeddings to visual and auditory experiences.
            Colors represent semantic dimensions, while sound frequencies encode meaning when dragging.
          </p>
          <p className="text-gray-700 mt-2">
            Try rearranging words to create "semantic constellations" and discover
            unexpected relationships between concepts through their embedding proximity.
          </p>
        </div>
      )}
    </div>
  );
};

export default SynestheticEmbeddingLandscape;
