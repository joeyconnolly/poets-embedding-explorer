// Embedding service for embedding operations
const EmbeddingService = {
  // Get embeddings for a word in different contexts
  getWordInContextEmbeddings: async function(word, contexts, provider) {
    const sentences = contexts.map(context => context.replace('[WORD]', word));
    const embeddings = await Promise.all(
      sentences.map(sentence => ApiService.getEmbedding(sentence, provider))
    );
    
    return {
      word,
      contexts,
      sentences,
      embeddings,
    };
  },

  // Project high-dimensional embeddings to 3D space using PCA
  projectEmbeddingsTo3D: function(embeddings) {
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
  },

  // Perform word vector arithmetic
  performWordVectorArithmetic: async function(positiveWords, negativeWords, provider) {
    // Get embeddings for positive words
    const positiveEmbeddings = await Promise.all(
      positiveWords.map(word => ApiService.getEmbedding(word, provider))
    );
    
    // Get embeddings for negative words
    const negativeEmbeddings = await Promise.all(
      negativeWords.map(word => ApiService.getEmbedding(word, provider))
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
  }
};
