import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './ImageDropzone.module.css';

const ImageDropzone = ({ onDrop, thumbnail }) => {
  const onDropCallback = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      onDrop(event.target.result);
    };
    reader.readAsDataURL(file);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: 'image/*',
    multiple: false,
  });

  return (
    <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}>
      <input {...getInputProps()} />
      {thumbnail ? (
        <div className={styles.thumbnailPreview}>
          <img src={thumbnail} alt="Thumbnail Preview" />
        </div>
      ) : (
        <div className={styles.dropzoneContent}>
          <p>Drag & drop an image here, or click to select one</p>
          <small>1200x480 recommended</small>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
