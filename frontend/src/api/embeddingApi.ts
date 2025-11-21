import axios from "axios";
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await axios.post("/api/embedding", { text });
  return response.data.embedding;
}
