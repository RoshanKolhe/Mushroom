// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetSalesDatas() {
  const URL = endpoints.salesData.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshSalesDatas = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    salesDatas: data || [],
    salesDatasLoading: isLoading,
    salesDatasError: error,
    salesDatasValidating: isValidating,
    salesDatasEmpty: !isLoading && !data?.length,
    refreshSalesDatas, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetSalesData(salesDataId) {
  const URL = salesDataId ? [endpoints.salesData.details(salesDataId)] : null;
  console.log(URL);
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      salesData: data,
      salesDataLoading: isLoading,
      salesDataError: error,
      salesDataValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
