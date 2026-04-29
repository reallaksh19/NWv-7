/**
 * Local ONNX Embeddings using @xenova/transformers
 * Runs entirely on the client-side (browser or Node.js)
 * Downloads a ~20MB quantized MiniLM model and runs it locally.
 */

import { pipeline, env } from '@xenova/transformers';

// Setup environment for browser/static compatibility
// When running in a real browser, this will cache the model in IndexedDB.
env.allowLocalModels = false; // We pull from HF hub instead of local file system

let extractorPromise = null;

async function getExtractor() {
  if (!extractorPromise) {
    // feature-extraction pipeline outputs embeddings
    extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractorPromise;
}

export async function getEmbeddings(texts) {
  if (!texts || texts.length === 0) return [];

  const extractor = await getExtractor();

  // Extract embeddings for all texts
  // pooling: 'mean' averages the token embeddings to a single sentence embedding
  // normalize: true ensures the vectors are unit-normalized for cosine similarity
  const output = await extractor(texts, { pooling: 'mean', normalize: true });

  // output is a Tensor. We need to convert it back to an array of arrays.
  const vectors = [];
  const dim = output.dims[output.dims.length - 1]; // typically 384

  for (let i = 0; i < texts.length; i++) {
    // Slice out the i-th embedding
    const vec = Array.from(output.data.slice(i * dim, (i + 1) * dim));
    vectors.push(vec);
  }

  return vectors;
}
