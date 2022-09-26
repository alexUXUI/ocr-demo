import styles from '../styles/Home.module.css';
import React, { useEffect, useRef, useState } from 'react';

export const VideoUploader = () => {
  const inputRef = useRef(null);
  const [text, setText] = useState('upload');

  const uploadVideo = (files) => {
    // const formData = new FormData();
    // if (files && files.length > 0) {
    //   formData.append('file', files[0]);
    // }
  };

  const isVideo = (filename) => {
    return ['m4v', 'avi', 'mp4', 'mov', 'mpg', 'mpeg'].includes(
      filename.toLowerCase()
    );
  };

  const handleChange = (event) => {
    console.log('file YOOOOO');
    setText('uploading...');
    console.log(event.target.files[0]);
    uploadVideo(event.target.files[0].type);
    setText('upload');
  };

  const handleDrop = (event) => {
    if (event.dataTransfer.files.length > 0) {
      if (event.dataTransfer.files.length > 1) {
        setText('NOT_ONE_FILE');
      } else {
        if (isVideo(event.target.files[0].type)) {
          uploadVideo(event.target.files[0]);
        } else {
          setText('FILE_NOT_A_VIDEO');
        }
      }
    }
  };

  const getText = () => {
    if (text === 'FILE_NOT_A_VIDEO') {
      return 'annotations.videoUploader.notVideo';
    }
    if (text === 'NOT_ONE_FILE') {
      return 'annotations.videoUploader.errorOneFile';
    }
    return 'annotations.videoUploader.dropHere';
  };

  return (
    <div
      className={styles.dropZone}
      //   onClick={handleClick}
      //   onDragEnter={handleDragEnter}
      //   onDragLeave={handleDragLeave}
      //   onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div>{getText()}</div>
      <input
        ref={inputRef}
        type="file"
        name="videoFile"
        onChange={handleChange}
      />
    </div>
  );
};
