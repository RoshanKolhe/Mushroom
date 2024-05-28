// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetMessages(id) {
  const URL = endpoints.messages.list(id);

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshMessages = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    messages: data || [],
    messagesLoading: isLoading,
    messagesError: error,
    messagesValidating: isValidating,
    messagesEmpty: !isLoading && !data?.length,
    refreshMessages, // Include the refresh function separately
  };
}

// ------------------------------------------------------------------
