// Requires pdfjs-dist in dependencies (we'll add it)
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
};

export const chunkText = (
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] => {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    chunks.push(text.slice(startIndex, endIndex));
    startIndex += chunkSize - overlap;
  }

  return chunks;
};

export const searchRelevantChunks = (
  query: string,
  documents: any[],
  topK: number = 5
): { text: string; docName: string }[] => {
  const queryTerms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 3);

  const results: { text: string; docName: string; score: number }[] = [];

  documents.forEach((doc) => {
    doc.chunks.forEach((chunk: string) => {
      let score = 0;
      queryTerms.forEach((term) => {
        const regex = new RegExp(term, "gi");
        const matches = chunk.match(regex);
        if (matches) score += matches.length;
      });
      if (score > 0) {
        results.push({ text: chunk, docName: doc.name, score });
      }
    });
  });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ text, docName }) => ({ text, docName }));
};
