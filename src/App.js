import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import PlayerBar from "./components/layout/PlayerBar";

const AppContent = () => {
  const { currentTrack } = usePlayer();

  return (
    <div className={currentTrack ? 'has-player' : ''}>
      <AppRoutes />
      <PlayerBar />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}