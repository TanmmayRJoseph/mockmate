export async function transcribeAudio(buffer: Buffer) {
  try {
    const formData = new FormData();

    // ✅ Correct model id
    formData.append("model_id", "scribe_v1");

    // Attach the audio file
    formData.append(
      "file",
      new Blob([buffer], { type: "audio/mpeg" }),
      "audio.mp3"
    );

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Transcription failed: ${errText}`);
    }

    const data = await response.json();

    // ElevenLabs returns transcription under `text`
    return data.text as string;
  } catch (err) {
    console.error("Error in ElevenLabs transcription:", err);
    throw err;
  }
}
