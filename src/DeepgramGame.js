import React, { useState } from "react";

function DeepgramGame() {
  const [word, setWord] = useState("SUN");
  const [feedback, setFeedback] = useState("Click mic to start!");
  const [result, setResult] = useState("");
  const [score, setScore] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Simple function to compute match score
  const computeAccuracy = (spoken, target) => {
    spoken = spoken.toUpperCase().trim();
    target = target.toUpperCase().trim();
    if (!spoken) return 0;
    if (spoken === target) return 100;
    let match = 0;
    const len = Math.min(spoken.length, target.length);
    for (let i = 0; i < len; i++) if (spoken[i] === target[i]) match++;
    return Math.round((match / target.length) * 100);
  };

  const handleMicClick = async () => {
    if (isRecording) return;
    setIsRecording(true);
    setFeedback("🎙️ Listening... say: " + word);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        setFeedback("Analyzing...");
        await sendToDeepgram(audioBlob);
        setIsRecording(false);
      };

      recorder.start();
      setTimeout(() => recorder.stop(), 2000);
    } catch (err) {
      console.error(err);
      setFeedback("Microphone not accessible.");
      setIsRecording(false);
    }
  };

  const sendToDeepgram = async (audioBlob) => {
    try {
      const response = await fetch("https://api.deepgram.com/v1/listen?model=general", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REACT_APP_DEEPGRAM_KEY}`,
        },
        body: audioBlob,
      });

      const data = await response.json();
      console.log("Deepgram response:", data);

      const spoken = data.results.channels[0].alternatives[0].transcript || "";
      const confidence = data.results.channels[0].alternatives[0].confidence || 0;

      setResult(spoken);

      const accuracy = computeAccuracy(spoken, word);
      const overall = Math.round((confidence * 50 + accuracy * 0.5));
      setScore(overall);

      if (overall > 85) setFeedback("🌟 Excellent pronunciation!");
      else if (overall > 60) setFeedback("Almost there! Try again!");
      else setFeedback("Let's practice this one more time!");
    } catch (error) {
      console.error("Deepgram error:", error);
      setFeedback("Error connecting to Deepgram API.");
    }
  };

  const nextWord = () => {
    const words = ["SUN", "CAT", "BALL", "FISH", "DOG"];
    const next = words[Math.floor(Math.random() * words.length)];
    setWord(next);
    setResult("");
    setScore(null);
    setFeedback("Say the new word!");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🗣️ Vocalis (Deepgram Version)</h1>
        <h2>Word: {word}</h2>

        <button onClick={handleMicClick} disabled={isRecording}>
          {isRecording ? "Listening..." : "🎤 Speak"}
        </button>

        {score !== null && (
          <p>
            You said: <b>{result}</b> <br />
            Score: {score}%
          </p>
        )}

        <p>{feedback}</p>

        <button onClick={nextWord}>Next Word ➡️</button>
      </header>
    </div>
  );
}

export default DeepgramGame;
