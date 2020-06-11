import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ky from "ky";
import {
  Typography,
  Slider,
  Button,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  Radio,
  Toolbar,
  withStyles,
  Theme,
  emphasize,
  Chip,
  AppBar,
  Breadcrumbs,
} from "@material-ui/core";
import styled from "styled-components";
import { useSessionStorage } from "../hooks/useSessionStorage";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import BarChartRoundedIcon from "@material-ui/icons/BarChartRounded";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import SchoolRoundedIcon from "@material-ui/icons/SchoolRounded";

const PageContainer = styled.div`
  padding: 15px 50px;
`;

const Container = styled(TableContainer)`
  max-height: 75vh;
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  height: 500px;
`;

const StyledRow = styled(TableRow)`
  cursor: pointer;
`;

const StyledButton = styled(Button)`
  && {
    margin: 15px 20px;
  }
`;

const ForecastContainer = styled.div`
  margin-bottom: 10px;
`;

const StyledFormControl = styled(FormControl)`
  && {
    min-width: 170px;
    margin-right: 30px;
  }
`;

const SliderContainer = styled.div`
  padding-top: 4px;
  min-width: 300px;
`;

const StyledTable = styled(Table)`
  table-layout: fixed;
`;

const StyledHeadTableCell = styled(TableCell)`
  font-weight: bold;
  background-color: #f2f2f2;
`;

const StyledTableCell = styled(StyledHeadTableCell)`
  width: 40px;
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

const StyledTypography = styled(Typography)`
  && {
    flex: 1;
  }
