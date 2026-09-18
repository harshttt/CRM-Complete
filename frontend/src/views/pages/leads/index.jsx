import { parseAsBoolean, parseAsString, useQueryState, useQueryStates } from "nuqs";
import { getSortingStateParser } from "../../../utils/parsers";
import { useState, useMemo, useEffect } from "react";
import { Alert, Button, Card, Col, Row, Space, Table, Typography, Tag, Tooltip, Divider, message, Flex, Popconfirm} from "antd";
import { PlusOutlined, UserOutlined, FlagOutlined, ThunderboltOutlined, EnvironmentOutlined, FieldTimeOutlined, CheckCircleOutlined, CloseCircleOutlined, FilterOutlined, ImportOutlined, ExportOutlined, UserSwitchOutlined, WhatsAppOutlined, ReloadOutlined, MessageOutlined, CopyOutlined, EyeFilled, DeleteOutlined, ClearOutlined, DownOutlined, UpOutlined} from "@ant-design/icons";
import util from "../../../utils/util";
import MyPagination from "../../components/Pagination";
import {useLeadDelete, useLeadList, useLeadSummary} from "../../../api-hooks/leads";
import commonObj from "../../../commonObj";
import StatPill from "./components/StarPill";
import Search from "./components/Search";
import LeadFilters from "./components/LeadFilters";
import AddEditModal from "./components/AddEditModal";
import LeadTimelineModal from "./components/LeadTimelineModal";
import BulkAssignModal from "./components/BulkAssignModal";
import AssignedUserModal from "./components/AssignedUserModal";
import LeadCommentsModal from "./components/LeadCommentsModal";
import ImportLeadModal from "./components/ImportLeadModal";
import LockUnlockLeadModal from "./components/LockUnlockLeadModal";
import ExportModal from "./components/ExportModal";
import BulkActionsBar from "./components/BulkActionsBar";
import AssignHistoryModal from "./components/AssignHistoryModal";
import MeetingModal from "./components/MeetingModal";
import { DeleteIcon, DuplicateLeads, EditIcon, MeetIcon, PhoneCallIcon, ViewIcon, WhatsAppIcon } from "../../components/svgIcons";
import WhatsappModal from "./components/WhatsappModal";
import DuplicateLeadsDrawer from "./components/DuplicateLeadsDrawer";
import ViewLeadModal from "./components/ViewLeadModal";

const { Text, Title } = Typography;

const getSubordinateLabel = (roleLevel) => {
  switch (roleLevel) {
    case 1:
      return "Admin";
    case 2:
      return "Manager";
    case 3:
      return "Executive";
    case 4:
    default:
      return "My";
  }
};

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const formatBudgetRange = (min, max) => {
  if (!min && !max) return "";
  const toLakh = (v) => {
    if (!v) return "";
    const lakh = v / 100000;
    return `${lakh}`.replace(/\.0+$/, "") + "L";
  };
  if (min && max) return `${toLakh(min)} - ${toLakh(max)}`;
  if (min) return `From ${toLakh(min)}`;
  if (max) return `Upto ${toLakh(max)}`;
  return "";
};

const mapLeadStatusFromApi = (apiLead) => {
  const stageKey = (apiLead.stage || "").toLowerCase();
  const isActive = apiLead.status === "active" && !apiLead.isDeleted && !apiLead.archived;

  if (!isActive) return "Lost";
  if (stageKey === "closure") return "Won";
  if (stageKey === "new") return "Open";
  return "In Progress";
};

