// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetFaqs() {
  const URL = endpoints.faq.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFaqs = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    faqs: data || [],
    faqsLoading: isLoading,
    faqsError: error,
    faqsValidating: isValidating,
    faqsEmpty: !isLoading && !data?.length,
    refreshFaqs, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetFaq(faqId) {
  const URL = faqId ? [endpoints.faq.details(faqId)] : null;
  console.log(URL);
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      faq: data,
      faqLoading: isLoading,
      faqError: error,
      faqValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
