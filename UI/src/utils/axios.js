import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/me',
    login: '/verify-otp-login',
    loginWithMail: '/login',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  user: {
    list: '/api/users/list',
    notifications: '/notifications',
    filterList: (filter) => `/api/users/list?${filter}`,
    details: (id) => `/api/users/${id}`,
    search: '/api/user/search',
    getDashboradCounts: '/getDashboardCounts',
  },
  cluster: {
    list: '/clusters',
    details: (id) => `/clusters/${id}`,
  },
  hut: {
    list: '/huts',
    details: (id) => `/huts/${id}`,
  },
  messages: {
    list: (id) => `/tickets/${id}/messages`,
  },
  missedEntry: {
    list: '/missing-entries',
  },
  faq: {
    list: '/faqs',
    details: (id) => `/faqs/${id}`,
  },
  salesData: {
    list: '/sales-data',
    details: (id) => `/sales-data/${id}`,
  },
  mushroomType: {
    list: '/mushroom-types',
    details: (id) => `/mushroom-types/${id}`,
  },
  ticket: {
    list: '/tickets-with-filter',
    details: (id) => `/tickets/${id}`,
    filterList: (filter) => `/tickets-with-filter?${filter}`,
  },
};
