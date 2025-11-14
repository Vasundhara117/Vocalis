// src/AudioVisualizer.js
import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ stream }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!stream) return;

    // 1. Setup Audio Context
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    
    analyser.fftSize = 2048; // Higher = more detailed wave
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // 2. Setup Canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let animationId;

    // 3. Animation Loop
    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Style the wave
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ff7b00'; // Vocalis Orange
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // Normalize data
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    // Cleanup when stopped
    return () => {
      cancelAnimationFrame(animationId);
      if (audioCtx.state !== 'closed') audioCtx.close();
    };
  }, [stream]);

  return <canvas ref={canvasRef} width={300} height={100} style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.5)' }} />;
};

export default AudioVisualizer;