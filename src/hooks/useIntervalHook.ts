import { useEffect, useRef } from 'react';

function useIntervalHook(callback:() => void, delay:number) {
  const savedCallback = useRef<any>();

  useEffect(() => {
    if(savedCallback) {
      savedCallback.current = callback;
    }
  }, [callback]);

  useEffect(() => {
    let id = setInterval(() => {
      if (savedCallback && savedCallback.current ) {
        savedCallback.current();
      }
    }, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default useIntervalHook;