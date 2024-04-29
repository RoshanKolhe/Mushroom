// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// components
import { useSettingsContext } from 'src/components/settings';
//
import { TicketListView } from 'src/sections/ticket/view';
import { HutListView } from 'src/sections/hut/view';
import { useGetDashboardCounts } from 'src/api/user';
import AnalyticsWidgetSummary from '../analytics-widget-summary';
import CultivaionCard from '../cultivation-card';
// ----------------------------------------------------------------------

export default function OverviewAnalyticsView() {
  const settings = useSettingsContext();

  const { dashboardCounts } = useGetDashboardCounts();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Cultivation"
            total={`${dashboardCounts?.totalCultivation}Kg` || '0'}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
            color="info"
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Today’s Cultivation"
            total={`${dashboardCounts?.todaysCultivation}Kg` || '0'}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_mushroom.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Clusters"
            total={`${dashboardCounts?.totalClusters}` || '0'}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_cluster.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Huts"
            total={`${dashboardCounts?.totalHuts}` || '0'}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_hut.png" />}
          />
        </Grid>

        <Grid xs={12} sm={12} md={12}>
          <CultivaionCard />
        </Grid>

        <Grid xs={12} sm={12} md={12}>
          <HutListView isDashboard />
        </Grid>

        <Grid xs={12} sm={12} md={12}>
          <TicketListView isDashboard />
        </Grid>
      </Grid>
    </Container>
  );
}
