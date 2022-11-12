import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import jsQR from 'jsqr';
import { captureVideo, createUserStream, getUserDevices } from '@/utils/userMedia';
import useTimer from '@/utils/useTimer';

type QrScannerProps = {
  speed: number,
  onDetect: (data: string) => void,
};

export default function QrScanner({ speed, onDetect }: QrScannerProps) {
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
    const code = jsQR(image.data, image.width, image.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      console.log("Found QR code", code);
      onDetect(code.data);
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