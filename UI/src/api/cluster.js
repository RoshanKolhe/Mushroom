// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetClusters() {
  const URL = endpoints.cluster.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshClusters = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    clusters: data || [],
    clustersLoading: isLoading,
    clustersError: error,
    clustersValidating: isValidating,
    clustersEmpty: !isLoading && !data?.length,
    refreshClusters, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetCluster(clusterId) {
  const URL = clusterId ? [endpoints.cluster.details(clusterId)] : null;
  console.log(URL);
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      cluster: data,
      clusterLoading: isLoading,
      clusterError: error,
      clusterValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
