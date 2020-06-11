import React from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import ky from "ky";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  AppBar,
  Toolbar,
  Breadcrumbs,
  withStyles,
  Theme,
  emphasize,
  Chip,
} from "@material-ui/core";
import { useSessionStorage } from "../hooks/useSessionStorage";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";

const PageContainer = styled.div`
  padding: 20px 50px;
`;

const Container = styled(TableContainer)`
  max-height: 75vh;
  margin-top: 20px;
`;

const StyledRow = styled(TableRow)`
  cursor: pointer;
`;

const StyledButton = styled(Button)`
  && {
    margin-right: 20px;
  }
`;

const StyledToolbar = styled(Toolbar)`
  && {
    padding: 15px 50px;
    min-height: unset;
  }
`;

const StyledHeadTableCell = styled(TableCell)`
  font-weight: bold;
  background-color: #f2f2f2;
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

type TargetGroup = {
  id: number;
  branchOffice: number;
  priceCategory: number;
};

export function PreviewPage() {
  const [targetGroups, setTargetGroups] = useSessionStorage<
    TargetGroup[] | undefined
  >("targetGroups", undefined);
  const navigate = useNavigate();

  async function uploadData() {
    const textCsv = await selectFile();
    const result: { data: TargetGroup[] } = await ky
      .post("/uploadFile", { body: textCsv })
      .json();
    setTargetGroups(result.data);
  }

  function onRowClick(id: number) {
    navigate(`/details/${id}`);
  }

  return (
    <>
      <AppBar position="static">
        <StyledToolbar>
          <Breadcrumbs aria-label="breadcrumb">
            <StyledBreadcrumb
              component={Link}
              to="/loadData"
              label="Главная"
              icon={<HomeRoundedIcon />}
            />
          </Breadcrumbs>
        </StyledToolbar>
      </AppBar>
      <PageContainer>
        <StyledButton
          variant="contained"
          color="default"
          startIcon={<CloudUploadIcon />}
          onClick={uploadData}
        >
          Загрузить
        </StyledButton>
        {targetGroups && (
          <>
            <Container>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <StyledHeadTableCell>№</StyledHeadTableCell>
                    <StyledHeadTableCell>Филиал</StyledHeadTableCell>
                    <StyledHeadTableCell>Ценовая категория</StyledHeadTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {targetGroups.map((row) => (
                    <StyledRow hover onClick={() => onRowClick(row.id)}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.branchOffice}</TableCell>
                      <TableCell>{row.priceCategory}</TableCell>
                    </StyledRow>
                  ))}
                </TableBody>
              </Table>
            </Container>
          </>
        )}
      </PageContainer>
    </>
  );
}

function selectFile(): Promise<string> {
  return new Promise((resolve) => {
    const fileSelector = document.createElement("input");
    fileSelector.setAttribute("type", "file");
    fileSelector.setAttribute("accept", "text/csv");
    fileSelector.addEventListener("change", () => {
      if (fileSelector.files) {
        fileSelector.files[0].text().then(resolve);
      }
    });
    fileSelector.click();
  });
}
