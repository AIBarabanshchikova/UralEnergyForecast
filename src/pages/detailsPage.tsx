import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Button,
  Toolbar,
  withStyles,
  Theme,
  emphasize,
  Chip,
  AppBar,
  Breadcrumbs,
} from "@material-ui/core";
import ky from "ky";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import BarChartRoundedIcon from "@material-ui/icons/BarChartRounded";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";

const PageContainer = styled.div`
  padding: 30px 50px;
`;

const Container = styled(TableContainer)`
  max-height: 72vh;
`;

const StyledButton = styled(Button)`
  && {
    margin-bottom: -15px;
  }
`;

const StyledTypography = styled(Typography)`
  && {
    flex: 1;
  }
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

const StyledHeadTableCell = styled(TableCell)`
  font-weight: bold;
  background-color: #f2f2f2;
`;

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

type GroupData = {
  id: number;
  month: number;
  year: number;
  volume: number;
};

type Group = {
  id: number;
  branchOffice: string;
  priceCategory: string;
};

export function DetailsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [groupData, setGroupData] = useState<GroupData[] | undefined>(
    undefined
  );
  const [group, setGroup] = useState<Group | undefined>(undefined);

  useEffect(() => {
    ky.get(`/loadGroupData?id=${params.id}`)
      .json<{ data: GroupData[] }>()
      .then((result) => setGroupData(result.data));
    ky.get(`/group/${params.id}`)
      .json<{ data: Group }>()
      .then((result) => setGroup(result.data));
  }, [params.id]);

  const onTabChange = (_: any, newValue: any) => {
    setActiveTab(newValue);
  };

  function onTrainModel() {
    navigate(`/trainedModel/${params.id}`);
  }

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
              to={`/details/${params.id}`}
              label="Детализация временного ряда"
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
        <StyledButton
          variant="contained"
          color="secondary"
          onClick={onTrainModel}
        >
          Обучить модель
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
          {groupData && (
            <Container>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <StyledHeadTableCell>№</StyledHeadTableCell>
                    <StyledHeadTableCell>Год</StyledHeadTableCell>
                    <StyledHeadTableCell>Месяц</StyledHeadTableCell>
                    <StyledHeadTableCell>Объём потребления</StyledHeadTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupData.map((row) => (
                    <TableRow hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>{row.month}</TableCell>
                      <TableCell>{row.volume}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Container>
          )}
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <AreaChart
            width={1400}
            height={540}
            data={groupData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" />
            <XAxis xAxisId={1} allowDuplicatedCategory={false} dataKey="year" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </TabPanel>
      </PageContainer>
    </>
  );
}
