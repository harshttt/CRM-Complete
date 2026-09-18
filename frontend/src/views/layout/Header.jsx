import { Link } from "react-router-dom";
import commonObj from "../../commonObj";

const Header = ({ collapsed }) => {
  return (
    <Link 
      to={'/'} 
      className="crm-sidebar-header" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%', 
        padding: '8px 12px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className={!collapsed ? "" : "crm-sidebar-logo-circle-wrapper"} 
        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
      >
        <img 
          src="/logo.webp" 
          alt="Logo"
          style={{ 
            width: '100%', 
            height: 'auto', 
            maxHeight: '45px', 
            objectFit: 'contain',
            display: 'block'
          }} 
        />
      </div>

      {!collapsed && (
        <div className="crm-sidebar-title" style={{ display: 'none' }}>
          {/* Hide or remove this text block so the image takes the entire horizontal space */}
          <div className="crm-sidebar-subtitle">{commonObj?.role?.name} Console</div>
        </div>
      )}
    </Link>
  );
};

export default Header;