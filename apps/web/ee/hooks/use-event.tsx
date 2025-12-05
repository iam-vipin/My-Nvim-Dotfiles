import { useCallback, useEffect, useRef } from "react";

function useEvent<T extends (...args: any[]) => any>(handler: T): T {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  // eslint-disable-next-line react-hooks/use-memo, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
  return useCallback(((...args) => handlerRef.current(...args)) as T, []);
}
export default useEvent;
