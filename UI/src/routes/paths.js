// utils
import { paramCase } from 'src/utils/change-case';
import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  page403: '/403',
  page404: '/404',
  page500: '/500',

  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/admin/login`,
      register: `${ROOTS.AUTH}/admin/register`,
      forgotPassword: `${ROOTS.AUTH}/admin/forgot-password`,
      newPassword: `${ROOTS.AUTH}/admin/new-password`,
    },
  },
  authDemo: {
    classic: {
      login: `${ROOTS.AUTH_DEMO}/classic/login`,
      register: `${ROOTS.AUTH_DEMO}/classic/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/classic/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/classic/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/classic/verify`,
    },
    modern: {
      login: `${ROOTS.AUTH_DEMO}/modern/login`,
      register: `${ROOTS.AUTH_DEMO}/modern/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/modern/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/modern/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/modern/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    profile: `${ROOTS.DASHBOARD}/profile`,
    user: {
      root: `${ROOTS.DASHBOARD}/user/list`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      // account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      view: (id) => `${ROOTS.DASHBOARD}/user/${id}/view`,
    },
    cluster: {
      root: `${ROOTS.DASHBOARD}/cluster/list`,
      list: `${ROOTS.DASHBOARD}/cluster/list`,
      new: `${ROOTS.DASHBOARD}/cluster/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/cluster/${id}/edit`,
    },
    hut: {
      root: `${ROOTS.DASHBOARD}/hut`,
      list: `${ROOTS.DASHBOARD}/hut/list`,
      new: `${ROOTS.DASHBOARD}/hut/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/hut/${id}/edit`,
    },
    faq: {
      root: `${ROOTS.DASHBOARD}/faq`,
      list: `${ROOTS.DASHBOARD}/faq/list`,
      new: `${ROOTS.DASHBOARD}/faq/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/faq/${id}/edit`,
    },
    ticket: {
      root: `${ROOTS.DASHBOARD}/ticket`,
      list: `${ROOTS.DASHBOARD}/ticket/list`,
      new: `${ROOTS.DASHBOARD}/ticket/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/ticket/${id}/edit`,
    },
    salesData: {
      root: `${ROOTS.DASHBOARD}/salesData`,
      list: `${ROOTS.DASHBOARD}/salesData/list`,
      new: `${ROOTS.DASHBOARD}/salesData/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/salesData/${id}/edit`,
    },
    mushroomType: {
      root: `${ROOTS.DASHBOARD}/mushroomType`,
      list: `${ROOTS.DASHBOARD}/mushroomType/list`,
      new: `${ROOTS.DASHBOARD}/mushroomType/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/mushroomType/${id}/edit`,
    },
    sendNotification: {
      new: `${ROOTS.DASHBOARD}/sendNotification`,
    },
  },
};
