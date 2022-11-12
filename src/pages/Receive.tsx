import { useCallback, useState } from 'preact/hooks';
import { RouterProps } from 'preact-router';
import { QrData, QrScanner } from '@/components/Qr';


export default function Send(_props: RouterProps) {
  const [logs, setLogs] = useState<string[]>([]);

  const handleQrDetect = useCallback((data: QrData) => {
    setLogs((o) => [
      ...o,
      `Receive "${data.type}": ${data.index}/${data.length}${data.type === 'body' ? ` (${(data.content as ArrayBuffer).byteLength}b)` : ''}`,
    ]);
  }, []);

  return (
    <div>
      <section style={{ maxWidth: '400px' }}>
        <h2>Receive</h2>
        <QrScanner
          speed={100}
          onDetect={handleQrDetect}
        />
      </section>
      <ul>
        { logs.slice(logs.length - 3).map((log) => (
          <li key={log}>{log}</li>
        )) }
      </ul>
    </div>
  );
}