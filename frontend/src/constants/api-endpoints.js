const API_ENDPOINTS = {

    USER_VALIDATE_TOKEN : 'auth/validate',
    USER_LOGIN:'auth/login',
    USER_LOGOUT:'auth/logout',
    USER_REFRESH_TOKEN:'auth/refresh',
    USER_UPDATE_PASSWORD:'user/',

    CONSTANTS:'/constants/all',
    // USER_UPDATE_PROFILE:'admin/update-profile',
    // USER_UPDATE_PASSWORD:'admin/update-password',
    
    //File Upload
    // FILE_UPLOAD : 'file/save',
    // FILE_REMOVE : 'file/remove',

    //User
    USER_LIST : 'user/fetch-all',
    USER_DROPDOWN : 'user/parent-user-dropdown',
    USER_SEARCH:'user/search',
    USER_CREATE: 'user/create',
    USER_UPDATE : 'user/',
    USER_DELETE : 'user/',
    USER_RESTORE : 'user/restore/',
    USER_TREE : 'user/tree',
    // USER_TOGGLE_STATUS : 'user/toggle/status',

    ROLES_LIST: 'role/fetch-all',
    ROLES_LIST_FOR_DROPDOWN: 'role/',
    ROLES_CREATE: 'role/create',
    ROLES_UPDATE: 'role/',
    ROLES_DELETE: 'role/',
    ROLES_RESTORE: 'role/',
    ROLES_FETCH_PERMISSIONS: 'role/',

    PERMISSION_LIST: 'permission/fetch-all',
    PERMISSION_ADD: 'permission/add',
    PERMISSION_USER: 'user/permission',

    //Lead category
    CATEGORY_CREATE : '/category/create',
    CATEGORY_UPDATE : '/category/',
    CATEGORY_LIST: '/category/list',
    CATEGORY_DELETE : '/category/',   
    CATEGRORY_RESTORE : '/category/restore',
    CATEGORY_DROPDOWN : '/category/dropdown',
    CATEGORY_DETAIL : '/category/',
    CATEGORY_TOGGLE : '/category/toggle/', 

    //Leads
    LEAD_CREATE : 'lead/create',
    LEAD_LIST : 'lead/list',
    LEAD_SUMMARY:'lead/summary',
    LEAD_DETAIL : 'lead/',
    LEAD_DELETE : 'lead/',
    LEAD_UPDATE : 'lead/',
    LEAD_DUPLICATE : 'lead/duplicates/',
    LEAD_UPDATE_STAGE : 'lead/stage/',
    LEAD_UPDATE_NEXT_FOLLOW_UP : 'lead/followup/',
    LEAD_ADD_TAGS : 'lead/tags/',
    LEAD_LOCK_HEAD : 'lead/lock/',
    LEAD_UNLOCK_HEAD : 'lead/unlock/',
    LEAD_ASSIGN : 'lead/assign/',
    LEAD_BULK_ASSIGN : 'lead/bulk/assign',
    LEAD_BULK_IMPORT : 'lead/bulk/import',
    LEAD_BULK_EXPORT : 'lead/export',
    LEAD_RECYCLE_RESTORE : 'lead/recycle/restore',
    LEAD_CONSTANTS : '/lead/constants',
    LEAD_ASSIGNMENT_HISTORY : 'lead/assignment-history',
    LEAD_STAGE_HISTORY : 'lead/stage-history',

     //comments
    COMMENTS_LIST : '/lead/comment/',
    COMMENTS_ADD : '/lead/comment/',
    COMMENTS_UPDATE : '/lead/comment/',

    //Meeting
    MEETING_LIST : 'meeting/upcoming',
    MEETING_SCHEDULE : 'meeting/',
    MEETING_CANCEL : 'meeting/',
    MEETING_UPDATE : 'meeting/',

    //Settings
    // SETTING_SAVE : 'setting/save',
    // SETTING_LIST : 'setting/list',
    // SETTING_DELETE : 'setting/delete',
    // SETTING_UPDATE : 'setting/update',

    //TASKS
    TASK_CREATE : 'task/create',
    TASK_LIST : 'task/list',
    TASK_UPDATE : 'task/',
    TASK_COMPLETE : 'task/complete/',
    TASK_DELETE : 'task/soft_delete/',

    //REMINDERS
    REMINDERE_CREATE : 'reminders/',
    REMINDERES_UPDATE : 'reminders/update',
    REMINDERES_COMPLETE: 'reminders/complete',
    REMINDERES_LIST : 'reminders/',
    REMINDERS_DETAIL :'reminders/',
    REMINDERES_DELETE : 'reminders/',


    //PERFORMANCE
     PERFORMANCE : 'salesperson/performance',

    //TEAM
    // TEAM_CREATE : 'team/create',
    // TEAM_UPDATE : 'team/update',
    // TEAM_LIST : 'team/list',
    // TEAM_DELETE : 'team/delete',

    // ====== Sales Meeting & Visit Management ======
    SALES_MEETING_LIST : 'sales-meeting/',
    SALES_MEETING_CREATE : 'sales-meeting/',
    SALES_MEETING_DETAIL : 'sales-meeting/',
    SALES_MEETING_UPDATE : 'sales-meeting/',
    SALES_MEETING_CONFIRM : 'sales-meeting/',
    SALES_MEETING_CHECK_IN : 'sales-meeting/',
    SALES_MEETING_START : 'sales-meeting/',
    SALES_MEETING_CHECK_OUT : 'sales-meeting/',
    SALES_MEETING_COMPLETE : 'sales-meeting/',
    SALES_MEETING_CANCEL : 'sales-meeting/',
    SALES_MEETING_REOPEN : 'sales-meeting/',
    SALES_MEETING_STATS : 'sales-meeting/stats',
    SALES_MEETING_ASSIGNABLE_EMPLOYEES : 'sales-meeting/assignable-employees',

    // Customers
    CUSTOMER_LIST : 'customer/',
    CUSTOMER_CREATE : 'customer/',
    CUSTOMER_DETAIL : 'customer/',
    CUSTOMER_UPDATE : 'customer/',
    CUSTOMER_DELETE : 'customer/',
    CUSTOMER_DROPDOWN : 'customer/dropdown',

    // Follow-Ups
    FOLLOW_UP_LIST : 'follow-up/',
    FOLLOW_UP_CREATE : 'follow-up/',
    FOLLOW_UP_DETAIL : 'follow-up/',
    FOLLOW_UP_UPDATE : 'follow-up/',
    FOLLOW_UP_DELETE : 'follow-up/',
    FOLLOW_UP_COMPLETE : 'follow-up/',

};

export default API_ENDPOINTS;