import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

import styles from '../styles/Home.module.css';

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
      let canvasInterval;

      // create a video element to play the video
      const video = document.createElement('video');

      video.src = URL.createObjectURL(videoFile);

      video.onloadedmetadata = () => {
        playVideoOnCanvas(video);
      };

      video.onpause = function () {
        clearInterval(canvasInterval);
      };

      video.onended = function () {
        clearInterval(canvasInterval);
      };

      video.requestVideoFrameCallback((time) => {
        console.log(time);
      });

      video.onplay = () => {
        clearInterval(canvasInterval);
        canvasInterval = window.setInterval(() => {
          playVideoOnCanvas(video);
        }, 1000 / 60);
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
