const videoElement = document.getElementById('videoInput');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');
const beep = document.getElementById('beepSound');

const pose = new Pose({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`,
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

pose.onResults((results) => {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  const centerX = canvasElement.width / 2;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.beginPath();
  canvasCtx.moveTo(centerX, 0);
  canvasCtx.lineTo(centerX, canvasElement.height);
  canvasCtx.strokeStyle = 'red';
  canvasCtx.lineWidth = 3;
  canvasCtx.stroke();

  if (results.poseLandmarks) {
    const leftElbow = results.poseLandmarks[13];
    const rightElbow = results.poseLandmarks[14];

    const leftX = leftElbow.x * canvasElement.width;
    const rightX = rightElbow.x * canvasElement.width;

    if (leftX > centerX || rightX > centerX) {
      if (beep.paused) {
        beep.currentTime = 0;
        beep.play();
      }
    }
  }

  canvasCtx.restore();
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});

camera.start();

camera.start();