`;

type TimeSerie = {
  time_serie_id: number;
  group_data_id: number;
  alpha: number;
  beta: number;
  gamma: number;
  mse: number;
  mape: number;
};

type Group = {
  id: number;
  branchOffice: string;
  priceCategory: string;
};

const marks = [
  {
    value: 1,
    label: "1",
  },
  {
    value: 2,
    label: "2",
  },
  {
    value: 3,
    label: "3",
  },
  {
    value: 4,
    label: "4",
  },
  {
    value: 5,
    label: "5",
  },
];

export function TrainedModelPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [timeSeriesData, setTimeSeriesData] = useSessionStorage<{
    [id: string]: TimeSerie[];
  }>("timeSerieData", {});
  const [numberOfMonth, setNumberOfMonth] = useState<
    number | number[] | undefined
  >(undefined);
  const [yearInit, setYearInit] = useState<string | undefined>(undefined);
  const [monthInit, setMonthInit] = useState<string | undefined>(undefined);
  const [selectedTimeSerieId, setSelectedTimeSerieId] = useState<
    number | undefined
  >(undefined);
  const [group, setGroup] = useState<Group | undefined>(undefined);
  const timeSerieData = timeSeriesData[params.id];

  useEffect(() => {
    ky.get(`/group/${params.id}`)
      .json<{ data: Group }>()
      .then((result) => setGroup(result.data));
    if (!timeSeriesData[params.id]) {
      ky.get(`/trainModel?id=${params.id}`, { timeout: false })
        .json<{ data: TimeSerie[] }>()
        .then((result) =>
          setTimeSeriesData({ ...timeSeriesData, [params.id]: result.data })
        );
    }
  }, [params.id]);

  function onRowClick(id: number) {
    navigate(`/trainedModel/${params.id}/modelEvaluation/${id}`);
  }

  function onForecast() {
    const time_serie_id = selectedTimeSerieId
      ? selectedTimeSerieId
      : timeSerieData[0].time_serie_id;
    navigate(
      `/trainedModel/${params.id}/forecast/${time_serie_id}?yearInit=${yearInit}&monthInit=${monthInit}&monthsToForecast=${numberOfMonth}`
    );
  }

  function onNumberOfMonthChange(
    event: React.ChangeEvent<{}>,
    value: number | number[]
  ) {
    setNumberOfMonth(value);
  }

  function onYearInitChange(
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) {
    setYearInit(String(event.target.value));
  }

  function onMonthInitChange(
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) {
    setMonthInit(String(event.target.value));
  }

  function onRadioClick(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: number
  ) {
    e.stopPropagation();
    setSelectedTimeSerieId(id);
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
            <StyledBreadcrumb
              component={Link}
              to={`/trainedModel/${params.id}`}
              label="Обучение модели"
              icon={<SchoolRoundedIcon />}
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
        {!timeSerieData && (
          <ProgressContainer>
            <CircularProgress color="secondary" />
            <div>Пожалуйста, подождите. Это может занять несколько минут.</div>
          </ProgressContainer>
        )}
        {timeSerieData && (
          <>
            <ForecastContainer style={{ display: "flex" }}>
              <StyledFormControl required>
                <InputLabel htmlFor="year-native-simple">
                  Начальный год
                </InputLabel>
                <Select
                  native
                  value={yearInit}
                  onChange={onYearInitChange}
                  inputProps={{
                    id: "year-native-simple",
                  }}
                >
                  <option aria-label="None" value="" />
                  <option value={2019}>2019</option>
                  <option value={2020}>2020</option>
                  <option value={2021}>2021</option>
                </Select>
              </StyledFormControl>
              <StyledFormControl required>
                <InputLabel htmlFor="month-native-simple">
                  Начальный месяц
                </InputLabel>
                <Select
                  native
                  value={monthInit}
                  onChange={onMonthInitChange}
                  inputProps={{
                    id: "month-native-simple",
                  }}
                >
                  <option aria-label="None" value="" />
                  <option value={1}>Январь</option>
                  <option value={2}>Февраль</option>
                  <option value={3}>Март</option>
                  <option value={4}>Апрель</option>
                  <option value={5}>Май</option>
                  <option value={6}>Июнь</option>
                  <option value={7}>Июль</option>
                  <option value={8}>Август</option>
                  <option value={9}>Сентябрь</option>
                  <option value={10}>Октябрь</option>
                  <option value={11}>Ноябрь</option>
                  <option value={12}>Декабрь</option>
                </Select>
              </StyledFormControl>
              <SliderContainer>
                <Typography id="months-to-forecast-slider" gutterBottom>
                  Горизонт прогнозирования
                </Typography>
                <Slider
                  defaultValue={1}
                  aria-labelledby="months-to-forecast-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks={marks}
                  min={1}
                  max={5}
                  onChange={onNumberOfMonthChange}
                />
              </SliderContainer>
              <StyledButton
                variant="outlined"
                color="primary"
                onClick={onForecast}
              >
                Выполнить прогноз
              </StyledButton>
            </ForecastContainer>
            <Container>
              <StyledTable stickyHeader>
                <TableHead>
                  <TableRow>
                    <StyledTableCell />
                    <StyledHeadTableCell />
                    <ConnectedTableCell colSpan={3} align={"center"}>
                      Параметры
                    </ConnectedTableCell>
                    <StyledHeadTableCell colSpan={2} align={"center"}>
                      Ошибки
                    </StyledHeadTableCell>
                  </TableRow>
                  <TableRow>
                    <StyledTableCell />
                    <StyledHeadTableCell align={"center"}>
                      Id
                    </StyledHeadTableCell>
                    <StyledHeadTableCell align={"center"}>
                      Alpha
                    </StyledHeadTableCell>
                    <StyledHeadTableCell align={"center"}>
                      Beta
                    </StyledHeadTableCell>
                    <StyledHeadTableCell align={"center"}>
                      Gamma
                    </StyledHeadTableCell>
                    <StyledHeadTableCell align={"center"}>
                      MSE
                    </StyledHeadTableCell>
                    <StyledHeadTableCell align={"center"}>
                      MAPE
                    </StyledHeadTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeSerieData.map((row) => (
                    <StyledRow
                      hover
                      onClick={() => onRowClick(row.time_serie_id)}
                      selected={
                        selectedTimeSerieId === row.time_serie_id ? true : false
                      }
                    >
                      <TableCell>
                        <Radio
                          name="radio-button"
                          onClick={(e) => onRadioClick(e, row.time_serie_id)}
                          value={row.time_serie_id}
                          checked={selectedTimeSerieId === row.time_serie_id}
                          size={"small"}
                        />
                      </TableCell>
                      <TableCell align={"center"}>
                        {row.group_data_id}
                      </TableCell>
                      <TableCell align={"center"}>{row.alpha}</TableCell>
                      <TableCell align={"center"}>{row.beta}</TableCell>
                      <TableCell align={"center"}>{row.gamma}</TableCell>
                      <TableCell align={"center"}>{row.mse}</TableCell>
                      <TableCell align={"center"}>{row.mape}</TableCell>
                    </StyledRow>
                  ))}
                </TableBody>
              </StyledTable>
            </Container>
          </>
        )}
      </PageContainer>
    </>
  );
}
