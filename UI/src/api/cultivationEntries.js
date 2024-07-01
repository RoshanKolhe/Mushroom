// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
// import { useMemo } from 'react';
// utils
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetCultivationEntries() {
  const URL = endpoints.cultivativationEntries.list;

  const { data, isLoading, error, isValidating, mutate } = axiosInstance.post(URL);

  const refreshCultivationEntries = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    cultivationEntries: data || [],
    cultivationEntriesLoading: isLoading,
    cultivationEntriesError: error,
    cultivationEntriesValidating: isValidating,
    cultivationEntriesEmpty: !isLoading && !data?.length,
    refreshCultivationEntries, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

// export function useGetCultivationEntries() {
//   const URL = [endpoints.cultivativationEntries.list];
//   console.log(URL);
//   const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

//   const memoizedValue = useMemo(
//     () => ({
//       hut: data,
//       hutLoading: isLoading,
//       hutError: error,
//       hutValidating: isValidating,
//     }),
//     [data, error, isLoading, isValidating]
//   );

//   return memoizedValue;
// }
