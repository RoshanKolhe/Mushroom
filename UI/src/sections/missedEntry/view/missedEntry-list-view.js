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
import { useGetMissedEntries } from 'src/api/missedEntry';
import { useAuthContext } from 'src/auth/hooks';
import MissedEntryTableRow from '../missedEntry-table-row';
import MissedEntryTableToolbar from '../missedEntry-table-toolbar';
import MissedEntryTableFiltersResult from '../missedEntry-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Hut Name', width: 180 },
  { id: 'user', label: 'Hut User', width: 180 },
  { id: 'cluster', label: 'Cluster Name', width: 180 },
  { id: 'date', label: 'Date', width: 100 },
];

const defaultFilters = {
  name: '',
};

// ----------------------------------------------------------------------

export default function MissedEntryListView({ isDashboard }) {
  const table = useTable();

  const settings = useSettingsContext();

  const { user: userData } = useAuthContext();

  const isAdmin = userData ? userData.permissions.includes('super_admin') : false;

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const { missedEntries, missedEntriesLoading, missedEntriesEmpty, refreshMissedEntrys } =
    useGetMissedEntries();

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
      router.push(paths.dashboard.missedEntry.edit(id));
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
    const fileName = 'Cluster Management.xlsx';
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Coupon Master');
    XLSX.writeFile(wb, fileName);
  };

  useEffect(() => {
    if (missedEntries) {
      setTableData(missedEntries);
    }
  }, [missedEntries]);

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        style={isDashboard ? { padding: 0, maxWidth: 'initial' } : {}}
      >
        {!isDashboard ? (
          <CustomBreadcrumbs
            heading="Manage MissedEntrys"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Manage MissedEntrys', href: paths.dashboard.missedEntry.list },
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
                {isAdmin ? (
                  <Button
                    component={RouterLink}
                    href={paths.dashboard.missedEntry.new}
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    color="primary"
                    style={{ width: '155px', backgroundColor: '#00554E' }}
                  >
                    New MissedEntry
                  </Button>
                ) : null}
              </>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />
        ) : null}

        <Card>
          <MissedEntryTableToolbar
            filters={filters}
            onFilters={handleFilters}
            isDashboard={isDashboard}
          />

          {canReset && (
            <MissedEntryTableFiltersResult
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
                      <MissedEntryTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onRefreshMissedEntrys={() => refreshMissedEntrys()}
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

MissedEntryListView.propTypes = {
  isDashboard: PropTypes.any,
};
// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (missedEntry) => missedEntry.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  return inputData;
}
