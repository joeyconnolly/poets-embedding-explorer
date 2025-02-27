// src/services/embeddingService.js
import * as tf from '@tensorflow/tfjs';
import { getEmbedding } from './api';

/**
 * Get embeddings for a word in different contexts
 */
export const getWordInContextEmbeddings = async (word, contexts, provider, apiKey) => {
  const sentences = contexts.map(context => context.replace('[WORD]', word));
  const embeddings = await Promise.all(
    sentences.map(sentence => getEmbedding(sentence, provider, apiKey))
  );
  
  return {
    word,
    contexts,
    sentences,
    embeddings,
  };
};

/**
 * Perform word vector arithmetic (e.g., king - man + woman ≈ queen)
 */
export const performWordVectorArithmetic = async (positiveWords, negativeWords, provider, apiKey) => {
  // Get embeddings for positive words
  const positiveEmbeddings = await Promise.all(
    positiveWords.map(word => getEmbedding(word, provider, apiKey))
  );
  
  // Get embeddings for negative words
  const negativeEmbeddings = await Promise.all(
    negativeWords.map(word => getEmbedding(word, provider, apiKey))
  );
  
  // Convert to tensors for arithmetic
  const positiveTensors = positiveEmbeddings.map(emb => tf.tensor(emb));
  const negativeTensors = negativeEmbeddings.map(emb => tf.tensor(emb));
  
  // Sum positive embeddings
  let resultTensor = positiveTensors[0];
  for (let i = 1; i < positiveTensors.length; i++) {
    resultTensor = resultTensor.add(positiveTensors[i]);
  }
  
  // Subtract negative embeddings
  for (let i = 0; i < negativeTensors.length; i++) {
    resultTensor = resultTensor.sub(negativeTensors[i]);
  }
  
  // Convert back to array
  const resultEmbedding = await resultTensor.array();
  
  // Clean up tensors
  positiveTensors.forEach(tensor => tensor.dispose());
  negativeTensors.forEach(tensor => tensor.dispose());
  resultTensor.dispose();
  
  return resultEmbedding;
};

/**
 * Project high-dimensional embeddings to 3D space using PCA
 */
export const projectEmbeddingsTo3D = (embeddings) => {
  if (embeddings.length === 0) return [];
  
  // Convert embeddings to tensor
  const tensor = tf.tensor2d(embeddings);
  
  // Calculate mean for each dimension
  const mean = tf.mean(tensor, 0);
  
  // Center the data
  const centered = tf.sub(tensor, mean);
  
  // Calculate covariance matrix
  const cov = tf.matMul(centered.transpose(), centered).div(tf.scalar(centered.shape[0] - 1));
  
  // Get eigenvalues and eigenvectors
  const [eigenvalues, eigenvectors] = tf.linalg.eigvalsh(cov);
  
  // Sort eigenvalues and get indices in descending order
  const sortedIndices = tf.topk(eigenvalues, eigenvalues.shape[0]).indices;
  
  // Get top 3 eigenvectors
  const topIndices = sortedIndices.slice(0, 3);
  const principalVectors = tf.gather(eigenvectors, topIndices);
  
  // Project data to 3D
  const projected = tf.matMul(centered, principalVectors);
  
  // Convert back to array
  const result = projected.arraySync();
  
  // Clean up tensors
  tensor.dispose();
  mean.dispose();
  centered.dispose();
  cov.dispose();
  eigenvalues.dispose();
  eigenvectors.dispose();
  sortedIndices.dispose();
  topIndices.dispose();
  principalVectors.dispose();
  projected.dispose();
  
  return result;
};

/**
 * Blend two word embeddings with a given ratio
 */
export const blendEmbeddings = async (word1, word2, ratio, provider, apiKey) => {
  const embedding1 = await getEmbedding(word1, provider, apiKey);
  const embedding2 = await getEmbedding(word2, provider, apiKey);
  
  const tensor1 = tf.tensor(embedding1);
  const tensor2 = tf.tensor(embedding2);
  
  // Blend the embeddings using the ratio
  const blendedTensor = tensor1.mul(1 - ratio).add(tensor2.mul(ratio));
  const blendedEmbedding = await blendedTensor.array();
  
  // Clean up tensors
  tensor1.dispose();
  tensor2.dispose();
  blendedTensor.dispose();
  
  return blendedEmbedding;
};

/**
 * Find closest words to a given embedding
 */
export const findSimilarWords = async (embedding, wordList, provider, apiKey) => {
  // Get embeddings for all words in the list
  const wordEmbeddings = await Promise.all(
    wordList.map(async (word) => ({
      word,
      embedding: await getEmbedding(word, provider, apiKey),
    }))
  );
  
  // Calculate cosine similarity
  const embeddingTensor = tf.tensor(embedding);
  
  const similarities = await Promise.all(
    wordEmbeddings.map(async (wordObj) => {
      const wordTensor = tf.tensor(wordObj.embedding);
      
      // Normalize the tensors
      const normalizedEmb = embeddingTensor.div(tf.norm(embeddingTensor));
      const normalizedWord = wordTensor.div(tf.norm(wordTensor));
      
      // Calculate cosine similarity
      const similarity = normalizedEmb.dot(normalizedWord).dataSync()[0];
      
      // Clean up tensors
      wordTensor.dispose();
      
      return {
        word: wordObj.word,
        similarity,
      };
    })
  );
  
  // Clean up tensors
  embeddingTensor.dispose();
  
  // Sort by similarity (descending)
  return similarities.sort((a, b) => b.similarity - a.similarity);
};
