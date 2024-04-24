import { Helmet } from 'react-helmet-async';
// sections
import { HutCreateView } from 'src/sections/hut/view';

// ----------------------------------------------------------------------

export default function HutCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Hut</title>
      </Helmet>

      <HutCreateView />
    </>
  );
}
