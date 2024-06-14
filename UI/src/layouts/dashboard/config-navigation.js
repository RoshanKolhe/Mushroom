import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  cluster: icon('ic_cluster'),
  hut: icon('ic_hut'),
  faq: icon('ic_faq'),
  ticket: icon('ic-tickets'),
  salesData: icon('ic_salesData'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const { user } = useAuthContext();
  let data = [];

  if (user && user.permissions.includes('super_admin')) {
    data = [
      // OVERVIEW
      {
        subheader: t('Dashboard'),
        items: [
          // DASHBOARD
          {
            title: 'Dashboard',
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
          // USER
          {
            title: 'Manage Users',
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [
              { title: t('list'), path: paths.dashboard.user.list },
              { title: t('create'), path: paths.dashboard.user.new },
            ],
          },
          // CLUSTER
          {
            title: 'Manage Clusters',
            path: paths.dashboard.cluster.root,
            icon: ICONS.cluster,
            children: [
              { title: t('list'), path: paths.dashboard.cluster.list },
              { title: t('create'), path: paths.dashboard.cluster.new },
            ],
          },
          // HUT
          {
            title: 'Manage Huts',
            path: paths.dashboard.hut.root,
            icon: ICONS.hut,
            children: [
              { title: t('list'), path: paths.dashboard.hut.list },
              { title: t('create'), path: paths.dashboard.hut.new },
            ],
          },
          // FAQ
          {
            title: 'Manage FAQ’s',
            path: paths.dashboard.faq.root,
            icon: ICONS.faq,
            children: [
              { title: t('list'), path: paths.dashboard.faq.list },
              { title: t('create'), path: paths.dashboard.faq.new },
            ],
          },
          // TICKET
          {
            title: 'Manage Tickets',
            path: paths.dashboard.ticket.root,
            icon: ICONS.ticket,
            children: [
              { title: t('list'), path: paths.dashboard.ticket.list },
              // { title: t('create'), path: paths.dashboard.ticket.new },
            ],
          },
          // SALES DATA
          {
            title: 'Manage Sales Data',
            path: paths.dashboard.salesData.root,
            icon: ICONS.salesData,
            children: [
              { title: t('list'), path: paths.dashboard.salesData.list },
              { title: t('create'), path: paths.dashboard.salesData.new },
            ],
          },
          // New Notification
          {
            title: 'New Notification',
            path: paths.dashboard.sendNotification.new,
            icon: ICONS.salesData,
            children: [{ title: t('create'), path: paths.dashboard.sendNotification.new }],
          },
        ],
      },
    ];
  }

  if (user && user.permissions.includes('cluster_admin')) {
    data = [
      // OVERVIEW
      {
        subheader: t('Dashboard'),
        items: [
          // DASHBOARD
          {
            title: 'Dashboard',
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
          // USER
          {
            title: 'Manage Users',
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [
              { title: t('list'), path: paths.dashboard.user.list },
              // { title: t('create'), path: paths.dashboard.user.new },
            ],
          },
          // CLUSTER
          {
            title: 'Manage Clusters',
            path: paths.dashboard.cluster.root,
            icon: ICONS.cluster,
            children: [
              { title: t('list'), path: paths.dashboard.cluster.list },
              // { title: t('create'), path: paths.dashboard.cluster.new },
            ],
          },
          // HUT
          {
            title: 'Manage Huts',
            path: paths.dashboard.hut.root,
            icon: ICONS.hut,
            children: [
              { title: t('list'), path: paths.dashboard.hut.list },
              // { title: t('create'), path: paths.dashboard.hut.new },
            ],
          },
          // TICKET
          {
            title: 'Manage Tickets',
            path: paths.dashboard.ticket.root,
            icon: ICONS.ticket,
            children: [
              { title: t('list'), path: paths.dashboard.ticket.list },
              // { title: t('create'), path: paths.dashboard.ticket.new },
            ],
          },
        ],
      },
    ];
  }

  if (user && user.permissions.includes('group_admin')) {
    data = [
      // OVERVIEW
      {
        subheader: t('Dashboard'),
        items: [
          // DASHBOARD
          {
            title: 'Dashboard',
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
          // USER
          {
            title: 'Manage Users',
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [
              { title: t('list'), path: paths.dashboard.user.list },
              // { title: t('create'), path: paths.dashboard.user.new },
            ],
          },
          // CLUSTER
          {
            title: 'Manage Clusters',
            path: paths.dashboard.cluster.root,
            icon: ICONS.cluster,
            children: [
              { title: t('list'), path: paths.dashboard.cluster.list },
              // { title: t('create'), path: paths.dashboard.cluster.new },
            ],
          },
          // HUT
          {
            title: 'Manage Huts',
            path: paths.dashboard.hut.root,
            icon: ICONS.hut,
            children: [
              { title: t('list'), path: paths.dashboard.hut.list },
              // { title: t('create'), path: paths.dashboard.hut.new },
            ],
          },
          // TICKET
          {
            title: 'Manage Tickets',
            path: paths.dashboard.ticket.root,
            icon: ICONS.ticket,
            children: [
              { title: t('list'), path: paths.dashboard.ticket.list },
              // { title: t('create'), path: paths.dashboard.ticket.new },
            ],
          },
        ],
      },
    ];
  }

  return data;
}
