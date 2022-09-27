import { useRef, useState } from 'react';
import { useLoadOCR, useOCR } from '../hooks/tesseract.hook';

const ImageUploader = () => {
  const [imageFile, setImageFile] = useState(null);
  const [frameCounterImage, setFrameCounterImage] = useState();

  const { loading, worker } = useLoadOCR();
  const { isOcrLoading, ocrResult } = useOCR(worker, frameCounterImage);

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

  if (loading) {
    return <div>Loading...</div>;
  }

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
        {isOcrLoading ? (
          <div>loading...</div>
        ) : ocrResult ? (
          <>
            <h3>OCR text output</h3>
            <p>{ocrResult}</p>
          </>
        ) : null}
      </div>
    </div>
  );
};

function ProcessImage() {
  return (
    <div>
      <ImageUploader />
    </div>
  );
}

export default ProcessImage;
