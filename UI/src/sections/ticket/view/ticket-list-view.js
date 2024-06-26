/* eslint-disable import/no-extraneous-dependencies */
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import * as XLSX from 'xlsx';
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
import { _roles, _satus } from 'src/_mock';
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
import { useGetTickets, useGetTicketsWithFilter } from 'src/api/ticket';
import TicketTableRow from '../ticket-table-row';
import TicketTableToolbar from '../ticket-table-toolbar';
import TicketTableFiltersResult from '../ticket-table-filters-result';
import TicketQuickEditForm from '../ticket-quick-edit-form';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ticketId', label: 'Ticket ID', width: 180 },
  { id: 'user', label: 'User', width: 180 },
  { id: 'query', label: 'Query', width: 180 },
  { id: 'description', label: 'Ticket description', width: 180 },
  { id: 'status', label: 'Status', width: 180 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  status: [],
};

// ----------------------------------------------------------------------

export default function TicketListView({ isDashboard }) {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const { tickets, ticketsError, ticketsEmpty, refreshTickets } = useGetTicketsWithFilter(
    isDashboard ? 'filter={"where":{"status":"open"}}' : null
  );

  const [selectedRow, setSelectedRow] = useState(null); // <-- Add this state

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
      router.push(paths.dashboard.ticket.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleQuickEdit = useCallback((row) => {
    setSelectedRow(row); // <-- Set the selected row for quick edit
  }, []);

  const handleCloseQuickEdit = useCallback(() => {
    setSelectedRow(null); // <-- Clear the selected row
  }, []);

  const downlodCsvFromTableData = () => {
    const fileName = 'Cluster Management.xlsx';
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Coupon Master');
    XLSX.writeFile(wb, fileName);
  };

  useEffect(() => {
    if (tickets) {
      setTableData(tickets);
    }
  }, [tickets]);

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        style={isDashboard ? { padding: 0, maxWidth: 'initial' } : {}}
      >
        {!isDashboard ? (
          <CustomBreadcrumbs
            heading="Manage Tickets"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Manage Tickets', href: paths.dashboard.ticket.list },
              { name: 'List' },
            ]}
            action={
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
                onClick={downlodCsvFromTableData}
              >
                Download report
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />
        ) : null}

        <Card>
          <TicketTableToolbar
            filters={filters}
            onFilters={handleFilters}
            isDashboard={isDashboard}
            statusOptions={_satus}
          />

          {canReset && (
            <TicketTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
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
                      <TicketTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onRefreshTickets={refreshTickets}
                        onQuickEdit={handleQuickEdit} // <-- Pass the quick edit handler
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
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      {selectedRow && (
        <TicketQuickEditForm
          currentTicket={selectedRow}
          open={Boolean(selectedRow)}
          onClose={handleCloseQuickEdit}
          onRefreshTickets={refreshTickets}
        />
      )}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong>{table.selected.length}</strong> items?
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

TicketListView.propTypes = {
  isDashboard: PropTypes.any,
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status } = filters;
  const statusMapping = {
    open: 'Open',
    closed: 'Closed',
    rejected: 'Rejected',
  };
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (ticket) => ticket.ticketId.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status.length) {
    inputData = inputData.filter((user) =>
      status.map((s) => s.toLowerCase()).includes(user.status.toLowerCase())
    );
  }

  return inputData;
}
