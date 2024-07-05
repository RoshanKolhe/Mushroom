/* eslint-disable import/no-extraneous-dependencies */
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import * as XLSX from 'xlsx';

import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// _mock
import { _roles } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
//
import { useGetCultivationEntries } from 'src/api/cultivationEntries';
import { useAuthContext } from 'src/auth/hooks';
import axiosInstance, { endpoints } from 'src/utils/axios';
import CultivationEntryTableRow from '../cultivation-entries-row';
import CultivationEntryTableToolbar from '../cultivation-entries-toolbar';
import CultivationEntryTableFiltersResult from '../cultivation-entry-filter-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'mashroomType', label: 'Mashroom Type' },
  { id: 'hutName', label: 'Hut Name', width: 180 },
  { id: 'quantity', label: 'Quantity', width: 180 },
  { id: 'moisture', label: 'Moisture', width: 100 },
  { id: 'temprature', label: 'Temprature', width: 100 },
  { id: 'changedColor', label: 'Changed Color', width: 100 },
  { id: 'longitude', label: 'Longitude', width: 100 },
  { id: 'latitude', label: 'Latitude', width: 100 },
  { id: 'date', label: 'Date', width: 100 },
  { id: 'time', label: 'Time', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  hutId : -1,
};

// ----------------------------------------------------------------------

export default function CultivationEntriesListView({ isDashboard }) {
  const table = useTable();

  const settings = useSettingsContext();

  const { user: userData } = useAuthContext();

  const isAdmin = userData ? userData.permissions.includes('super_admin') : false;

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const { cultivationEntries, refreshCultivationEntries } = useGetCultivationEntries();

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.hut.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      console.log(newValue);
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const downlodCsvFromTableData = () => {
    const fileName = 'Cultivation Entries.xlsx';
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Coupon Master');
    XLSX.writeFile(wb, fileName);
  };

  const fetchCultivationEntries = async () => {
    const URL = endpoints.cultivativationEntries.list;
    try{
        const response = await axiosInstance.post(URL);
        setTableData(response?.data);
        console.log('data',tableData)
    }catch(error){
        console.error(error);
    }
  }

  useEffect(() => {
    fetchCultivationEntries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  console.log('tableData',tableData);

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        style={isDashboard ? { padding: 0, maxWidth: 'initial' } : {}}
      >
        {!isDashboard ? (
          <CustomBreadcrumbs
            heading="Manage Cultivation Entries"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Manage Cultivation Entries', href: paths.dashboard.hut.list },
              { name: 'List' },
            ]}
            action={
              <>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="carbon:download" />}
                  color="primary"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#212B36',
                    border: 'solid 1px #00554E',
                    marginRight: '20px',
                  }}
                  onClick={() => {
                    downlodCsvFromTableData();
                  }}
                >
                  Download report
                </Button>
                {/* {isAdmin ? (
                  <Button
                    component={RouterLink}
                    href={paths.dashboard.hut.new}
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    color="primary"
                    style={{ width: '155px', backgroundColor: '#00554E' }}
                  >
                    New Hut
                  </Button>
                ) : null} */}
              </>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />
        ) : null}

        <Card>
          <CultivationEntryTableToolbar filters={filters} onFilters={handleFilters} isDashboard={isDashboard} />

          {canReset && (
            <CultivationEntryTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                  showCheckbox={false}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <CultivationEntryTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onRefreshHuts={() => refreshCultivationEntries()}
                        isAdmin={isAdmin}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

CultivationEntriesListView.propTypes = {
  isDashboard: PropTypes.any,
};
// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, hutId } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (cultivationEntry) => cultivationEntry.hut.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (hutId && hutId !== -1) {
    inputData = inputData.filter((cultivationEntries) => {
      console.log(hutId)
      return hutId === cultivationEntries.hut.id;
    });
  }

  if(hutId === -1){
    return inputData
  }
  return inputData;
}
