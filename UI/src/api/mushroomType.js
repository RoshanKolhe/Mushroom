// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetMushroomTypes() {
  const URL = endpoints.mushroomType.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshMushroomTypes = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    mushroomTypes: data || [],
    mushroomTypesLoading: isLoading,
    mushroomTypesError: error,
    mushroomTypesValidating: isValidating,
    mushroomTypesEmpty: !isLoading && !data?.length,
    refreshMushroomTypes, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetMushroomType(mushroomTypeId) {
  const URL = mushroomTypeId ? [endpoints.mushroomType.details(mushroomTypeId)] : null;
  console.log(URL);
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      mushroomType: data,
      mushroomTypeLoading: isLoading,
      mushroomTypeError: error,
      mushroomTypeValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
