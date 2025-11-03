'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Modal from '../atoms/Modal';
import Button from '../atoms/Button';

const ImageCropModal = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error('Crop error:', error);
      alert('Gagal crop gambar');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sesuaikan Foto Profil">
      <div className="space-y-4">
        {/* Crop Area */}
        <div className="relative w-full h-80 bg-[#1a1a1a] rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            minZoom={1}
            maxZoom={3}
            zoomSpeed={0.5}
          />
        </div>

        {/* Instructions */}
        <div className="bg-[#1a1a1a] border border-[#b8a492]/20 rounded-lg p-3">
          <p className="text-xs text-[#b8a492]/80 font-mono text-center">
            💡 <strong>Tips:</strong> Geser foto untuk mengatur posisi, scroll mouse untuk zoom in/out
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            className="flex-1"
          >
            Simpan
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Helper function to crop image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = 512; // Max output size
  canvas.width = maxSize;
  canvas.height = maxSize;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    maxSize,
    maxSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
    }, 'image/jpeg', 0.9);
  });
}

export default ImageCropModal;
