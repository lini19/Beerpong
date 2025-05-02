const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const beep = document.getElementById('beepSound');
const tableSideSelect = document.getElementById('tableSide');


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

  drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
    color: '#00FF00',
    lineWidth: 2,
  });
  drawLandmarks(ctx, results.poseLandmarks, {
    color: '#FF0000',
    lineWidth: 2,
  });
  

  // Rote Linie
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 4;
  ctx.stroke();
});

const tableSide = tableSideSelect.value;

if (
  results.poseLandmarks &&
  results.poseLandmarks[13]?.visibility > 0.7 &&
  results.poseLandmarks[14]?.visibility > 0.7
) {
  const leftElbowX = results.poseLandmarks[13].x * width;
  const rightElbowX = results.poseLandmarks[14].x * width;

  let foul = false;
  const tolerance = 40;

  if (tableSide === "right") {
    // Tisch ist rechts → rechter Ellbogen darf NICHT rechts raus
    if (rightElbowX > centerX + tolerance) foul = true;
  } else {
    // Tisch ist links → linker Ellbogen darf NICHT links raus
    if (leftElbowX < centerX - tolerance) foul = true;
  }

  if (foul && beep.paused) {
    beep.currentTime = 0;
    beep.play();
  }
}


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


