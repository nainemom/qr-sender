import { useCallback, useState } from 'preact/hooks';
import { RouterProps } from 'preact-router';

import QrPlayer from '@/components/QrPlayer';

const SEND_SPEED = 1000 / 12;

export default function Send(_props: RouterProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedFileArrayBuffer, setSelectedFileArrayBuffer] = useState<ArrayBuffer | undefined>(undefined);
  
  const handleFileInput = useCallback((event: Event) => {
    event.preventDefault();
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) {
      setSelectedFileArrayBuffer(undefined);
      return undefined;
    }
    return file.arrayBuffer().then((arrayBuffer) => {
      setSelectedFileArrayBuffer(arrayBuffer);
      return arrayBuffer;
    });
  }, []);

  const handlePlayButtonClick = useCallback(() => {
    if (!selectedFileArrayBuffer) return;
    setIsPlaying((p) => !p);
  }, [selectedFileArrayBuffer]);

  return (
    <div>
      <section>
        <h2>Generate QR Code</h2>
        <input type="file" onInput={handleFileInput} />
        <button
          disabled={!selectedFileArrayBuffer || selectedFileArrayBuffer?.byteLength === 0}
          onClick={handlePlayButtonClick}
        >
          Send
        </button>
      </section>
      <QrPlayer content={selectedFileArrayBuffer} sliceLength={32} speed={SEND_SPEED} started={isPlaying}/>
    </div>
  );
}