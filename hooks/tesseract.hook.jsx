import { useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';

export const useLoadOCR = () => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!worker) {
      loadTesseract().then((worker) => {
        setWorker(worker);
        setLoading(false);
      });
    }
  }, []);

  return { worker, loading };
};

export const useOCR = (worker, image) => {
  const [ocrResult, setOcrResult] = useState(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  useEffect(() => {
    if (worker && image) {
      setIsOcrLoading(true);
      worker.recognize(image).then(({ data }) => {
        console.log(data.text);
        setOcrResult(data.text);
        setIsOcrLoading(false);
      });
    }
  }, [worker, image]);

  return { isOcrLoading, ocrResult };
};

async function loadTesseract() {
  const worker = createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  return worker;
}
