// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetTickets() {
  const URL = endpoints.ticket.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshTickets = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    tickets: data || [],
    ticketsLoading: isLoading,
    ticketsError: error,
    ticketsValidating: isValidating,
    ticketsEmpty: !isLoading && !data?.length,
    refreshTickets, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetTicket(ticketId) {
  const URL = ticketId ? [endpoints.ticket.details(ticketId)] : null;
  console.log(URL);
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      ticket: data,
      ticketLoading: isLoading,
      ticketError: error,
      ticketValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetTicketsWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.ticket.filterList(filter);
  } else {
    URL = endpoints.ticket.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshTickets = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    tickets: data || [],
    ticketsError: error,
    ticketsValidating: isValidating,
    ticketsEmpty: !isLoading && !data?.length,
    refreshTickets,
  };
}
