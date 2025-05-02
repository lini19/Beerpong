const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
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
  const width = canvas.width = results.image.width;
  const height = canvas.height = results.image.height;
  const centerX = width / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(results.image, 0, 0, width, height);

  // Rote Linie
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 4;
  ctx.stroke();

  if (results.poseLandmarks &&
      results.poseLandmarks[13] &&
      results.poseLandmarks[14]) {
    
    const leftElbowX = results.poseLandmarks[13].x * width;
    const rightElbowX = results.poseLandmarks[14].x * width;

    if (leftElbowX > centerX || rightElbowX > centerX) {
      if (beep.paused) {
        beep.currentTime = 0;
        beep.play();
      }
    }
  }
});

navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    const camera = new Camera(video, {
      onFrame: async () => {
        await pose.send({ image: video });
      },
      width: 640,
      height: 480
    });

    camera.start();
  })
  .catch((err) => {
    alert("Kamera konnte nicht geöffnet werden: " + err.message);
    console.error(err);
  });


