import { Helmet } from 'react-helmet-async';
// sections
import MushroomTypeEditView from 'src/sections/mushroomType/view/mushroomType-edit-view';

// ----------------------------------------------------------------------

export default function MushroomTypeEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Mushroom Type Edit</title>
      </Helmet>

      <MushroomTypeEditView />
    </>
  );
}
