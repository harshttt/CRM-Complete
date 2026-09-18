import { Button, Col, DatePicker, Divider, Form, Input, message, Modal, Radio, Row, Space, TimePicker, Typography } from "antd";
import { useRef, useState, useEffect, useMemo } from "react";
import { useLeadLock, useLeadUnlock } from "../../../../api-hooks/leads";
import { ClockCircleOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;


export default function LockUnlockLeadModal({open, onCancel, leadId, leadLockInfo = null, onLockedChanged}) {

  // Preset durations in minutes
  const DURATION_OPTIONS = [
    { key: "15", label: "15 minutes", minutes: 15 },
    { key: "30", label: "30 minutes", minutes: 30 },
    { key: "60", label: "1 hour", minutes: 60 },
    { key: "240", label: "4 hours", minutes: 240 },
    { key: "custom", label: "Custom" },
  ];

  const [form] = Form.useForm();
  const { messageApi, contextHolder } = message.useMessage();

  // local UI state
  const [durationKey, setDurationKey] = useState("15");
  const [customUntil, setCustomUntil] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // lock result (store server response)
  const [currentLock, setCurrentLock] = useState(leadLockInfo);

  // countdown for lockedUntil
  const [remainingMs, setRemainingMs] = useState(() => {
    if (leadLockInfo?.lockedUntil) {
      return Math.max(0, new Date(leadLockInfo.lockedUntil).getTime() - Date.now());
    }
    return 0;
  });

  const timerRef = useRef(null);

  useEffect(() => {
    setCurrentLock(leadLockInfo);
    if (leadLockInfo?.lockedUntil) {
      setRemainingMs(Math.max(0, new Date(leadLockInfo.lockedUntil).getTime() - Date.now()));
    } else {
      setRemainingMs(0);
    }
  }, [leadLockInfo]);

  // live countdown updater
  useEffect(() => {
    if (!currentLock?.lockedUntil) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        const diff = Math.max(0, new Date(currentLock.lockedUntil).getTime() - Date.now());
        setRemainingMs(diff);
        if (diff <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentLock?.lockedUntil]);

  // Format remainingMs to human readable
  const remainingText = useMemo(() => {
    if (!remainingMs || remainingMs <= 0) return "Expired";
    const sec = Math.floor(remainingMs / 1000);
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${s}s`;
    if (mins > 0) return `${mins}m ${s}s`;
    return `${s}s`;
  }, [remainingMs]);

  // Mock hooks - replace these with your real hooks
  const { mutate: lockMutate, isPending:isLockingLead } = useLeadLock({
    onSuccess:res=>messageApi.success(res.message),
    onError:err=>messageApi.error(err.message)
  });

  const { mutate: unlockMutate, isPending:isUnlockingLead } = useLeadUnlock({
    onSuccess:res => messageApi.success(res.message),
    onError:err =>  messageApi.error(err.message),
  });

  const lockLead = async (payload) => {
    return lockMutate(payload);
  };

  const unlockLead = async (payload) => {
    return unlockLead(payload);
  };

  // User actions
const handleLock = async () => {
  if (!reason?.trim()) {
    messageApi.error("Please provide a reason for locking the lead");
    return;
  }

  const now = new Date();

  let lockedUntil;
  let lockedDurationMinutes;

  // predefined duration
  if (durationKey && durationKey !== "custom") {
    const option = DURATION_OPTIONS.find(d => d.key === durationKey);

    if (!option) {
      messageApi.error("Invalid lock duration");
      return;
    }

    lockedUntil = option?.minutes;
  } else {
    if (!customUntil) {
      messageApi.error("Please select custom expiry time");
      return;
    }

    const customDate = customUntil.toDate();

    if (customDate <= now) {
      messageApi.error("Custom expiry must be in the future");
      return;
    }

    //Convert to minutes
    lockDurationMinutes = Math.ceil((customDate.getTime() - now.getTime()) / (1000*60));
  }

  if(!lockedDurationMinutes){
    messageApi.error('Unable to calculate lock duration');
    return ;
  }

  setLoading(true);

  try {
    const payload = { id:leadId, lockDurationMinutes:lockedUntil, reason };
    const res = await lockLead(payload);

    if (res?.success) {
      messageApi.success(res?.message || "Lead locked");

      const newLock = {
        lockedBy: res.data?.lockedBy || "You",
        lockedUntil: res.data?.lockedUntil || lockedUntil,
        lockReason: res.data?.lockReason || reason,
      };

      setCurrentLock(newLock);
      onLockedChanged?.(newLock);
    } else {
      messageApi.error(res?.message || "Failed to lock lead");
    }
  } catch (err) {
    messageApi.error(err?.message || "Failed to lock lead");
  } finally {
    setLoading(false);
  }
};

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const payload = { leadId };
      const res = await unlockLead(payload);
      if (res?.success) {
        messageApi.success(res?.message || "Lead unlocked");
        setCurrentLock(null);
        setRemainingMs(0);
        onLockedChanged?.(null);
      } else {
        messageApi.error(res?.message || "Failed to unlock lead");
      }
    } catch (err) {
      messageApi.error(err?.message || "Failed to unlock lead");
    } finally {
      setLoading(false);
    }
  };

  // Reset on close
  const handleClose = () => {
    form.resetFields();
    setDurationKey("15m");
    setCustomUntil(null);
    setReason("");
    onCancel?.();
  };

  return (
    <Modal open={open} onCancel={handleClose}
      title={
        <Space>
          <LockOutlined />
          <span>{currentLock ? "Lock / Unlock Lead" : "Lock Lead"}</span>
        </Space>
      }
      footer={
        <Space style={{ justifyContent: "flex-end", width: "100%" }}>
          <Button onClick={handleClose} disabled={isLockingLead || isUnlockingLead}>Close</Button>

          {currentLock?.locked ? 
          ( <Button danger onClick={handleUnlock} loading={isLockingLead || isUnlockingLead} icon={<UnlockOutlined />}> Unlock</Button>) : 
          ( <Button type="primary" onClick={handleLock} loading={isLockingLead || isUnlockingLead} icon={<LockOutlined />}>Lock</Button>)
          }
        </Space>
      }
      width={640}
    >
      {contextHolder}

      {/* Current lock state */}
      {currentLock?.locked ? (
        <>
          <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
            <Col>
              <Text strong>Locked By:</Text> <Text>{currentLock.lockedBy || "-"}</Text>
            </Col>
            <Col>
              <Text strong>Expires In:</Text>{" "}
              <Text code>
                <ClockCircleOutlined /> {remainingText}
              </Text>
            </Col>
          </Row>
          <Row style={{ marginBottom: 8 }}>
            <Col span={24}>
              <Text strong>Reason:</Text>
              <div style={{ marginTop: 6 }}>{currentLock.lockReason || "-"}</div>
            </Col>
          </Row>
          <Divider />
          <Text type="secondary">You can unlock the lead immediately or wait until the lock expires.</Text>
        </>
      ) : (
        <>
          <Title level={5}>Lock lead</Title>

          <Form form={form} layout="vertical">
            <Form.Item label="Duration" required>
              <Radio.Group onChange={(e) => setDurationKey(e.target.value)} value={durationKey}>
                <Space direction="vertical">
                  {DURATION_OPTIONS?.map((opt) => ( <Radio key={opt.key} value={opt.key}>{opt.label}</Radio>))}
                </Space>
              </Radio.Group>
            </Form.Item>

            {durationKey === "custom" && (
              <Form.Item label="Custom expiry ( time)" required>
                <TimePicker showTime style={{ width: "100%" }} disabledDate={(d) => !d || d.isBefore(dayjs(), "minute")} value={customUntil} onChange={(v) => setCustomUntil(v)} />
              </Form.Item>
            )}

            <Form.Item label="Reason for lock" required rules={[{ required: true, message: "Please enter a reason" }]}>
              <Input.TextArea rows={3} placeholder="Why are you locking this lead?" value={reason} onChange={(e) => setReason(e.target.value)} />
            </Form.Item>
          </Form>

          <Text type="secondary">Note: locking prevents other users from editing this lead until unlocked or the lock expires.</Text>
        </>
      )}
    </Modal>
  );
}