const Leads = ({allowURLStateUpdate=true}) => {
  const [showTopSection, setShowTopSection] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedPhone,  setSelectedPhone] = useState('');
  const role = commonObj.role.roleLevel;

  // ---------- Query States ----------
  const DEFAULT_NUQS_CONFIG = { throttleMs: !allowURLStateUpdate ? Infinity : 0};
  const sorting_cols = [ "source", "stages", "assignedTo", "created_at", "updated_at"];
  const [sort, setSort] = useQueryState("leads_sort", getSortingStateParser(sorting_cols).withDefault([{ column: "id", desc: 1 }]).withOptions(DEFAULT_NUQS_CONFIG));
  const [search, setSearch] = useQueryStates({q: parseAsString.withDefault(null)},{ urlKeys: { q: "q" }, ...DEFAULT_NUQS_CONFIG });

  const [filters, setFilters] = useQueryStates(
    {
      stage: parseAsString.withDefault(null),
      source: parseAsString.withDefault(null),
      tags: parseAsString.withDefault(null),
      createDateFrom: parseAsString.withDefault(null),
      createDateTo: parseAsString.withDefault(null),
      assignedFirst: parseAsString.withDefault(null),
      assignedTo: parseAsString.withDefault(null),
      owner:parseAsString.withDefault(null),
      commentedBy:parseAsString.withDefault(null),
      category: parseAsString.withDefault(null),
      categoryName: parseAsString.withDefault(null),
      commentedDateTo: parseAsString.withDefault(null),
      commentedDateFrom: parseAsString.withDefault(null),
      hasDuplicates:parseAsBoolean.withDefault(null),
    },
    {urlKeys:{
      stage:'stage', 
      source:'source', 
      tags:'tags',
      createDateFrom:'createDateFrom',
      createDateTo:'createDateTo',
      assignedFirst:'assignedFirst',
      assignedTo:'assignedTo', 
      owner:'owner',
      commentedBy:'commentedBy',
      category:'category',
      categoryName:'categoryName',
      commentedDateTo:'commentedDateTo', 
      commentedDateFrom:'commentedDateFrom',
      hasDuplicates:'hasDuplicates'
    }, ...DEFAULT_NUQS_CONFIG}
  )

  // ---------- Local States ----------
  const [assigneeDetail, setAssigneeDetail] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [modalDrawerStates, setModalDrawerStates] = useState({
    viewLeadModal:false,
    addEditModal:false,
    importModal:false,
    exportModal:false,
    bulkAssignModal:false,
    bulkStageModal:false,
    lockUnlockModal:false,
    timelineModal:false,
    commentModal:false,
    filterDrawer:false,
    leadTimelineModal:false,
    assignedUserModal:false,
    assignedHistoryModal:false,
    meetingModal:false,
    whatsappModal:false,
    duplicateLeadsDrawer:false
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Bulk modals
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [isBulkStageOpen, setIsBulkStageOpen] = useState(false);

  // Timeline modal
  const [timelineLead, setTimelineLead] = useState(null);
  const [commentLead, setCommentLead] = useState(null);

  const handleOpenChatModal = (phone) => {
    setSelectedPhone(phone);
    setModalDrawerStates(prev => ({...prev, whatsappModal:true}));
    };

  const handleExport = () => {
    setModalDrawerStates(prev => ({...prev, exportModal:true}));
  };

  let leadPermissions = util.getModulePermissions('lead');

  const [acc] = useState({
    viewAccess:leadPermissions.includes('read'),
    addAccess:leadPermissions.includes('create'),
    editAccess:leadPermissions.includes('update'),
    deleteAccess:leadPermissions.includes('delete'),
    assignAccess:leadPermissions.includes('assign'),
    stageUpdateAccess:leadPermissions.includes('stage_update'),
    reassignAccess:leadPermissions.includes('reassign'),
    importAccess:leadPermissions.includes('bulk_upload'),
    exportAccess:leadPermissions.includes('export'),
    viewHistoryAccess:leadPermissions.includes('view_history'),
    duplicateReadAccess:leadPermissions.includes('duplicate_read'),
    duplicateUpdateAccess:leadPermissions.includes('duplicate_update'),
  });

  const {data:summaryData, isFetching:isSummaryFetching, refetch:refetchSummary} = useLeadSummary({});
  const {data: leadRes, isError, error, isFetching:isLeadloading, refetch, refetchWithQuery} = useLeadList({ page: 1, limit: 20 });

  const leadList = leadRes?.data || [];
  const qData = leadRes?.qData || {};
  const extra = leadRes?.extra || {};

  const {mutate:deleteData, isMutating:isLeadDeleting} = useLeadDelete({
    onSuccess:(res) => {
      messageApi.success(res?.message);
      refetch();
    },
    onError:(err) => {
      messageApi.error(err?.message);
    }
  })
  
  const [loading, setLoading] = useState(false);

  const leads = useMemo(() => (leadList || [])?.map((l) => {
        const leadStatus = mapLeadStatusFromApi(l);
        const budgetLabel = formatBudgetRange(l.budgetMin, l.budgetMax);

        let lastActivity = "";
        if (typeof l.lastActivityAt === "string" || l.lastActivityAt instanceof Date) {
          lastActivity = formatDate(l.lastActivityAt);
        }

        return {
          id: l?.id,
          leadName: l?.fullName,
          email: l?.email,
          phone: l?.phone,
          alternateEmails: l?.alternateEmails,
          alternatePhones: l?.alternatePhones,
          category: l?.category,
          source: l?.source,
          campaign: l?.projectName,
          property_type:l?.property_type || l?.type || l?.configuration || null,
          budget: budgetLabel,
          budgetMin: l?.budgetMin,
          budgetMax: l?.budgetMax,
          locationPrefernce: l?.primary_location || l?.preferred_area_city || l?.city || l?.property_area_city || l?.branch,
          stages: l?.stage,
          leadStatus,
          priority: l?.tags?.[0],
          score: l?.score ?? 0,
          previousScore: l?.previousScore ?? 0,
          scoreBreakdown: l?.scoreBreakdown || {},
          scoreStatus: l?.scoreStatus || "other",
          assignedTo: l?.currentOwner?.fullName || l?.assignedTo?.fullName || l?.assignedTo?.name || null,
          branch: l?.assignedTo?.branch,
          team: l?.currentOwner?.teamName || null,
          lastActivity: lastActivity || null,
          created_at: formatDate(l?.createdAt),
          updated_at: formatDate(l?.updatedAt),
          status: l?.status === "active",
          notes: l?.message || (l?.tags || []).join(", "),
          ownerRole: l?.currentOwnerRole || null,
          raw: l,
          meetingInfo: l?.meetingInfo,
          isDuplicate: l?.isDuplicate,
          hasDuplicates: l?.hasDuplicates
        };
      }),
    [leadList]
  );

  const subordinateLabel = getSubordinateLabel(role);

  // ---------- Helpers for UI ---------- 
  const stageColor = (stage) => {
    if (!stage) return "default";

    const stageMap = {
      fresh: "blue",
      call_attempt: "gold",
      call_back: "purple",
      not_answered: "cyan",
      contacted: "orange",
      project_onboard: "geekblue",
      interested: "lime",
      negotiation: "volcano",
      invalid: "red",
      follow_up: "magenta",
      payment: "green",
      reinquiry: "processing",
      meeting_scheduled: "purple",
      future_prospect: "gold",
      qualified: "blue",
      site_visit: "cyan",
      closed_won: "green",
      closed_lost: "red",
    };

    return stageMap[stage.toLowerCase()] || "default";
  };

  const priorityColor = (priority) => {
    if (!priority) return "default";
    const p = priority.toLowerCase();
    if (p === "high") return "red";
    if (p === "medium") return "orange";
    if (p === "low") return "green";
    return "default";
  };

  const openTimeline = (lead) => {
    setTimelineLead(lead);
  };

  const closeTimeline = () => {
    setTimelineLead(null);
  };

  // Bulk handlers
  const clearSelection = () => setSelectedRowKeys([]);

  const handleBulkAssign = (values) => {
    setIsBulkAssignOpen(false);
    clearSelection();
  };

  const handleBulkDelete = () => {
    message.success("Bulk delete triggered (mock)");
    clearSelection();
  };

  const handleContactClick = (e) => {
    const el = e.currentTarget;
     if (el.dataset.allowed !== "true") return;
     el.classList.add("force-show");

      setTimeout(() => {
       el.classList.remove("force-show");
      }, 5000);
  };

  // ---------- Table Columns ----------
  const baseColumns = [
    {
      title: "SN",
      dataIndex: "id",
      align: "center",
      width: 60,
      fixed: "left",
      render: (_, __, i) => {
        const page = qData.page || 1;
        const limit = qData.limit || 20;
        return <Text strong>{(page - 1) * limit + i + 1}</Text>;
      },
    },
    {
      title: "Lead",
      dataIndex: "leadName",
      align: "left",
      width: 200,
      fixed: "left",
      render: (_, row) => (
        <Space direction="vertical" size={2} style={{ textAlign: "left" }}>
          <Space size={6}>
            <UserOutlined />
            <Tooltip title={row.leadName}>
              <Text strong style={{fontSize:15}} >{row.leadName || "N/A"}</Text>
            </Tooltip>
          </Space>
          <Space size={6} wrap>
            {/* {row.stages && ( <Tag color={stageColor(row.stages)} style={{ borderRadius: 999, fontSize: 11 }}>{row.stages}</Tag>)} */}
            {row.priority && ( <Tag icon={<FlagOutlined />} color={priorityColor(row.priority)} style={{ borderRadius: 999, fontSize: 11 }}> {row.priority}</Tag>)}
          </Space>
        </Space>
      ),
    },
    {
      title: "Contact",
      dataIndex: "email",
      align: "center",
      width: 240,
      render: (_, row) => {
        const isRestricted = commonObj?.role?.roleLevel === 4;

        const blockCopy = (e) => {
          if (isRestricted) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        };

        const handleKeyDown = (e) => {
          if (
            isRestricted &&
            (e.ctrlKey || e.metaKey) &&
            e.key.toLowerCase() === "c"
          ) {
            e.preventDefault();
          }
        };

        return (
          <div
            className="contact-mask"
            data-allowed={!isRestricted}
            onClick={handleContactClick}
            onCopy={blockCopy}
            onCut={blockCopy}
            onContextMenu={blockCopy}
            onDragStart={blockCopy}
            onKeyDown={handleKeyDown}
            style={ isRestricted ? { userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", cursor: "not-allowed",} : {}}
          >
            {/* Masked (visible by default) */}
            <div className="masked">
             <div> <Text style={{fontSize:15}} className="masked">xxxxxxxxxx</Text></div>
             <div> <Text style={{fontSize:15}} className="masked">xxxxxxx</Text></div>
            </div>

            {/* Actual (hidden by default, shown on hover) */}
            <div className="actual">
              <Text style={{fontSize:15}} copyable={false}>{row?.email || "—"}</Text>
              <Flex style={{fontSize:15}} justify="center" align="center" gap={6}>
                <Text copyable={false}>{row?.phone || "—"}</Text>
              </Flex>
            </div>
          </div>
        );
      }
    },
    {
      title:"Category",
      dataIndex:'category',
      align:'center',
      width:220,
      render:(_, row) => <div>{row?.category?.name || "—"}</div>
    },
    {
      title: "Source",
      dataIndex: "source",
      align: "center",
      width: 220,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text>{row.source || "—"}</Text>
          {/* <Text type="secondary" style={{ fontSize: 11 }}> {row.campaign || "—"} </Text> */}
        </Space>
      ),
    },
    {
      title:"Project",
      dataIndex:'campaign',
      align:'center',
      width:220,
      render:(_, row) => <div>{row?.campaign || "—"}</div>
    },
    {
      title: "Budget",
      dataIndex: "property_type",
      align: "center",
      width: 220,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          {/* <Text>{row.property_type || "—"}</Text> */}
          <Text type="secondary" style={{ fontSize: 11 }}> {'₹'+row.budgetMin + " — " + '₹'+row.budgetMax} </Text>
        </Space>
      ),
    },
    {
      title: "Location",
      dataIndex: "locationPrefernce",
      align: "center",
      width: 190,
      render: (v, row) => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
          <Text>{v || row.branch || "—"}</Text>
        </Space>
      ),
    },
    {
      title: "Stage",
      dataIndex: "stages",
      align: "center",
      width: 150,
      render: v => v ? ( <Tag color={stageColor(v)} style={{ borderRadius: 999 }}>{v}</Tag>) : ("—"),
    },
    // {
    //   title: "Score",
    //   dataIndex: "score",
    //   align: "center",
    //   width: 100,
    //   render: (v) => (
    //     <Badge
    //       count={v ?? 0}
    //       style={{
    //         backgroundColor: "#2f54eb",
    //         boxShadow: "0 0 0 1px rgba(47,84,235,0.25)",
    //       }}
    //     >
    //       <span />
    //     </Badge>
    //   ),
    // },
    // {
    //   title: "Created / Updated",
    //   dataIndex: "created_at",
    //   align: "center",
    //   width: 190,
    //   render: (_, row) => (
    //     <Space direction="vertical" size={0}>
    //       <Text type="secondary" style={{ fontSize: 11 }}> Created: {row.created_at || "—"} </Text>
    //       <Text type="secondary" style={{ fontSize: 11 }}> Updated: {row.updated_at || "—"} </Text>
    //     </Space>
    //   ),
    // },
    {
      title: "Score",
      dataIndex: "score",
      align: "center",
      width: 190,
      render: (_, row) => {
        const {score = 0, previousScore = 0, scoreBreakdown = {},} = row;
        const delta = score - previousScore;
        const isUp = delta > 0;

        return (
          <div style={{ minWidth: 170, textAlign: "center" }}>
            {/* Current score */}
            <Space size={6} align="center">
              <Text strong style={{ fontSize: 18 }}>{score}</Text>

              {delta !== 0 && (
                <Tag color={isUp ? "green" : "red"} style={{ margin: 0, fontSize: 11 }}>
                  {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(delta)}
                </Tag>
              )}
            </Space>

            {/* Previous score */}
            <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 6 }}> Prev: {previousScore}</Text>

            {/* Score breakdown */}
            {/* <Tooltip
              title={
                <div style={{ minWidth: 160 }}>
                  {Object.entries(scoreBreakdown)?.map(([key, value]) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4,}}>
                      <Text>{key.toUpperCase()}</Text>
                      <Text strong>{value}%</Text>
                    </div>
                  ))}
                </div>
              }
              placement="right"
            >
              <Space size={4} wrap style={{ cursor: "pointer" }}>
                {Object.entries(scoreBreakdown)?.map(([key, value]) => ( <Tag key={key} style={{ fontSize: 10, padding: "0 6px", margin: 0,}}>{key.toUpperCase()}: {value}%</Tag>))}
              </Space>
            </Tooltip> */}
          </div>
        );
      },
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      align: "center",
      width: 180,
      render: (_, row) => (
        // <Space direction="vertical" size={0}>
        //   <Text>{row.assignedTo || "—"}</Text>
        //   <Text type="secondary" style={{ fontSize: 11 }}>
        //     {row.branch || "—"} {row.team ? `· ${row.team}` : ""}
        //   </Text>
        // </Space>
        <Space direction="vertical" size={0}>
          <Text>{row.assignedTo || "—"}</Text>
          {/* <Text type="secondary" style={{ fontSize: 11 }}>{row.branch || "—"} {row.team ? `· ${row.team}` : ""}</Text> */}
          {row.raw?.assignedTo && (
            <>
            <Button type="link" size="small" style={{ padding: 0, fontSize: 11 }} onClick={() => setAssigneeDetail(row.raw.assignedTo)}> View assignee </Button>
            <Button type="link" size="small" style={{ padding: 0, fontSize: 11 }} onClick={() =>{setSelectedId(row.id); setData(row); setModalDrawerStates(prev => ({...prev, assignedHistoryModal:true}))}}>View Assign History</Button>
            </>
          )}
        </Space>
      ),
    },
    {
      title: "Activity",
      dataIndex: "lastActivity",
      align: "center",
      width: 125,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 11 }}>Last: {row.lastActivity || "—"}</Text>
          <Button type="link" size="small" icon={<FieldTimeOutlined />} onClick={() => setCommentLead(row)} style={{ padding: 0, fontSize: 11 }}>View Comments</Button>
        </Space>
      ),
    },
    // {
    //   title: "Lock Status",
    //   dataIndex: "status",
    //   align: "center",
    //   width: 110,
    //   render: (_, row) => {
    //  return <Button type="primary" onClick={()=>{setSelectedId(row?.id); setData(row?.raw); setModalDrawerStates(prev=>({...prev,lockUnlockModal:true}))}}>View</Button>
    // },
    // },
    // {
    //   title: "Active Status",
    //   dataIndex: "status"
    //   align: "center",
    //   width: 110,
    //   render: (_, row) => <ToggleStatus type="ACTIVE" data={row} />,
    // },
    {
      title:"Created At",
      dataIndex:'created_at',
      align:'center',
      width:180,
      render:(_, row) => <div>{row?.created_at || "—"}</div>
    },
    {
      title:"Updated At",
      dataIndex:'updated_at',
      align:'center',
      width:180,
      render:(_, row) => <div>{row?.updated_at || "—"}</div>
    },
    {
      title: "Action",
      dataIndex: "id",
      align: "center",
      width: 200,
      fixed: "right",
      render: (v, row) => (
        <Space size="small">
          {/* CALL */}
          <Tooltip title="Call">
            {/* <Button size="small" type="text" icon={<PhoneOutlined />} onClick={() => setCallLead(row)} style={{ borderRadius: 999 }}/> */}
            <a href={`tel:${row.phone}`} target="_blank">
              <PhoneCallIcon height={20} width={20} />
            </a>
          </Tooltip>

          {/* CHAT */}
          <Tooltip title='Chat / Message'>
           <span onClick={()=> {handleOpenChatModal(row.phone)}} style={{cursor:'pointer'}}>
            <WhatsAppIcon height={22} width={22}/>
           </span>
          </Tooltip>
          {/* <Tooltip title="Chat / Message">
           <a href={`https://wa.me/${row.phone}?text=Hello%20I%20am%20interested`} target="_blank"><WhatsAppIcon height={22} width={22}/></a>
          </Tooltip> */}

          {/* COMMENTS */}
              {/* <Tooltip title="View comments">
               <Button size="small" type="text" icon={<MessageOutlined />} onClick={() => setLeadComments(row)} style={{ borderRadius: 999 }}/>
              </Tooltip>  */}

          {/* TIMELINE */}
          <Tooltip title="Schedule Meeting">
             <Button size="small" type="text" icon={<MeetIcon height={22} width={22} />} 
             onClick={() => {setModalDrawerStates(prev => ({...prev, meetingModal:true })); setSelectedId(row?.id); setData(row)}}
            //  onClick={() => openTimeline(row)} 
             style={{ borderRadius: 999 }}/>
          </Tooltip>

        {/* Assign */}
       {/* {acc.assignAccess &&  
          <Tooltip title={row?.assignedTo ? "View Assignee" : "Assign Lead"}>
            <Button size="small" type="text" 
              onClick={ row?.assignedTo ? () => setAssigneeDetail(row.raw.assignedTo): () => { setIsBulkAssignOpen(true); setSelectedRowKeys([row.id]);}}
              icon={<UserSwitchOutlined />} style={{ borderRadius: 999 }}
            />
          </Tooltip>
       } */}

       {/* COMMENTS */}
        <Tooltip title='Comments'><Button style={{border:'0px', background:'transparent',padding:'0px', outline:'none', height:'auto', width:'auto'}} onClick={() => setCommentLead(row)}><img src="/comment.png" width={23} height={23} style={{objectFit:'contain'}}/> </Button></Tooltip>

          {/* EDIT */}
        { acc.editAccess ? 
           <Tooltip title="Edit lead"> 
            <Button size="small" type="text" icon={<EditIcon height='20' width='20' />} onClick={() => {setSelectedId(v); setData(row); setModalDrawerStates(prev=> ({...prev, addEditModal:true}));}} style={{ borderRadius: 999 }}/>
           </Tooltip>
          :
           <Tooltip title="View lead"> 
            <Button size="small" type="text" icon={<ViewIcon height='20' width='20' />} onClick={() => {setSelectedId(v); setData(row); setModalDrawerStates(prev=> ({...prev, viewLeadModal:true}));}} style={{ borderRadius: 999 }}/>
           </Tooltip>
          }

          {/* DELETE */}
        {(acc.deleteAccess && !row?.hasDuplicates) &&
            <Popconfirm title="Are you sure to delete this lead?" okText="Yes" cancelText="No" onConfirm={() => deleteData(v)}>
               <Tooltip title="Delete lead"> <Button size="small" type="text" danger icon={<DeleteIcon />} style={{ borderRadius: 999 }}/></Tooltip>
            </Popconfirm>
        }

       {(acc.duplicateReadAccess && row?.hasDuplicates ) && <Tooltip title="View Duplicate Leads">
             <Button size="small" type="text" icon={<DuplicateLeads height={22} width={22} />} 
              onClick={() => {setModalDrawerStates(prev => ({...prev, duplicateLeadsDrawer:true })); setSelectedId(row?.id); setData(row)}}
              style={{ borderRadius: 999 }}/>
          </Tooltip>
        }
        </Space>
      ),
    },
  ];

  const columns = useMemo(() => {
    return baseColumns.map((v, i) => {
      const isSortable = sorting_cols.includes(v.dataIndex);
      const sortConfig = sort?.find(s => s.column === v.dataIndex);
      const sortOrder = sortConfig ? sortConfig.desc === 1? 'descend' : 'ascend' : null;

      return {
        ...v,
        key: v.dataIndex || `column-${i}`,
        sorter: isSortable ? true : false,
        sortOrder,
      };
    });
  }, [sort, baseColumns]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    preserveSelectedRowKeys: true,
  };

  const handleFilters = () => {
    setShowFilters(false);
  };

  const handleMeetingModalClose = (needRefetch = false) => {
    setModalDrawerStates(prev => ({...prev, meetingModal:false})); 
    setSelectedId(null);
    setData(null);
    if(needRefetch){
      refetch();
    }
  };

  useEffect(() => {
    setLoading(() => (isLeadDeleting || isLeadloading));
  },[isLeadDeleting, isLeadloading]);

  return (
    <>
      {isError ? ( <Alert title="Error" description={error?.message} type="error" showIcon />) :
      !acc.viewAccess ? (<Alert title='Access Denied' description={`You don't have permission to visit this page`} type="error" showIcon />) :
       ( <Card size="small" bordered={false} className="card-style" styles={{header:{borderBottom:'none', padding:'10px'}, body:{padding:'10px'}}}
          title={
            <Space align="center">
              <div className="card-icon-container">
                <div className="card-icon-wrapper">
                  <ThunderboltOutlined className="card-icon" />
                </div>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}> Lead Management{" "}</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Track lead sources, stages, scores, owners and timelines in one place.</Text>
              </Space>
            </Space>
          }
          extra={
            <Space>
             {acc.exportAccess && <Button icon={<ExportOutlined />} size="middle" style={{ borderRadius: 999 }} onClick={handleExport}> Export </Button>}
             {acc.importAccess && <Button icon={<ImportOutlined />} size="middle" style={{ borderRadius: 999 }} onClick={() => setIsImportModalOpen(true)}>Import</Button>}
             {acc.addAccess    && <Button icon={<PlusOutlined />} type="primary" size="middle" style={{borderRadius: 999, paddingInline: 18}} onClick={()=>{setData(null); setSelectedId(null); setModalDrawerStates(prev => ({...prev,addEditModal:true }))}}>Add Lead</Button>}
             {/* <Badge count={hotLeads} size="small"> <Button icon={<FlagOutlined />} size="middle" color="danger" style={{borderRadius: 999, boxShadow: "0 4px 10px rgba(15,23,42,0.06)",backgroundColor: "#FF5555",color: "white",border: "1px solid #ff5555",}}>Hot Leads</Button></Badge> */}
             {/* <Switch checkedChildren='Assigned' unCheckedChildren='Non Assigned' defaultChecked  /> */}
             <Tooltip title='Reload'> <Button icon={<ReloadOutlined/>} size="middle" style={{borderRadius:999, boxShadow:'0px 4px 10px rgba(15, 23, 42, 0.06)'}} onClick={()=>{refetch(); refetchSummary();}} loading={loading} /></Tooltip>
             <Tooltip title={showTopSection ? "Collapse" : "Expand"}>
               <Button icon={showTopSection ? <UpOutlined /> : <DownOutlined />} size="middle" style={{ borderRadius: 999 }} onClick={() => setShowTopSection(!showTopSection)}/>
             </Tooltip>
            </Space>
          }
        >
          {contextHolder}
          {showTopSection && (
            <>
              <Row gutter={14} style={{ marginBottom: 12 }}>
                {[
                  {icon: <UserOutlined />, label: `Total ${subordinateLabel} Leads`, value: extra?.total || 0, accent: "#2f54eb"},
                  {icon: <FieldTimeOutlined />, label: `Total ${subordinateLabel} Open / In Progress`, value: summaryData?.inProgress || 0, accent: "#1890ff"},
                  {icon: <CheckCircleOutlined />, label: `Total ${subordinateLabel} Won`, value: summaryData?.won || 0, accent: "#52c41a"},
                  {icon: <CloseCircleOutlined />, label: `Total ${subordinateLabel} Lost`, value: summaryData?.lost || 0, accent: "#f5222d"},
                ]?.map((item, idx) => (
                  <Col key={idx} xs={12} md={6}>
                    <StatPill icon={item.icon} label={item.label} value={item.value} accent={item.accent} />
                  </Col>
                ))}
              </Row>

              <div style={{marginBottom: 10, borderRadius: 18, padding: 10, paddingInline: 12, background:"linear-gradient(90deg,rgba(240,245,255,0.9),rgba(255,255,255,0.95))", border: "1px solid #f0f2ff"}}>
                <Flex>
                  <Search search={search} setSearch={setSearch} refetch={refetchWithQuery} />
                  <Space>
                  {/* <Button onClick={() => setShowFilters(prev => !prev)} style={{ borderRadius: "50px" }} icon={<ClearOutlined />} variant="outlined">Clear Filters</Button> */}
                  <Button onClick={() => setShowFilters(prev => !prev)} style={{ borderRadius: "50px" }} icon={<FilterOutlined />} type="primary">Filters</Button>
                  </Space>
                </Flex>
                <LeadFilters refetchLeadsWithQuery={refetchWithQuery} open={showFilters} onClose={handleFilters} leads={leads} filters={filters} setFilters={setFilters}/>
              </div>
            </>
           )
          }

          {/* Bulk actions */}
          {selectedRowKeys.length > 0 && ( <BulkActionsBar acc={acc} selectedCount={selectedRowKeys.length} onBulkAssign={() => setIsBulkAssignOpen(true)} onBulkStageChange={() => setIsBulkStageOpen(true)} onBulkDelete={handleBulkDelete} onClear={clearSelection} />)}

          {/* Table */}
          <Table
            className="leads-table"
            bordered={false}
            size="middle"
            pagination={false}
            loading={loading}
            columns={columns}
            dataSource={leads?.map(l => ({...l, key:l.id}))}
            style={{borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.98)"}}
            scroll={{y: util.getTableHeight ? util.getTableHeight() : "calc(100vh - 360px)", x: "max-content"}}
            rowSelection={commonObj?.role?.roleLevel != 4  ? rowSelection : undefined}
            onChange={(_, __, sorter) => util.handleTableSortingData(sorter, setSort, sort, refetchWithQuery, qData)}
          />
          <Divider style={{ margin: "14px 0 8px" }} />
          <MyPagination {...{ qData }} total={qData.total} onChange={refetchWithQuery} DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG} />
        </Card>
      )}

      {/* Add / Edit Lead Modal */}
      <ViewLeadModal open={modalDrawerStates?.viewLeadModal} onClose={()=> {setSelectedId(null); setData(null); setModalDrawerStates(prev=> ({...prev, viewLeadModal:false}))}} selectedId={selectedId} lead={data} />
      <AddEditModal open={modalDrawerStates?.addEditModal} onClose={() => { setSelectedId(null); setData(null); setModalDrawerStates(prev => ({...prev, addEditModal:false}))}} selectedId={selectedId} initialData={data} acc={acc} />
      <LeadTimelineModal open={modalDrawerStates?.timelineModal} lead={timelineLead} onClose={closeTimeline} />
      <BulkAssignModal open={modalDrawerStates?.bulkAssignModal || isBulkAssignOpen} onCancel={() => setIsBulkAssignOpen(false)} onSubmit={handleBulkAssign} leadIds={selectedRowKeys} />
      <AssignedUserModal open={modalDrawerStates?.assignedUserModal} assignedTo={assigneeDetail} onClose={() => setAssigneeDetail(null)}/>
      <AssignHistoryModal open={modalDrawerStates?.assignedHistoryModal} lead={data} onClose={() => {setSelectedId(null); setData(null); setModalDrawerStates(prev=> ({...prev, assignedHistoryModal:false}))}}/>
      <LeadCommentsModal open={modalDrawerStates?.commentModal} lead={commentLead} onClose={() => setCommentLead(null)}/>
      <ImportLeadModal open={modalDrawerStates?.importModal || isImportModalOpen} onCancel={() => setIsImportModalOpen(false)} onImported={refetch}/>
      <LockUnlockLeadModal open={modalDrawerStates?.lockUnlockModal || false} leadId={selectedId} leadLockInfo={{locked:data?.isLocked, lockedUntil: data?.lastActivityAt, lockedBy: data?.lockedBy}} onCancel={() => {setSelectedId(null);setData(null); setModalDrawerStates(prev=>({...prev, lockUnlockModal:false}))}}/>
      <ExportModal  open={modalDrawerStates?.exportModal}  onCancel={() => setModalDrawerStates(prev => ({...prev, exportModal:false}))} />
      <MeetingModal open={modalDrawerStates?.meetingModal} onClose={handleMeetingModalClose} leadId={selectedId} initialData={data?.meetingInfo} />
      <WhatsappModal open={modalDrawerStates?.whatsappModal} onClose={() => setModalDrawerStates(prev => ({...prev, whatsappModal:false}))} selectedPhone={selectedPhone} setSelectedPhone={setSelectedPhone} />
      <DuplicateLeadsDrawer acc={acc} modalDrawerStates={modalDrawerStates} setModalDrawerStates={setModalDrawerStates} open={modalDrawerStates?.duplicateLeadsDrawer} onClose={() => setModalDrawerStates(prev => ({...prev, duplicateLeadsDrawer:false }))} leadId={selectedId} />
      {/* Bulk Stage Change Modal */}
      {/* <BulkStageModal open={isBulkStageOpen} onCancel={() => setIsBulkStageOpen(false)} onSubmit={handleBulkStageChange} /> */}
    </>
  );
};

export default Leads;
