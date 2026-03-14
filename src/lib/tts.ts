import { TextToSpeechClient } from "@google-cloud/text-to-speech";

let ttsClient: TextToSpeechClient | null = null;

function getClient(): TextToSpeechClient {
  if (!ttsClient) {
    ttsClient = new TextToSpeechClient({
      apiKey: process.env.GOOGLE_CLOUD_TTS_API_KEY,
    });
  }
  return ttsClient;
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const client = getClient();

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode: "fr-FR",
      name: "fr-FR-Wavenet-A",
      ssmlGender: "FEMALE" as const,
    },
    audioConfig: {
      audioEncoding: "MP3" as const,
      speakingRate: 0.95,
      pitch: 0,
    },
  });

  return Buffer.from(response.audioContent as Uint8Array);
}
