const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const canvasContext = canvas.getContext('2d');

const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 64; // Set FFT size to 64 for 32 frequency bars (fftSize / 2)

const source = audioContext.createMediaStreamSource(stream);
source.connect(analyser);

const bufferLength = analyser.frequencyBinCount; // Half of fftSize
const dataArray = new Uint8Array(bufferLength);

function draw() {

    if (canvasContext === null) {
        alert('Canvas context not found. Please check your browser settings.');
        throw new Error('Canvas context not found');
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    analyser.getByteFrequencyData(dataArray);

    const isSilent = dataArray.every(value => value === 0);

    if (isSilent) {
        canvasContext.fillStyle = 'white';
        canvasContext.font = '48px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        canvasContext.fillText('Microphone is fully silent', canvas.width / 2, canvas.height / 2);
    } else {
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = 'white';
        canvasContext.font = '48px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        canvasContext.fillText('Microphone is active', canvas.width / 2, canvas.height / 2);
        canvasContext.fillStyle = 'red';
    }

    const barWidth = canvas.width / bufferLength;
    let barHeight: number;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        canvasContext.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
        canvasContext.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth;
    }

    requestAnimationFrame(draw);
}

draw();