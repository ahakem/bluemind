'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CropIcon from '@mui/icons-material/Crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  onImageCropped: (blob: Blob) => void;
  aspectRatio?: number;
  circular?: boolean;
  label?: string;
  currentImage?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

async function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  circular: boolean = false
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  if (circular) {
    ctx.beginPath();
    ctx.arc(crop.width / 2, crop.height / 2, crop.width / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/webp',
      0.9
    );
  });
}

export default function ImageCropper({
  onImageCropped,
  aspectRatio = 1,
  circular = false,
  label = 'Upload Image',
  currentImage,
}: ImageCropperProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSrc(reader.result as string);
        setDialogOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    },
    [aspectRatio]
  );

  const handleCrop = async () => {
    if (!imgRef.current || !completedCrop) return;

    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop, circular);
      const previewUrl = URL.createObjectURL(croppedBlob);
      setPreviewUrl(previewUrl);
      onImageCropped(croppedBlob);
      setDialogOpen(false);
      setSrc(null);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSrc(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        style={{ display: 'none' }}
        id="image-upload-input"
      />
      
      <Box
        sx={{
          border: '2px dashed',
          borderColor: previewUrl ? 'primary.main' : 'grey.300',
          borderRadius: circular ? '50%' : 2,
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(0, 119, 190, 0.05)',
          },
          width: circular ? 150 : '100%',
          height: circular ? 150 : 150,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          mx: circular ? 'auto' : 0,
        }}
        onClick={() => inputRef.current?.click()}
      >
        {previewUrl ? (
          <Box
            component="img"
            src={previewUrl}
            alt="Preview"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: circular ? '50%' : 1,
            }}
          />
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </>
        )}
      </Box>

      {previewUrl && (
        <Button
          size="small"
          startIcon={<CropIcon />}
          onClick={() => inputRef.current?.click()}
          sx={{ mt: 1 }}
        >
          Change Image
        </Button>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Crop Image</DialogTitle>
        <DialogContent>
          {src && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                circularCrop={circular}
              >
                <img
                  ref={imgRef}
                  src={src}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{ maxHeight: '60vh', maxWidth: '100%' }}
                />
              </ReactCrop>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleCrop}
            variant="contained"
            disabled={processing || !completedCrop}
            startIcon={processing ? <CircularProgress size={20} /> : <CropIcon />}
          >
            {processing ? 'Processing...' : 'Crop & Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
