import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { Frames } from '../components/output';
import { useLoadOCR } from '../hooks/tesseract.hook';

import styles from '../styles/Home.module.css';

function useVideoOCR(
  worker,
  videoFile,
  canvasRef,
  frameCounterCanvasRef,
  videoRef
) {
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [vidFrames, setVidFrames] = useState(null);
  const [ocrPromises, setOcrPromises] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [isFrameCounterPresent, setIsFrameCounterPresent] = useState(false);

  useEffect(() => {
    if (
      videoFile &&
      canvasRef?.current &&
      videoRef?.current &&
      frameCounterCanvasRef?.current
    ) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      video.width = 640;
      video.height = 480;
      video.src = URL.createObjectURL(videoFile);

      video.onended = () => {
        setIsVideoLoading(false);
        setIsDone(true);
        setIsFrameCounterPresent(false);
      };

      const updateCanvas = (timestamp, meta) => {
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
        const imageData = ctx.getImageData(20, canvas.height - 30, 75, 33);

        // convert imageData to an image
        const ocrCanvas = document.createElement('canvas');
        ocrCanvas.width = imageData.width;
        ocrCanvas.height = imageData.height;
        const ocrCtx = ocrCanvas.getContext('2d');
        ocrCtx.putImageData(imageData, 0, 0);
        const ocrDataUrl = ocrCanvas.toDataURL('image/jpeg', 1.0);

        const zoomedInimageData = ctx.getImageData(
          0,
          canvas.height - 35,
          100,
          37
        );

        // get the data url of the imageData image
        // const zoomedInCanvas = document.createElement('canvas');
        // zoomedInCanvas.width = zoomedInimageData.width;
        // zoomedInCanvas.height = zoomedInimageData.height;
        // const zoomedInCtx = zoomedInCanvas.getContext('2d');
        // zoomedInCtx.putImageData(zoomedInimageData, 0, 0);
        // const zoomedInDataUrl = zoomedInCanvas.toDataURL('image/jpeg', 1.0);

        function getAverageColor(imageData) {
          for (var i = 0, len = imageData.data.length, sum = 0; i < len; i += 4)
            sum += imageData.data[i];
          return sum / (len / 4);
        }

        if (getAverageColor(imageData) < 230) {
          setIsFrameCounterPresent(true);
        } else {
          setIsFrameCounterPresent(false);
        }

        // get the bottom left 100 x 45 pixels
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
        });

        setOcrPromises((ocrPromises) => [
          ...ocrPromises,
          {
            timestamp,
            fullImage: dataUrl,
            frameCounterImage: ocrDataUrl,
          },
        ]);

        const newFrames = {
          ...frames,
          [timestamp]: ocrDataUrl,
        };

        setVidFrames(newFrames);
        video.requestVideoFrameCallback(updateCanvas);
      };

      video.onloadedmetadata = () => {
        setIsVideoLoading(true);
        video.play();
        updateCanvas();
      };
    }
  }, [videoFile, canvasRef, frameCounterCanvasRef]);

  return {
    isVideoLoading,
    worker,
    vidFrames,
    ocrPromises,
    isDone,
    isFrameCounterPresent,
  };
}

async function resolvePromises(promises, worker, setIsOCRProcessing) {
  for (let i = 0; i < promises.length; i++) {
    await worker.recognize(promises[i].frameCounterImage).then(({ data }) => {
      promises[i] = {
        ...promises[i],
        text: data.text,
      };
    });
  }

  return promises;
}

const VideoUploader = () => {
  const canvasRef = useRef(null);
  const frameCounterCanvasRef = useRef(null);
  const videoRef = useRef(null);
  const { worker } = useLoadOCR();
  const [videoFile, setVideoFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);

  const {
    isVideoLoading,
    vidFrames,
    ocrPromises,
    isDone,
    isFrameCounterPresent,
  } = useVideoOCR(
    worker,
    videoFile,
    canvasRef,
    frameCounterCanvasRef,
    videoRef
  );

  if (isDone) {
    if (!isOCRProcessing) {
      resolvePromises(ocrPromises, worker, setIsOCRProcessing).then(
        (promises) => {
          setOutput(promises);
        }
      );
    }
  }

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
  };

  return (
    <div>
      <input type="file" onChange={handleVideoUpload} />
      <div>
        <h1>Video Frame</h1>
        {!videoFile && <p>Upload a video to see the frames</p>}
        <h1>{isVideoLoading ? 'processing...' : null}</h1>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <video ref={videoRef} />
        <div>
          {isFrameCounterPresent ? (
            <p> counter is present</p>
          ) : (
            <p> counter is not present</p>
          )}
          <canvas ref={frameCounterCanvasRef} />
        </div>

        {isVideoLoading ? null : (
          <Frames vidFrames={output} isOCRProcessing={isOCRProcessing} />
        )}
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
        <VideoUploader />
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
