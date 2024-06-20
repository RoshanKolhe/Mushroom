import { Helmet } from 'react-helmet-async';
// sections
import { MushroomTypeListView } from 'src/sections/mushroomType/view';

// ----------------------------------------------------------------------

export default function MushroomTypeListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Mushroom Type List</title>
      </Helmet>

      <MushroomTypeListView />
    </>
  );
}
