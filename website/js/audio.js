// ==========================================
// SILENT CO-DRIVER - AUDIO ENGINE
// ==========================================

let audioContext = null;
let analyser = null;
let microphone = null;
let mediaStream = null;
let animationFrame = null;
let liveAudioRunning = false;

const pulseCanvas = document.getElementById("pulseCanvas");

function setupCanvas() {
    if (!pulseCanvas) return;

    const rect = pulseCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    pulseCanvas.width = rect.width * dpr;
    pulseCanvas.height = 120 * dpr;

    const ctx = pulseCanvas.getContext("2d");
    ctx.scale(dpr, dpr);

    return {
        ctx,
        width: rect.width,
        height: 120
    };
}

function drawIdlePulse() {
    const canvas = setupCanvas();
    if (!canvas) return;

    const { ctx, width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "#303640";
    ctx.lineWidth = 1;

    ctx.beginPath();

    for (let x = 0; x < width; x++) {
        const y =
            height / 2 +
            Math.sin(x * 0.035) * 3 +
            Math.sin(x * 0.09) * 2;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();
}

async function startLiveAudio() {

    if (liveAudioRunning) return;

    try {

        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        audioContext = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

        analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.75;

        microphone =
            audioContext.createMediaStreamSource(mediaStream);

        microphone.connect(analyser);

        liveAudioRunning = true;

        drawLiveWave();

        console.log("LIVE AUDIO STARTED");

    } catch (error) {

        console.error("Microphone error:", error);

        alert(
            "Microphone access was blocked.\n\n" +
            "Please allow microphone permission in your browser."
        );
    }
}

function stopLiveAudio() {

    liveAudioRunning = false;

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }

    if (audioContext) {
        audioContext.close();
    }

    audioContext = null;
    analyser = null;

    drawIdlePulse();

    console.log("LIVE AUDIO STOPPED");
}

function drawLiveWave() {

    if (!liveAudioRunning || !analyser) return;

    const canvas = setupCanvas();
    if (!canvas) return;

    const { ctx, width, height } = canvas;

    const bufferLength = analyser.frequencyBinCount;

    const dataArray =
        new Uint8Array(bufferLength);

    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "#1d232b";
    ctx.lineWidth = 1;

    for (let y = 20; y < height; y += 25) {

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Wave
    ctx.beginPath();

    ctx.strokeStyle = "#e10600";
    ctx.lineWidth = 2;

    const sliceWidth =
        width / bufferLength;

    let x = 0;

    for (let i = 0; i < bufferLength; i++) {

        const value =
            dataArray[i] / 128.0;

        const y =
            value * height / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.stroke();

    animationFrame =
        requestAnimationFrame(drawLiveWave);
}

function getAudioLevel() {

    if (!analyser) return 0;

    const bufferLength =
        analyser.frequencyBinCount;

    const data =
        new Uint8Array(bufferLength);

    analyser.getByteTimeDomainData(data);

    let sum = 0;

    for (let i = 0; i < bufferLength; i++) {

        const value =
            (data[i] - 128) / 128;

        sum += value * value;
    }

    const rms =
        Math.sqrt(sum / bufferLength);

    return Math.min(
        100,
        Math.round(rms * 500)
    );
}

window.startLiveAudio = startLiveAudio;
window.stopLiveAudio = stopLiveAudio;
window.getAudioLevel = getAudioLevel;

drawIdlePulse();