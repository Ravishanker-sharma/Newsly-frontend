export function convertWebMToWav(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);

    reader.onloadend = () => {
      const audioContext = new AudioContext();

      audioContext.decodeAudioData(reader.result as ArrayBuffer)
        .then((audioBuffer) => {
          const numOfChan = audioBuffer.numberOfChannels;
          const length = audioBuffer.length * numOfChan * 2 + 44;
          const buffer = new ArrayBuffer(length);
          const view = new DataView(buffer);

          // Write WAV header
          // let offset     = 0;

          function writeString(view: DataView, offset: number, str: string) {
            for (let i = 0; i < str.length; i++) {
              view.setUint8(offset + i, str.charCodeAt(i));
            }
          }

          function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
            for (let i = 0; i < input.length; i++, offset += 2) {
              let s = Math.max(-1, Math.min(1, input[i]));
              s = s < 0 ? s * 0x8000 : s * 0x7FFF;
              output.setInt16(offset, s, true);
            }
          }

          writeString(view, 0, 'RIFF');
          view.setUint32(4, 36 + audioBuffer.length * numOfChan * 2, true);
          writeString(view, 8, 'WAVE');
          writeString(view, 12, 'fmt ');
          view.setUint32(16, 16, true); // PCM chunk size
          view.setUint16(20, 1, true); // PCM format
          view.setUint16(22, numOfChan, true);
          view.setUint32(24, audioBuffer.sampleRate, true);
          view.setUint32(28, audioBuffer.sampleRate * numOfChan * 2, true);
          view.setUint16(32, numOfChan * 2, true);
          view.setUint16(34, 16, true);
          writeString(view, 36, 'data');
          view.setUint32(40, audioBuffer.length * numOfChan * 2, true);

          // Interleave and write PCM
          let offsetData = 44;
          for (let i = 0; i < numOfChan; i++) {
            floatTo16BitPCM(view, offsetData, audioBuffer.getChannelData(i));
            offsetData += audioBuffer.length * 2;
          }

          const wavBlob = new Blob([view], { type: 'audio/wav' });
          resolve(wavBlob);
        })
        .catch(reject);
    };
  });
}
