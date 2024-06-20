// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { Button, Card, Container, FormControl, Grid, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useSettingsContext } from 'src/components/settings';
import Select from '@mui/material/Select';
import { useEffect, useMemo, useState } from 'react';
import { useGetHuts } from 'src/api/hut';
import { useGetClusters } from 'src/api/cluster';
import axiosInstance from 'src/utils/axios';
import AppWidgetSummary from '../app/app-widget-summary';

// ----------------------------------------------------------------------

export default function ClusterCultivaionCard() {
  const settings = useSettingsContext();

  const theme = useTheme();

  const [clusters, setClusters] = useState([]);
  const [cultivationData, setCultivationData] = useState();

  const {
    clusters: clustersData,
    clustersLoading,
    clustersEmpty,
    refreshClusters,
  } = useGetClusters();

  const initialFilterData = useMemo(
    () => ({
      clusterId: '',
      startDate: new Date(),
      endDate: new Date(),
    }),
    []
  );

  const [filterData, setFilterData] = useState(initialFilterData);

  const handleChange = (event) => {
    setFilterData((prev) => ({
      ...prev,
      clusterId: event.target.value,
    }));
  };

  useEffect(() => {
    if (!clustersLoading && clustersData.length > 0) {
      setFilterData((prev) => ({
        ...prev,
        clusterId: clustersData[0].id,
      }));
      setClusters(clustersData);
    }
  }, [clustersData, clustersLoading]);

  const getCultivationData = async (inputData) => {
    const { data } = await axiosInstance.post('/getClusterWiseCultivationData', inputData);

    setCultivationData(data);
  };

  useEffect(() => {
    if (filterData.clusterId && filterData.startDate && filterData.endDate) {
      getCultivationData(filterData);
    }
  }, [filterData]);
  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      style={{ padding: 0, maxWidth: 'initial' }}
    >
      <Card>
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
            Cluster Cultivation
          </Typography>
        </Stack>
        <Stack
          spacing={2}
          direction={{
            xs: 'row',
            md: 'row',
          }}
          sx={{
            display: 'flex',
            px: 2.5,
            pr: { xs: 2.5, md: 1 },
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <Typography variant="subtitle" sx={{ marginBottom: '5px' }}>
                  Choose cluster
                </Typography>
                <Select value={filterData.clusterId} onChange={handleChange}>
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
                <Typography variant="subtitle" sx={{ marginBottom: '5px' }}>
                  Choose Start date
                </Typography>
                <DatePicker
                  value={new Date(filterData.startDate)}
                  onChange={(newValue) => {
                    setFilterData((prev) => ({
                      ...prev,
                      startDate: newValue,
                    }));
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <Typography variant="subtitle" sx={{ marginBottom: '5px' }}>
                  Choose End date
                </Typography>
                <DatePicker
                  value={new Date(filterData.endDate)}
                  onChange={(newValue) => {
                    setFilterData((prev) => ({
                      ...prev,
                      endDate: newValue,
                    }));
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Stack>

        <Stack
          spacing={2}
          direction={{
            xs: 'row',
            md: 'row',
          }}
          sx={{
            display: 'flex',
            p: 2.5,
            mt: 4.5,
            pr: { xs: 2.5, md: 1 },
          }}
        >
          <Grid container spacing={3} style={{ borderTop: '1px solid #DDDDDD' }}>
            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title="Total Cultivation"
                percent={2.6}
                total={cultivationData?.totalCultivation}
                chart={{
                  colors: [theme.palette.info.light, theme.palette.info.main],
                  series: [],
                }}
              />
            </Grid>
          </Grid>
        </Stack>
      </Card>
    </Container>
  );
}
