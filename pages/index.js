import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

import styles from '../styles/Home.module.css';

const ImageUploader = () => {
  // react state for image file
  const [imageFile, setImageFile] = useState(null);

  const handleImageUpload = (e) => {
    // get the image file from the event
    const file = e.target.files[0];
    // set the image file to the state
    setImageFile(file);
  };

  // canvas ref
  const canvasRef = useRef(null);
  const frameCounterCanvasRef = useRef(null);

  // draw the image to the canvas
  const drawImage = (image) => {
    // get the canvas context
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // set the canvas width and height to the image width and height
    canvas.width = image.width;
    canvas.height = image.height;
    // draw the image to the canvas
    ctx.drawImage(image, 0, 0);
  };

  // when the image file changes, draw the full image to the main canvas
  useEffect(() => {
    if (imageFile) {
      // create an image object
      const image = new Image();
      // set the image src to the image file
      image.src = URL.createObjectURL(imageFile);
      // when the image loads, draw the image to the canvas
      image.onload = () => {
        drawImage(image);
      };
    }
  }, [imageFile]);

  // when the image file changes, draw the bottom left 100 x 45 pixels to the frame counter canvas
  useEffect(() => {
    if (imageFile) {
      // create an image object
      const image = new Image();
      // set the image src to the image file
      image.src = URL.createObjectURL(imageFile);
      // when the image loads, draw the image to the canvas
      image.onload = () => {
        // get the bottom left 100 x 45 pixels
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, canvas.height - 45, 100, 45);
        console.log(imageData);
        // create a canvas to draw the bottom left 100 x 45 pixels
        const frameCounterImage = frameCounterCanvasRef.current;
        frameCounterImage.width = 100;
        frameCounterImage.height = 45;
        const ctx2 = frameCounterImage.getContext('2d');
        ctx2.putImageData(imageData, 0, 0);
      };
    }
  }, [imageFile]);

  return (
    <div>
      <input type="file" onChange={handleImageUpload} />
      <div>
        <h1>Image</h1>
        <canvas ref={canvasRef} />
      </div>
      <div>
        <h1>Frame Counter</h1>
        <canvas ref={frameCounterCanvasRef} />
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to OCR Demo</h1>
        <ImageUploader />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <img src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
