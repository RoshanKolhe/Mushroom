import { Helmet } from 'react-helmet-async';
// sections
import CultivationCreateView from 'src/sections/Cultivation-Entries/view/cultivation-create-view';
// ----------------------------------------------------------------------

export default function CultivationCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Hut</title>
      </Helmet>

      <CultivationCreateView />
    </>
  );
}
