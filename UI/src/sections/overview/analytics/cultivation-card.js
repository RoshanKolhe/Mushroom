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

export default function CultivaionCard() {
  const settings = useSettingsContext();

  const theme = useTheme();

  const [clusters, setClusters] = useState([]);
  const [huts, setHuts] = useState([]);
  const [cultivationData, setCultivationData] = useState();

  const {
    clusters: clustersData,
    clustersLoading,
    clustersEmpty,
    refreshClusters,
  } = useGetClusters();

  const initialFilterData = useMemo(
    () => ({
      cluster: '',
      hut: '',
      date: new Date(),
    }),
    []
  );

  const [filterData, setFilterData] = useState(initialFilterData);

  const handleChange = (event) => {
    setFilterData((prev) => ({
      ...prev,
      cluster: event.target.value,
      hut: '',
    }));
    setHuts([]);
    gethuts(event.target.value);
  };

  const handleHutChange = (event) => {
    setFilterData((prev) => ({
      ...prev,
      hut: event.target.value,
    }));
  };

  const gethuts = async (clusterID) => {
    const { data } = await axiosInstance.get(`/huts?filter={"where":{"clusterId":${clusterID}}}`);
    if (data && data.length > 0) {
      setHuts(data);
      setFilterData((prev) => ({
        ...prev,
        hut: data[0].id,
      }));
    }
  };

  useEffect(() => {
    if (!clustersLoading && clustersData.length > 0) {
      setFilterData((prev) => ({
        ...prev,
        cluster: clustersData[0].id,
      }));
      setClusters(clustersData);
    }
  }, [clustersData, clustersLoading]);

  useEffect(() => {
    if (clusters && clusters.length > 0) {
      gethuts(clusters[0]?.id);
    }
  }, [clusters]);

  const getCultivationData = async (inputData) => {
    const { data } = await axiosInstance.post('/getDayWiseCultivationData', inputData);

    setCultivationData(data);
  };

  useEffect(() => {
    if (filterData.hut && filterData.cluster && filterData.date) {
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
            Cultivation
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
                <Typography variant="subtitle" sx={{ marginBottom: '5px' }}>
                  Choose Hut
                </Typography>
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <Typography variant="subtitle" sx={{ marginBottom: '5px' }}>
                  Choose date
                </Typography>
                <DatePicker
                  value={new Date(filterData.date)}
                  onChange={(newValue) => {
                    setFilterData((prev) => ({
                      ...prev,
                      date: newValue,
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
                title="Humidity"
                percent={2.6}
                total={cultivationData?.avgHumidity}
                chart={{
                  series: cultivationData?.weeklyAverageHumidity,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title="Moisture"
                percent={2.6}
                total={cultivationData?.avgMoisture}
                chart={{
                  colors: [theme.palette.warning.light, theme.palette.warning.main],
                  series: cultivationData?.weeklyAverageMoisture,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title="Cultivation"
                percent={2.6}
                total={cultivationData?.totalCultivation}
                chart={{
                  colors: [theme.palette.info.light, theme.palette.info.main],
                  series: cultivationData?.totalWeeklyCultivation,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <AppWidgetSummary
                title="Temprature"
                percent={2.6}
                total={cultivationData?.avgTemperature}
                chart={{
                  colors: [theme.palette.info.light, theme.palette.info.main],
                  series: cultivationData?.weeklyAverageTemperature,
                }}
              />
            </Grid>
          </Grid>
        </Stack>
      </Card>
    </Container>
  );
}
