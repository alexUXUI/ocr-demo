import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';

import styles from '../styles/Home.module.css';

async function loadWorker() {
  const worker = createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  return worker;
}

const useOCR = (image) => {
  const [worker, setWorker] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);

  useEffect(() => {
    if (!worker) {
      loadWorker().then((worker) => {
        setWorker(worker);
      });
    }
  }, [worker]);

  useEffect(() => {
    if (worker && image) {
      worker.recognize(image).then(({ data }) => {
        console.log(data.text);
        setOcrResult(data.text);
      });
    }
  }, [worker, image]);

  return { ocrResult };
};

const ImageUploader = () => {
  const [imageFile, setImageFile] = useState(null);
  const [frameCounterImage, setFrameCounterImage] = useState();

  const { ocrResult } = useOCR(frameCounterImage);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const canvasRef = useRef(null);
  const frameCounterCanvasRef = useRef(null);

  const drawImage = (image) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
  };

  // when the image file changes, draw the full image to the main canvas
  useEffect(() => {
    if (imageFile) {
      const image = new Image();
      image.src = URL.createObjectURL(imageFile);
      image.onload = () => {
        drawImage(image);
      };
    }
  }, [imageFile]);

  // when the image file changes, draw the bottom left 100 x 45 pixels to the frame counter canvas
  useEffect(() => {
    if (imageFile) {
      const image = new Image();
      image.src = URL.createObjectURL(imageFile);
      image.onload = () => {
        // get the bottom left 100 x 45 pixels
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, canvas.height - 45, 100, 37);
        // create a canvas to draw the bottom left 100 x 45 pixels
        const frameCounterCanvas = frameCounterCanvasRef.current;
        frameCounterCanvas.width = 100;
        frameCounterCanvas.height = 45;
        const frameCounterCtx = frameCounterCanvas.getContext('2d');
        frameCounterCtx.putImageData(imageData, 0, 0);

        // turn the imageData into a blob
        frameCounterCanvas.toBlob((blob) => {
          const frameCounterImage = new Image();
          frameCounterImage.src = URL.createObjectURL(blob);
          setFrameCounterImage(frameCounterImage);
        });
      };
    }
  }, [imageFile]);

  return (
    <div>
      <h1>Upload an Image</h1>
      <input type="file" onChange={handleImageUpload} />
      <div>
        <h1>Input Image</h1>
        <div>
          <canvas ref={canvasRef} />
        </div>
      </div>
      <div>
        <h2>OCR Image Input</h2>
        <div>
          <canvas ref={frameCounterCanvasRef} />
        </div>
        {ocrResult ? (
          <>
            <h3>OCR text output</h3>
            <p>{ocrResult}</p>
          </>
        ) : null}
      </div>
    </div>
  );
};

const VideoUploader = () => {
  const [videoFile, setVideoFile] = useState(null);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
  };

  const canvasRef = useRef(null);

  const playVideoOnCanvas = (video) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
  };

  useEffect(() => {
    if (videoFile) {
      // create a video element to play the video
      const video = document.createElement('video');

      video.src = URL.createObjectURL(videoFile);
      video.onloadedmetadata = () => {
        playVideoOnCanvas(video);
      };

      video.onplay = () => {
        const interval = setInterval(() => {
          playVideoOnCanvas(video);
        }, 1000);
        return () => clearInterval(interval);
      };

      video.play();

      return () => {
        video.pause();
        video.remove();
      };
    }
  }, [videoFile]);

  // when the video file changes, play the video on the canvas
  useEffect(() => {
    if (videoFile) {
    }
  }, [videoFile]);

  return (
    <div>
      <input type="file" onChange={handleVideoUpload} />
      <div>
        <h1>Video Frame</h1>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>OCR Demo</title>
        <meta name="description" content="OCR Demo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>OCR Demo</h1>
        <ImageUploader />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Product Science 💜
        </a>
      </footer>
    </div>
  );
}
