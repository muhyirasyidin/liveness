const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
const statusElement = document.getElementById('status');
const captureImage = document.getElementById('capture-image');

let apiTimer = null;

async function hitApi() {
	console.log('masuk ke hit api')
	// try {
	// 	const response = await fetch('https://example.com/api/liveness', { method: 'POST' });
	// 	if (response.ok) {
	// 		statusElement.textContent = 'Status: API Hit Successful!';
	// 	} else {
	// 		statusElement.textContent = 'Status: API Error!';
	// 	}
	// } catch (error) {
	// 	statusElement.textContent = `Status: ${error.message}`;
	// }
}

function onResults(results) {
	canvasCtx.save();
	canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
	canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

	if (results.detections.length > 0) {
		statusElement.textContent = 'Status: Face Detected';

		// Draw bounding box
		for (const detection of results.detections) {

			const boundingBox = detection.boundingBox;
			canvasCtx.beginPath();
			canvasCtx.rect(
				boundingBox.xCenter * canvasElement.width - boundingBox.width * canvasElement.width / 2,
				boundingBox.yCenter * canvasElement.height - boundingBox.height * canvasElement.height / 2,
				boundingBox.width * canvasElement.width,
				boundingBox.height * canvasElement.height
			);
			canvasCtx.lineWidth = 2;
			canvasCtx.strokeStyle = 'blue';
			canvasCtx.stroke();
		}

		if (!apiTimer) {
			apiTimer = setTimeout(() => {
				hitApi();
				console.log('results.image => ', results)
				captureImage.src = results.image
				apiTimer = null; // Reset the timer
			}, 5000); // Hit the API every 5 seconds if face is detected
		}
	} else {
		statusElement.textContent = 'Status: No Face Detected';
		clearTimeout(apiTimer);
		apiTimer = null;
	}

	canvasCtx.restore();
}

const faceDetection = new FaceDetection({
	locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
});
faceDetection.setOptions({
	model: 'short', // 'short' or 'full'
	minDetectionConfidence: 0.5,
});
faceDetection.onResults(onResults);

const camera = new Camera(videoElement, {
	onFrame: async () => {
		await faceDetection.send({ image: videoElement });
	},
	width: 640,
	height: 480,
});
camera.start();

videoElement.onloadedmetadata = () => {
	canvasElement.width = videoElement.videoWidth;
	canvasElement.height = videoElement.videoHeight;
};