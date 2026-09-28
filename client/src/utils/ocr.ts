import { createWorker } from 'tesseract.js';

export interface OcrResult {
  text: string;
  lines: string[];
  suggestedExercises: Array<{
    name: string;
    sets: number;
    reps: string;
    weight?: number;
  }>;
}

export async function processPaperScan(
  imageSource: string | File,
  onProgress?: (progress: number, status: string) => void
): Promise<OcrResult> {
  const worker = await createWorker('spa+eng');

  if (onProgress) {
    onProgress(0.2, 'Iniciando motor de reconocimiento OCR...');
  }

  const ret = await worker.recognize(imageSource);
  await worker.terminate();

  const fullText = ret.data.text;
  const rawLines = fullText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2);

  // Parse lines to detect patterns like: "Sentadilla 4x10 40kg" or "Press banca 3x8"
  const suggestedExercises: OcrResult['suggestedExercises'] = [];

  for (const line of rawLines) {
    // Regex for: Exercise name + sets x reps + optional weight (e.g., 4x10 50kg)
    const matchSetsReps = line.match(/(\d+)\s*[xX*]\s*(\d+)/);
    const matchWeight = line.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos|k|lbs)?/i);

    let cleanName = line
      .replace(/(\d+)\s*[xX*]\s*(\d+)/, '')
      .replace(/(\d+(?:\.\d+)?)\s*(?:kg|kilos|k|lbs)/i, '')
      .replace(/^[-*•\d.)\s]+/, '')
      .trim();

    if (cleanName.length > 2) {
      const sets = matchSetsReps ? parseInt(matchSetsReps[1], 10) : 3;
      const reps = matchSetsReps ? matchSetsReps[2] : '10-12';
      let weight: number | undefined;

      if (matchWeight && !matchSetsReps) {
        weight = parseFloat(matchWeight[1]);
      } else if (matchWeight && matchSetsReps) {
        // Find if there was another number for weight
        const parts = line.split(/[xX*]/);
        if (parts.length > 1) {
          const afterReps = parts[1].replace(/^\d+/, '');
          const wMatch = afterReps.match(/(\d+(?:\.\d+)?)/);
          if (wMatch) weight = parseFloat(wMatch[1]);
        }
      }

      suggestedExercises.push({
        name: cleanName,
        sets: isNaN(sets) ? 3 : sets,
        reps: reps || '10',
        weight
      });
    }
  }

  return {
    text: fullText,
    lines: rawLines,
    suggestedExercises
  };
}
