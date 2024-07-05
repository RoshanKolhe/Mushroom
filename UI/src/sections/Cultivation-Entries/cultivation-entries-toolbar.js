import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Button, Grid, Typography } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useGetClusters } from 'src/api/cluster';
import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function CultivationEntryTableToolbar({ isDashboard, filters, onFilters }) {
  const popover = usePopover();
  const [huts, setHuts] = useState([{ id: 'all', name: 'All Huts' }]);
  const [clusters, setClusters] = useState([{ id: 'all', name: 'All Clusters' }]);

  const initialFilterData = useMemo(
    () => ({
      cluster: 'all',
      hut: 'all',
    }),
    []
  );

  const [filterData, setFilterData] = useState(initialFilterData);

  const { clusters: clustersData, clustersLoading } = useGetClusters();

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleChange = (event) => {
    const clusterId = event.target.value;
    setFilterData((prev) => ({
      ...prev,
      cluster: clusterId,
      hut: 'all',
    }));
    if (clusterId === 'all') {
      setHuts([{ id: 'all', name: 'All Huts' }]);
      onFilters('hutId', -1);
    } else {
      setHuts([]);
      getHuts(clusterId);
    }
  };

  const getHuts = async (clusterID) => {
    const { data } = await axiosInstance.get(`/huts?filter={"where":{"clusterId":${clusterID}}}`);
    if (data) {
      setHuts(data);
      if (data.length > 0) {
        setFilterData((prev) => ({
          ...prev,
          hut: data[0].id,
        }));
        onFilters('hutId', data[0].id);
      }
    }
  };

  const handleHutChange = (event) => {
    setFilterData((prev) => ({
      ...prev,
      hut: event.target.value,
    }));
    onFilters('hutId', event.target.value);
  };

  useEffect(() => {
    if (!clustersLoading && clustersData.length > 0) {
      setClusters([{ id: 'all', name: 'All Clusters' }, ...clustersData]);
    }
  }, [clustersData, clustersLoading]);

  useEffect(() => {
    if (filterData.cluster !== 'all') {
      getHuts(filterData.cluster);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterData.cluster]);

  return (
    <>
      {!isDashboard ? (
        <>
          <Stack
            spacing={2}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            direction={{
              xs: 'column',
              md: 'row',
            }}
            sx={{
              p: 2.5,
              pr: { xs: 2.5, md: 1 },
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <Select value={filterData.cluster} onChange={handleChange}>
                    {clusters.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <Select
                    value={filterData.hut}
                    onChange={handleHutChange}
                    style={{ fontWeight: '700' }}
                  >
                    {huts.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Stack direction="row" alignItems="flex-end" spacing={2} flexGrow={1} sx={{ width: 'auto', marginLeft: '16px' }}>
                <TextField
                  fullWidth
                  value={filters.name}
                  onChange={handleFilterName}
                  placeholder="Search..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>
          </Stack>

          <CustomPopover
            open={popover.open}
            onClose={popover.onClose}
            arrow="right-top"
            sx={{ width: 140 }}
          >
            <MenuItem onClick={popover.onClose}>
              <Iconify icon="solar:printer-minimalistic-bold" />
              Print
            </MenuItem>

            <MenuItem onClick={popover.onClose}>
              <Iconify icon="solar:import-bold" />
              Import
            </MenuItem>

            <MenuItem onClick={popover.onClose}>
              <Iconify icon="solar:export-bold" />
              Export
            </MenuItem>
          </CustomPopover>
        </>
      ) : (
        <Stack
          spacing={2}
          direction={{
            xs: 'row',
            md: 'row',
          }}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 2.5,
            pr: { xs: 2.5, md: 1 },
          }}
        >
          <Typography variant="h5" style={{ display: 'flex', alignItems: 'center' }}>
            Hut List
          </Typography>
          <Button
            component={RouterLink}
            href={paths.dashboard.hut.list}
            variant="contained"
            startIcon={<Iconify icon="carbon:download" />}
            color="primary"
            style={{
              backgroundColor: 'transparent',
              color: '#212B36',
              border: 'solid 1px #00554E',
            }}
          >
            View more
          </Button>
        </Stack>
      )}
    </>
  );
}

CultivationEntryTableToolbar.propTypes = {
  isDashboard: PropTypes.any,
  filters: PropTypes.object,
  onFilters: PropTypes.func,
};
