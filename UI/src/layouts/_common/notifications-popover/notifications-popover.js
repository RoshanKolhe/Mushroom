import { m } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// _mock
import { _notifications } from 'src/_mock';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';
//
import { useGetNotifications } from 'src/api/user';
import axiosInstance from 'src/utils/axios';
import NotificationItem from './notification-item';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const drawer = useBoolean();

  const smUp = useResponsive('up', 'sm');

  const [currentTab, setCurrentTab] = useState('all');
  const [totalUnRead, setTotalUnRead] = useState(0);
  const {
    notifications: allNotifications,
    notificationsEmpty,
    refreshNotifications,
  } = useGetNotifications();

  console.log(allNotifications);

  const handleChangeTab = useCallback(
    (event, newValue) => {
      console.log(newValue);
      setCurrentTab(newValue);
      if (newValue === 'unread') {
        setNotifications(allNotifications.filter((item) => item.isRead === false));
      } else if (newValue === 'all') {
        setNotifications(allNotifications);
      }
    },
    [allNotifications]
  );

  const [notifications, setNotifications] = useState(allNotifications);

  const [tabs, setTabs] = useState([
    {
      value: 'all',
      label: 'All',
      count: 0,
    },
    {
      value: 'unread',
      label: 'Unread',
      count: 0,
    },
  ]);

  const handleMarkAllAsRead = async () => {
    const inputData = {
      isRead: true,
    };
    const response = await axiosInstance.patch('/notifications', inputData);
    refreshNotifications();
  };

  const notificationClick = async (notification) => {
    const inputData = {
      isRead: true,
    };
    const response = await axiosInstance.patch(`/notifications/${notification.id}`, inputData);
    refreshNotifications();
  };

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Notifications
      </Typography>

      {!!totalUnRead && (
        <Tooltip title="Mark all as read">
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      {!smUp && (
        <IconButton onClick={drawer.onFalse}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleChangeTab}>
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
              color={
                (tab.value === 'unread' && 'info') ||
                (tab.value === 'archived' && 'success') ||
                'default'
              }
            >
              {tab.count}
            </Label>
          }
          sx={{
            '&:not(:last-of-type)': {
              mr: 3,
            },
          }}
        />
      ))}
    </Tabs>
  );

  const renderList = (
    <Scrollbar>
      <List disablePadding>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            notificationClick={notificationClick}
          />
        ))}
      </List>
    </Scrollbar>
  );

  useEffect(() => {
    if (allNotifications && allNotifications.length) {
      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.value === 'all') {
            return { ...tab, count: allNotifications.length };
          }
          if (tab.value === 'unread') {
            return {
              ...tab,
              count: allNotifications.filter((item) => item.isRead === false).length,
            };
          }
          return tab;
        })
      );
      setNotifications(allNotifications)
      setTotalUnRead(allNotifications.filter((item) => item.isRead === false).length);
    }
  }, [allNotifications]);

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={drawer.value ? 'primary' : 'default'}
        onClick={drawer.onTrue}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 420 },
        }}
      >
        {renderHead}

        <Divider />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pl: 2.5, pr: 1 }}
        >
          {renderTabs}
          {/* <IconButton onClick={handleMarkAllAsRead}>
            <Iconify icon="solar:settings-bold-duotone" />
          </IconButton> */}
        </Stack>

        <Divider />

        {renderList}

        {/* <Box sx={{ p: 1 }}>
          <Button fullWidth size="large">
            View All
          </Button>
        </Box> */}
      </Drawer>
    </>
  );
}
