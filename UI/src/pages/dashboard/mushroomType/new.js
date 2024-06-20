import { Helmet } from 'react-helmet-async';
// sections
import { MushroomTypeCreateView } from 'src/sections/mushroomType/view';

// ----------------------------------------------------------------------

export default function MushroomTypeCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Mushroom Type</title>
      </Helmet>

      <MushroomTypeCreateView />
    </>
  );
}
