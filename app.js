window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('outputCanvas');
  const ctx = canvas.getContext('2d');
  const beep = document.getElementById('beepSound');
  const tableSideSelect = document.getElementById('tableSide');
  const foulMessage = document.getElementById('foulMessage');

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

    // Rote Mittellinie
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.stroke();

    const tableSide = tableSideSelect.value;

    if (results.poseLandmarks) {
      const tolerance = 40;
      let foul = false;

      const elbows = [results.poseLandmarks[13], results.poseLandmarks[14]];

      for (const elbow of elbows) {
        if (!elbow || elbow.visibility < 0.7) continue;

        const elbowX = elbow.x * width;

        if (tableSide === "tischseite" && elbowX < centerX - tolerance) {
          foul = true;
        }

        if (tableSide === "spielerseite" && elbowX > centerX + tolerance) {
          foul = true;
        }
      }

      if (foul) {
        if (beep.paused) {
          beep.currentTime = 0;
          beep.play();
        }
        foulMessage.style.display = 'block';
        setTimeout(() => {
          foulMessage.style.display = 'none';
        }, 2000);
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
});



