import { MutableRef, useCallback, useEffect, useRef, useState } from 'preact/hooks';
import * as qrCodeGenerator from 'qrcode-generator';
import qrCodeScanner from 'jsqr';
import { RouterProps } from 'preact-router';

import { ab2str } from '@/utils/convert';
import { Ref } from 'preact';
import { createUserStream, getUserDevices } from '@/utils/userMedia';
import QrScanner from '@/components/QrScanner';


export default function Send(_props: RouterProps) {
  const cameraRef = useRef<HTMLVideoElement>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const [cameraDevice, _setCameraDevice] = useState<MediaDeviceInfo | null>(null);
  const setCameraDevice = useCallback((event: Event) => {
    const deviceId = (event.target as HTMLSelectElement).value || null;
    const newDevice = devices.find((device) => device.deviceId === deviceId) || null;
    _setCameraDevice(newDevice);
  }, [_setCameraDevice, devices]);

  const stopStream = useCallback(() => {
    if (!cameraRef.current) return;
    (cameraRef.current?.srcObject as MediaStream)?.getTracks()?.forEach?.((oldTrack) => {
      oldTrack.stop();
    });
  }, [cameraRef]);

  useEffect(() => {
    stopStream();
    if (!cameraDevice) return;
    createUserStream('videoinput', cameraDevice).then((stream) => {
      if (!cameraRef.current) return;
      cameraRef.current.srcObject = stream;
      cameraRef.current.playsInline = true;
      cameraRef.current.play();
    });
    return () => {
      stopStream();
    }
  }, [cameraDevice, cameraRef, stopStream]);
  

  useEffect(() => {
    if (!cameraRef.current) return;
    getUserDevices('videoinput').then(setDevices);
  }, [cameraRef]);

  return (
    <div>
      <section>
        <h2>Receive</h2>
        {/* <select onInput={setCameraDevice}>
          <option>---</option>
          { devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
          )) }
        </select>
        <video ref={cameraRef} width="640" height="480" /> */}
        <QrScanner
          speed={100}
          onDetect={console.log}
        />
      </section>


    </div>
  );
}