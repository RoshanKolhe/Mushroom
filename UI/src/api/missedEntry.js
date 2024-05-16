// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetMissedEntries() {
  const URL = endpoints.missedEntry.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshHuts = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    missedEntries: data || [],
    missedEntriesLoading: isLoading,
    missedEntriesError: error,
    missedEntriesValidating: isValidating,
    missedEntriesEmpty: !isLoading && !data?.length,
    refreshHuts, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetHut(hutId) {
  const URL = hutId ? [endpoints.hut.details(hutId)] : null;
  console.log(URL);
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      hut: data,
      hutLoading: isLoading,
      hutError: error,
      hutValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
