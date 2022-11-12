import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { ab2str, str2ab } from '@/utils/convert';
import { createQrCode, scanQrCode } from '@/utils/qrCode';
import { captureVideo, createUserStream, getUserDevices } from '@/utils/userMedia';
import useTimer from '@/utils/useTimer';

type QrPlayerProps = {
  speed: number,
  sliceLength: number,
  content?: ArrayBuffer,
  started: boolean,
};

type QrScannerProps = {
  speed: number,
  onDetect: (data: QrData) => void,
};

type QrItemType = 'header' | 'body';

export type QrData = {
  type: QrItemType,
  index?: number,
  length: number,
  content?: string | ArrayBuffer,
  speed?: number,
};

type QrItem = {
  index: number,
  url: string,
};

export function QrPlayer({ speed, sliceLength, content, started }: QrPlayerProps) {
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
        content: ab2str(slice),
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

export function QrScanner({ speed, onDetect }: QrScannerProps) {
  const video = useRef<HTMLVideoElement>(null);

  // set Devices
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  useEffect(() => {
    getUserDevices('videoinput').then(setDevices);
  }, [setDevices]);

  const [selectedDevice, _setSelectedDevice] = useState<MediaDeviceInfo | null>(null);
  const setSelectedDevice = useCallback((event: Event) => {
    const deviceId = (event.target as HTMLSelectElement).value || null;
    const newDevice = devices.find((device) => device.deviceId === deviceId) || null;
    _setSelectedDevice(newDevice);
  }, [_setSelectedDevice, devices]);

  const takeShot = useCallback(() => {
    if (!video?.current || !selectedDevice) return;
    const image = captureVideo(video.current);
    if (!image) return;
    const data = scanQrCode(image);

    if (data) {
      try {
        let parsed = JSON.parse(data) as QrData;
        if (parsed.type === 'body') {
          if (!parsed.content) return;
          parsed = {
            ...parsed,
            content: str2ab(parsed.content as string),
          };
        }
        onDetect(parsed);
      } catch (_e) {}
    }
  }, [video, selectedDevice]);
  const [startShotTimer, stopShotTimer] = useTimer(takeShot, speed);

  const stopStream = useCallback(() => {
    stopShotTimer();
    if (!video.current) return;
    (video.current?.srcObject as MediaStream)?.getTracks()?.forEach?.((oldTrack) => {
      oldTrack.stop();
    });
  }, [video]);
  useEffect(() => {
    stopStream();
    if (!selectedDevice) return;
    createUserStream('videoinput', selectedDevice).then((stream) => {
      if (!video.current) return;
      video.current.srcObject = stream;
      video.current.playsInline = true;
      video.current.play();
      startShotTimer(Infinity);
    });
    return () => {
      stopStream();
    }
  }, [video, selectedDevice, stopStream]);

  return (
    <div style={{
      position: 'relative',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      width: '100%',
      boxSizing: 'border-box',
      paddingTop: '75%',
      height: 'auto',
    }}>
      <video
        ref={video}
        style={{
          position: 'absolute',
          top: 0,
          backgroundColor: '#000',
          width: '100%',
          height: 'auto',
        }}
      />
      <select
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          width: 'calc(100% - 16px)',
        }}
        onInput={setSelectedDevice}
      >
        <option>--Select Camera Device--</option>
        { devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
        )) }
      </select>
    </div>
  );
}