import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Toolbar,
  withStyles,
  Theme,
  emphasize,
  Chip,
  AppBar,
  Breadcrumbs,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import ky from "ky";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Legend,
  Line,
} from "recharts";
import { useParams, Link } from "react-router-dom";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import BarChartRoundedIcon from "@material-ui/icons/BarChartRounded";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import SchoolRoundedIcon from "@material-ui/icons/SchoolRounded";

const PageContainer = styled.div`
  padding: 30px 50px;
`;

const Container = styled(TableContainer)`
  max-height: 70vh;
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  float: right;
  margin: 0;
`;

const StyledHeadTableCell = styled(TableCell)`
  font-weight: bold;
  background-color: #f2f2f2;
`;

const StyledToolbar = styled(Toolbar)`
  && {
    padding: 15px 50px;
    min-height: unset;
  }
`;

const StyledBreadcrumb = withStyles((theme: Theme) => ({
  root: {
    cursor: "pointer",
    backgroundColor: theme.palette.grey[100],
    height: theme.spacing(3),
    color: theme.palette.grey[800],
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: theme.palette.grey[300],
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(theme.palette.grey[300], 0.12),
    },
  },
}))(Chip) as typeof Chip;

const StyledTypography = styled(Typography)`
  && {
    flex: 1;
  }
`;

type TabPanelProps = {
  children: any;
  index: any;
  value: any;
};

type Group = {
  id: number;
  branchOffice: string;
  priceCategory: string;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && (
        <Box py={1}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

type Forecast = {
  year: number;
  month: number;
  real_value: number;
  smooth_value: number;
  predict_value: number;
};

export function ModelEvaluationPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [forecasts, setForecasts] = useState<Forecast[] | undefined>(undefined);
  const [switchActive, setSwitchActive] = useState<boolean>(true);
  const data =
    forecasts && forecasts.filter((item: Forecast) => item.year === 2019);
  const [group, setGroup] = useState<Group | undefined>(undefined);
  useEffect(() => {
    ky.get(`/loadForecast?id=${params.timeSerieId}`)
      .json<{ data: Forecast[] }>()
      .then((result) => setForecasts(result.data));
    ky.get(`/group/${params.groupId}`)
      .json<{ data: Group }>()
      .then((result) => setGroup(result.data));
  }, [params.timeSerieId, params.groupId]);

  const onTabChange = (_: any, newValue: any) => {
    setActiveTab(newValue);
  };

  const onSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSwitchActive(event.target.checked);
  };

  return (
    <>
      <AppBar position="static">
        <StyledToolbar>
          <Breadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextIcon fontSize="small" htmlColor="white" />}
          >
            <StyledBreadcrumb
              component={Link}
              to="/loadData"
              label="Главная"
              icon={<HomeRoundedIcon />}
            />
            <StyledBreadcrumb
              component={Link}
              to={`/details/${params.groupId}`}
              label="Детализация временного ряда"
              icon={<BarChartRoundedIcon />}
            />
            <StyledBreadcrumb
              component={Link}
              to={`/trainedModel/${params.groupId}`}
              label="Обучение модели"
              icon={<SchoolRoundedIcon />}
            />
            <StyledBreadcrumb
              component={Link}
              to={`/trainedModel/${params.groupId}/modelEvaluation/${params.timeSerieId}`}
              label="Сравнение факта и прогноза"
              icon={<BarChartRoundedIcon />}
            />
          </Breadcrumbs>
          {group && (
            <StyledTypography
              variant="subtitle2"
              align="right"
            >{`${group.branchOffice}, ${group.priceCategory}`}</StyledTypography>
          )}
        </StyledToolbar>
      </AppBar>
      <PageContainer>
        <Tabs
          value={activeTab}
          onChange={onTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Detail" />
          <Tab label="Graph" />
        </Tabs>
        <TabPanel value={activeTab} index={0}>
          <StyledFormControlLabel
            control={
              <Switch checked={switchActive} onChange={onSwitchChange} />
            }
            label="Обученная модель"
          />
          {forecasts && (
            <Container>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <StyledHeadTableCell>Год</StyledHeadTableCell>
                    <StyledHeadTableCell>Месяц</StyledHeadTableCell>
                    <StyledHeadTableCell>Реальное значение</StyledHeadTableCell>
                    <StyledHeadTableCell>
                      Сглаженное значение
                    </StyledHeadTableCell>
                    <StyledHeadTableCell>
                      Прогнозное значение
                    </StyledHeadTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forecasts
                    .filter((item) =>
                      switchActive ? item.year === 2019 : item
                    )
                    .map((row) => (
                      <TableRow hover>
                        <TableCell>{row.year}</TableCell>
                        <TableCell>{row.month}</TableCell>
                        <TableCell>{row.real_value}</TableCell>
                        <TableCell>{row.smooth_value}</TableCell>
                        <TableCell>{row.predict_value}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Container>
          )}
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <LineChart
            width={1400}
            height={550}
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <XAxis xAxisId={1} allowDuplicatedCategory={false} dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="real_value"
              stroke="#8884d8"
              dot={true}
            />
            <Line
              type="monotone"
              dataKey="predict_value"
              stroke="#82ca9d"
              dot={true}
            />
          </LineChart>
        </TabPanel>
      </PageContainer>
    </>
  );
}
