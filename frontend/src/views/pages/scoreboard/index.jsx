import { ConfigProvider } from 'antd';
import { ScoreboardProvider } from './context/scoreboard-context';
import RoleBasedScoreboard from './components/rolebased-scoreboard';

const ScoreboardMain = () => {
  return (
    <ConfigProvider theme={{token: { colorPrimary: '#1890ff', borderRadius: 6}}}>
      <ScoreboardProvider>
        <div className="app">
          <RoleBasedScoreboard />
        </div>
      </ScoreboardProvider>
    </ConfigProvider>
  );
};

export default ScoreboardMain;