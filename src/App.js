import React from 'react';
import styled, { keyframes } from "styled-components";
import { Routes, Route, BrowserRouter, Link } from "react-router-dom";
import img from "./images/videoFirstFrame.jpg";
import { PreviewPage } from "./pages/previewPage";
import { DetailsPage } from "./pages/detailsPage";
import { TrainedModelPage } from "./pages/trainedModelPage";
import { ModelEvaluationPage } from "./pages/modelEvaluationPage";
import { ForecastPage } from './pages/forecastPage';
import { Typography, Button } from '@material-ui/core';
import videoLink from './video-background.mp4';

const AppContainer = styled.div`
    background-size: cover;
    min-height: 100vh;
`;

const StyledButton = styled(Button)`
    && {
        margin-top: 20px;
        padding: 15px 25px;
        border-radius: 10px;
    }
`;

const StyledTypography = styled(Typography)`
    width: 350px;
    text-align: center;
`;

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/loadData" element={<PreviewPage />} />
                <Route path="/details/:id" element={<DetailsPage />} />
                <Route path="/trainedModel/:id" element={<TrainedModelPage />} />
                <Route path="/trainedModel/:groupId/modelEvaluation/:timeSerieId" element={<ModelEvaluationPage />} />
                <Route path="/trainedModel/:groupId/forecast/:timeSerieId" element={<ForecastPage />} />
            </Routes>
        </BrowserRouter>
    );
}

const blur = keyframes`
    from {
        filter: blur(0px);
    }
    to {
        filter: blur(2px);
    }
`;

const BackgroundVideo = styled.video`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: ${blur} 300ms forwards 10s;
`;

const appear = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const StyledContainer = styled.div`
    position: absolute;
    top: 25%;
    left: 40%;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    opacity: 0;
    animation: ${appear} 1000ms forwards 10s;
`;

function HomePage() {
    return (
        <AppContainer>
            <BackgroundVideo src={videoLink} autoPlay poster={img} muted>No video for you</BackgroundVideo>
            <StyledContainer>
                <StyledTypography variant="h5">Программный комплекс для прогнозирования объёмов потребления электроэнергии ООО "Уралэнергосбыт"</StyledTypography>
                <StyledButton href="/loadData" variant="contained" color="primary" >Начать!</StyledButton>
            </StyledContainer>
        </AppContainer>
    );
}

export default App;
