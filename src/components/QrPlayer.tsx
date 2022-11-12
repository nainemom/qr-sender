import { ab2str } from "@/utils/convert";
import { createQrCode } from "@/utils/qrCode";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

type QrPlayerProps = {
  speed: number,
  sliceLength: number,
  content?: ArrayBuffer,
  started: boolean,
}

type QrItemType = 'header' | 'body';

type QrData = {
  type: QrItemType,
  index?: number,
  length: number,
  data?: string,
  speed?: number,
};

type QrItem = {
  index: number,
  url: string,
};

export default function QrPlayer({ speed, sliceLength, content, started }: QrPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const length = useMemo(() => Math.floor((content?.byteLength || 0) / sliceLength) + 1, [content, sliceLength]);

  const currentQrItem = useMemo<QrItem>(() => {
    if (currentIndex === 0 || !length) {
      return {
        index: currentIndex,
        url: createQrCode(JSON.stringify({
          type: 'header',
          index: currentIndex,
          length,
          speed,
        } as QrData)),
      };
    }
    const offset = (currentIndex - 1) * sliceLength;
    const slice = content?.slice?.(offset, offset + sliceLength);
    if (!slice) throw new Error('bad slice.');
    return {
      index: currentIndex,
      url: createQrCode(JSON.stringify({
        type: 'body',
        index: currentIndex,
        length,
        data: ab2str(slice),
      } as QrData)),
    };
  }, [content, length, sliceLength, speed, currentIndex]);

  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearInterval(timer);
    if (started) {
      setTimer(setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % length);
      }, speed));
    }
    return () => {
      clearInterval(timer);
    }
  }, [started, speed, length, currentIndex]);

  return (
    <div style={{
      border: 'solid 1px transparent',
      borderColor: started ? 'green' : 'black',
      width: '400px',
      height: '400px',
    }}>
      <img
        src={currentQrItem.url}
        alt="qr"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      <div> { currentQrItem.index + 1 } / { length } </div>
    </div>
  )
}