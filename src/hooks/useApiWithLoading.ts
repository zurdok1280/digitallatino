import { useState } from 'react';

export function useApiWithLoading() {
  const [loading, setLoading] = useState(false);

  // callApi recibe una función async que hará la llamada a tu API
  const callApi = async <T>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  };

  return { loading, callApi };
}