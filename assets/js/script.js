const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
const statusElement = document.getElementById('status');
const capturedFaceElement = document.getElementById('captured-face');

let apiTimer = null;
let image = null;
let boundingBox = null

async function captureFace(image, boundingBox) {
	// Create a temporary canvas to extract the face region
	const tempCanvas = document.createElement('canvas');
	const tempCtx = tempCanvas.getContext('2d');

	// Calculate the face region dimensions
	const faceX = (boundingBox.xCenter * canvasElement.width - boundingBox.width * canvasElement.width) - 50;
	const faceY = (boundingBox.yCenter * canvasElement.height - boundingBox.height * canvasElement.height);

	// Set canvas dimensions to the face size
	tempCanvas.width = 200;
	tempCanvas.height = 200;

	// Draw the face region onto the temporary canvas
	tempCtx.drawImage(
		image,
		faceX, faceY, 200, 200,
		0, 0, 200, 200
	);

	// Convert the extracted face to a data URL
	const faceDataUrl = tempCanvas.toDataURL('image/png');

	// Display the captured face
	capturedFaceElement.src = faceDataUrl;
	capturedFaceElement.style.display = 'block';
}

function onResults(results) {
	canvasCtx.save();
	canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
	canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

	if (results.detections.length > 0) {
		statusElement.textContent = 'Status: Face Detected';

		// Draw bounding boxes and capture the first face detected
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

		image = results.image
		boundingBox = results.detections[0].boundingBox

		// if (!apiTimer) {
		// 	apiTimer = setTimeout(() => {
		// 		captureFace(results.image, results.detections[0].boundingBox);
		// 		apiTimer = null;
		// 	}, 5000);
		// }
	} else {
		statusElement.textContent = 'Status: No Face Detected';
		capturedFaceElement.style.display = 'none';
		image = null
		boundingBox = null

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
	width: 200,
	height: 200,
});

function openCamera() {
	setTimeout(() => {
		console.log('from open camera')
		camera.start();
	}, 1000);
}

const handleLogin = () => {
	captureFace(image, boundingBox);
	console.log('from handle login');
}

// videoElement.onloadedmetadata = () => {
//   canvasElement.width = 1000;
//   canvasElement.height = 1000;
// };