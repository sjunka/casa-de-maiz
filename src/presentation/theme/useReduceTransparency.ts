import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export const useReduceTransparency = (): boolean => {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AccessibilityInfo.isReduceTransparencyEnabled().then(enabled => {
      if (!cancelled) {
        setReduceTransparency(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  return reduceTransparency;
};
