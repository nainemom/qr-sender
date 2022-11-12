type DeviceKind = 'videoinput' | 'audioinput';

export const getUserDevices = (type: DeviceKind = 'videoinput') : Promise<MediaDeviceInfo[]> => navigator.mediaDevices.getUserMedia({
  audio: type === 'audioinput',
  video: type === 'videoinput',
}).then((stream) => {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
  return navigator.mediaDevices.enumerateDevices().then((allDevices) => {
    return allDevices.filter((device) => device.kind === type && device.deviceId);
  });
});

export const createUserStream = (kind: DeviceKind, device?: MediaDeviceInfo): Promise<MediaStream> => navigator.mediaDevices.getUserMedia(device ? {
  audio: kind === 'audioinput' ? {
    deviceId: device.deviceId,
  } : false,
  video: kind === 'videoinput' ? {
    deviceId: device.deviceId,
  } : false,
} : {
  audio: kind === 'audioinput',
  video: kind === 'videoinput',
});

export const captureVideo = (video: HTMLVideoElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = video.width || 640;
  canvas.height = video.height || 480;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('cannot getContext from canvas');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}