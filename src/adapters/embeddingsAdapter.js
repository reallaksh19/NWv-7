export async function getEmbeddings(texts) {
  // Simple fallback/mock implementation for the adapter
  return texts.map(text => {
    const vec = new Array(384).fill(0);
    // basic deterministic vector based on string length and first char
    if (text && text.length > 0) {
      vec[0] = text.length / 1000;
      vec[1] = text.charCodeAt(0) / 255;
    }
    return vec;
  });
}
