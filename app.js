const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

const removeBgBtn = document.getElementById('removeBgBtn');
const applyGrayscale = document.getElementById('applyGrayscale');
const applySepia = document.getElementById('applySepia');
const cropImage = document.getElementById('cropImage');
const saveImage = document.getElementById('saveImage');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');

let img = new Image();
let cropping = false;
let startX, startY, width, height;

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const imgURL = URL.createObjectURL(file);
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = imgURL;
  }
});

removeBgBtn.addEventListener('click', async () => {
  const imageData = canvas.toDataURL('image/png');
  try {
    const result = await removeBackground(imageData);
    const newImg = await createImageBitmap(result);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(newImg, 0, 0);
  } catch (error) {
    alert('Error removing background: ' + error.message);
  }
});

applyGrayscale.addEventListener('click', () => {
  applyFilter('grayscale(100%)');
});

applySepia.addEventListener('click', () => {
  applyFilter('sepia(100%)');
});

brightnessSlider.addEventListener('input', adjustImage);
contrastSlider.addEventListener('input', adjustImage);

function adjustImage() {
  const brightness = brightnessSlider.value;
  const contrast = contrastSlider.value;
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
  ctx.drawImage(img, 0, 0);
}

let cropStartX, cropStartY;

cropImage.addEventListener('click', () => {
  cropping = !cropping;
  if (cropping) {
    canvas.addEventListener('mousedown', startCropping);
    canvas.addEventListener('mousemove', drawCropBox);
    canvas.addEventListener('mouseup', endCropping);
  } else {
    canvas.removeEventListener('mousedown', startCropping);
    canvas.removeEventListener('mousemove', drawCropBox);
    canvas.removeEventListener('mouseup', endCropping);
  }
});

function startCropping(e) {
  cropStartX = e.offsetX;
  cropStartY = e.offsetY;
}

function drawCropBox(e) {
  if (!cropping) return;
  const cropWidth = e.offsetX - cropStartX;
  const cropHeight = e.offsetY - cropStartY;

  // Ensuring the cropping box is within the canvas bounds
  const maxWidth = canvas.width - cropStartX;
  const maxHeight = canvas.height - cropStartY;

  const cropBoxWidth = Math.min(cropWidth, maxWidth);
  const cropBoxHeight = Math.min(cropHeight, maxHeight);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  ctx.strokeStyle = 'red';
  ctx.strokeRect(cropStartX, cropStartY, cropBoxWidth, cropBoxHeight);
}

function endCropping(e) {
  cropping = false;
  width = e.offsetX - cropStartX;
  height = e.offsetY - cropStartY;

  // Ensuring the crop box is within the canvas bounds
  const maxWidth = canvas.width - cropStartX;
  const maxHeight = canvas.height - cropStartY;

  width = Math.min(width, maxWidth);
  height = Math.min(height, maxHeight);

  const croppedImageData = ctx.getImageData(cropStartX, cropStartY, width, height);
  canvas.width = width;
  canvas.height = height;
  ctx.putImageData(croppedImageData, 0, 0);
}

saveImage.addEventListener('click', () => {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'edited_image.png';
  link.click();
});

function applyFilter(filter) {
  ctx.filter = filter;
  ctx.drawImage(img, 0, 0);
}

async function removeBackground(imageData) {
  const formData = new FormData();
  formData.append('image_file', imageData);
  formData.append('size', 'auto');

  try {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': 'tqvhn3E7EwDZNxZsKMGUSo53',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Background removal failed');
    }
    const result = await response.blob();
    return result;
  } catch (error) {
    throw new Error('Error during background removal: ' + error.message);
  }
}
