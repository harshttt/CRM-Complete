
/*──────────── Toggle Status ────────────*/
export default function ToggleStatus({ type = "ACTIVE", data }) {
  const isLock = type === "LOCK";

  const handleChange = (checked) => {
    console.log(isLock ? "Toggle lock status:" : "Toggle active status:", data?.id, checked);
  };

  return (
    <div>
      {/* Switch */}
      <Tooltip
        title={ isLock ? data?.isLocked ? "Unlock this lead" : "Lock this lead" : 
                data?.status === "active" ? "Mark as inactive" : "Mark as active"
              }
         >
        <Switch
          checked={isLock ? !!data?.isLocked : data?.status === "active"}
          onChange={handleChange}
          style={{
            background: isLock ? data?.isLocked ? "#722ed1" : "#d9d9d9" :
            data?.status === "active" ? "#52c41a" : "#ff4d4f",
          }}
          checkedChildren={isLock ? <LockOutlined /> : <CheckCircleOutlined />}
          unCheckedChildren={ isLock ? <UnlockOutlined /> : <CloseCircleOutlined />}
        />
      </Tooltip>
    </div>
  );
}
