import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

export default (callback: () => void, timout: number) => {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | undefined>();

  const stop = useCallback(() => {
    clearTimeout(timer);
  }, [timer]);

  const start = useCallback((repeatTimes: number = 1) => {
    stop();
    setTimer(setTimeout(async () => {
      if (typeof callback === 'function') {
        await callback();
      }
      if(repeatTimes > 0) {
        start(repeatTimes - 1);
      }
    }, timout));
  }, [timer, callback, timout]);

  useEffect(() => () => {
    stop();
  }, [stop]);

  return useMemo(() => [start, stop], [start, stop]);
};