import { Helmet } from 'react-helmet-async';
// sections
import HutEditView from 'src/sections/hut/view/hut-edit-view';

// ----------------------------------------------------------------------

export default function HutEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Hut Edit</title>
      </Helmet>

      <HutEditView />
    </>
  );
}
