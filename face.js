const video = document.querySelector('.webcam');

const canvas = document.querySelector('.video');
const ctx = canvas.getContext('2d');

const faceCanvas = document.querySelector('.face');
const faceCtx = faceCanvas.getContext('2d');

const inputOptions = document.querySelectorAll('.controls input[type="range"]');

const faceDetector = new window.FaceDetector();
const options = {
	SIZE: 10,
	SCALE: 1.35,
};

function handleOption(event) {
	const { value, name } = event.currentTarget;
	options[name] = parseFloat(value);
}

inputOptions.forEach(option => option.addEventListener('input', handleOption));

// function for populate video
async function populateVideo() {
	const stream = await navigator.mediaDevices.getUserMedia({
		video: { width: 1080, height: 650 },
	});
	video.srcObject = stream;
	await video.play();
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	faceCanvas.width = video.videoWidth;
	faceCanvas.height = video.videoHeight;
}

async function detect() {
	const faces = await faceDetector.detect(video);
	//ask browser for the next animation frame is,and tell it to run detect for us
	faces.forEach(drawFace);
	faces.forEach(censor);
	requestAnimationFrame(detect);
}
populateVideo().then(detect);

function drawFace(face) {
	const { width, height, top, left } = face.boundingBox;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#ffc600';
	ctx.lineWidth = 2;
	ctx.strokeRect(left, top, width, height);
}

function censor({ boundingBox: face }) {
	faceCtx.imageSmoothingEnabled = false;
	faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
	//draw the small face
	faceCtx.drawImage(
		//5 src args
		video,
		face.x,
		face.y,
		face.width,
		face.height,
		//4 draw arg
		face.x,
		face.y,
		options.SIZE,
		options.SIZE
	);
	//DRAW the small face back on,but scale up
	const width = face.width * options.SCALE;
	const height = face.height * options.SCALE;
	faceCtx.drawImage(
		faceCanvas,
		face.x,
		face.y,
		options.SIZE,
		options.SIZE,
		//drawing args
		face.x - (width - face.width) / 2,
		face.y - (height - face.height) / 1.5,
		width,
		height
	);
}
