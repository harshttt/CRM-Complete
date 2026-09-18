import SalespersonScoreboard from './salesperson-scoreboard';
import ManagerScoreboard from './managerScoreboard';
import AdminScoreboard from './admin-scoreboard';
import SuperAdminScoreboard from './superadmin-scoreboard';
import commonObj from '../../../../commonObj';

const RoleBasedScoreboard = () => {

  const renderScoreboard = () => {
    const roleLevel = commonObj?.role?.roleLevel;

    switch (roleLevel) {
      case 1:
        return <SuperAdminScoreboard />;
      case 2:
        return <AdminScoreboard />;
      case 3:
        return <ManagerScoreboard />;
      case 4:
      default:
        return <SalespersonScoreboard />;
    }
  };

  return (
    <>
      {renderScoreboard()}
    </>
  );
};

export default RoleBasedScoreboard;