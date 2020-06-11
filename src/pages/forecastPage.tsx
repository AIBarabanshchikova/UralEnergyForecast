import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import ky from "ky";
import {
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Toolbar,
  withStyles,
  Theme,
  emphasize,
  Chip,
  AppBar,
  Breadcrumbs,
  Box,
  Typography,
  Tabs,
  Tab,
} from "@material-ui/core";
import GetAppRoundedIcon from "@material-ui/icons/GetAppRounded";
import styled from "styled-components";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import BarChartRoundedIcon from "@material-ui/icons/BarChartRounded";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import SchoolRoundedIcon from "@material-ui/icons/SchoolRounded";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Bar,
  Tooltip,
} from "recharts";

const PageContainer = styled.div`
  padding: 30px 50px;
`;

const Container = styled(TableContainer)`
  max-height: 75vh;
  margin-top: 20px;
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  height: 500px;
`;

const StyledButton = styled(Button)`
  && {
    margin-right: 20px;
  }
`;

const StyledBarChart = styled(BarChart)`
  margin: auto;
`;

const StyledTypography = styled(Typography)`
  && {
    flex: 1;
  }
`;

const StyledHeadTableCell = styled(TableCell)`
  font-weight: bold;
  background-color: #f2f2f2;
`;

const ConnectedTableCell = styled(StyledHeadTableCell)`
  border-left: 1px solid #e9e9e9;
  border-right: 1px solid #e9e9e9;
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

type TabPanelProps = {
  children: any;
  index: any;
  value: any;
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
  prev_real_value: number;
};

type Group = {
  id: number;
  branchOffice: string;
  priceCategory: string;
};

export function ForecastPage() {
  const params = useParams();
  const query = useQuery();
  const yearInit = query.get("yearInit");
  const monthInit = query.get("monthInit");
  const monthsToForecast = query.get("monthsToForecast");
  const [forecastsData, setForecastsData] = useState<Forecast[] | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState(0);
  const [group, setGroup] = useState<Group | undefined>(undefined);
  const data =
    forecastsData &&
    forecastsData.filter(
      (item: Forecast) =>
        item.year > Number(yearInit) ||
        (item.year === Number(yearInit) && item.month >= Number(monthInit))
    );

  useEffect(() => {
    ky.get(
      `/forecast?id=${params.timeSerieId}&yearInit=${yearInit}&monthInit=${monthInit}&monthsToForecast=${monthsToForecast}`,
      { timeout: false }
    )
      .json<{ data: Forecast[] }>()
      .then((result) => setForecastsData(result.data));
    ky.get(`/group/${params.groupId}`)
      .json<{ data: Group }>()
      .then((result) => setGroup(result.data));
  }, [params.timeSerieId, params.groupId]);

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  function downloadData() {
    if (forecastsData === undefined) {
      throw new Error("Ops...Houston, we have a problem!");
    }

    const headings = "Год;  Месяц; Прогнозируемое значение\n";
    const dataString = forecastsData
      .filter(
        (item: Forecast) =>
          item.year > Number(yearInit) ||
          (item.year === Number(yearInit) && item.month >= Number(monthInit))
      )
      .map(
        (item: Forecast) => `${item.year}; ${item.month}; ${item.predict_value}`
      )
      .join("\n");
    const blob = new Blob([headings, dataString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ForecastData(${group && group.branchOffice}, ${
      group && group.priceCategory
    }).csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const onTabChange = (_: any, newValue: any) => {
    setActiveTab(newValue);
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
              to={`/trainedModel/${params.groupId}/forecast/${params.timeSerieId}?yearInit=${yearInit}&monthInit=${monthInit}&monthsToForecast=${monthsToForecast}`}
              label="Прогнозирование"
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
        {!forecastsData && (
          <ProgressContainer>
            <CircularProgress color="secondary" />
            <div>Пожалуйста, подождите. Это может занять несколько минут.</div>
          </ProgressContainer>
        )}
        {forecastsData && (
          <>
            <StyledButton
              variant="contained"
              color="default"
              startIcon={<GetAppRoundedIcon />}
              onClick={downloadData}
            >
              Скачать
            </StyledButton>
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
              <Container>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <StyledHeadTableCell />
                      <ConnectedTableCell colSpan={2} align={"center"}>
                        Предыдущее реальное значение
                      </ConnectedTableCell>
                      <StyledHeadTableCell colSpan={2} align={"center"}>
                        Прогнозное значение
                      </StyledHeadTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledHeadTableCell align={"center"}>
                        Месяц
                      </StyledHeadTableCell>
                      <StyledHeadTableCell align={"center"}>
                        Год
                      </StyledHeadTableCell>
                      <StyledHeadTableCell align={"center"}>
                        Объём потребления
                      </StyledHeadTableCell>
                      <StyledHeadTableCell align={"center"}>
                        Год
                      </StyledHeadTableCell>
                      <StyledHeadTableCell align={"center"}>
                        Объём потребления
                      </StyledHeadTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {forecastsData
                      .filter(
                        (item: Forecast) =>
                          item.year > Number(yearInit) ||
                          (item.year === Number(yearInit) &&
                            item.month >= Number(monthInit))
                      )
                      .map((row) => (
                        <TableRow>
                          <TableCell align={"center"}>{row.month}</TableCell>
                          <TableCell align={"center"}>{row.year - 1}</TableCell>
                          <TableCell align={"center"}>
                            {row.prev_real_value}
                          </TableCell>
                          <TableCell align={"center"}>{row.year}</TableCell>
                          <TableCell align={"center"}>
                            {row.predict_value}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Container>
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <StyledBarChart width={900} height={500} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="prev_real_value" fill="#8884d8" />
                <Bar dataKey="predict_value" fill="#82ca9d" />
              </StyledBarChart>
            </TabPanel>
          </>
        )}
      </PageContainer>
    </>
  );
}
