import { Helmet } from 'react-helmet-async';
// sections
import NewNotificationCreateView from 'src/sections/newNotification/view/newNotification-create-view';

// ----------------------------------------------------------------------

export default function NewNotificationPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Send Notification</title>
      </Helmet>

      <NewNotificationCreateView />
    </>
  );
}
