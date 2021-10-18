import printful, { Error } from 'printful-js';
import { useContext, useEffect, useState } from 'react';

import { APIContext } from './context';

export type API = ReturnType<typeof printful>;

type Status = 'idle' | 'fetching' | 'success' | 'error';

type State<R> =
  | readonly [R, null, Status]
  | readonly [null, Error, Status]
  | readonly [null, null, Status];

const initialState: State<Record<string, never>> = [
  null,
  null,
  'idle' as const,
];

const success = <R extends { readonly code: number }>(
  res: R | Error
): res is R => {
  if (res.code >= 200 && res.code <= 300) {
    return true;
  } else {
    return false;
  }
};

export const useApi = <R extends { readonly code: number }>(
  func: (api: API) => Promise<R | Error>
) => {
  const api = useContext<API | null>(APIContext);
  const [state, setState] = useState<State<R>>(initialState);
  const [cancel, setCancel] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async (api: API) => {
      setState([null, null, 'fetching']);
      const response = await func(api);
      if (success(response)) {
        setState([response, null, 'success']);
      } else {
        setState([null, response as Error, 'error']);
      }
      if (cancel) return;
    };

    if (!api) {
      setState([
        null,
        {
          code: 444,
          result: 'No Api Context',
          error: { api: 'No Api Context provided' },
        },
        'error',
      ]);
    } else {
      fetchData(api);
    }

    return () => {
      setCancel(true);
    };
  }, []);

  return state;
};
