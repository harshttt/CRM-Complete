import Permission from '../../modules/permission/permission.model.js';
import Role from '../../modules/role/role.model.js';
import User from '../../modules/user/user.model.js';
import Lead from '../../modules/lead/lead.model.js';
import Task from '../../modules/task/task.model.js';
import Meeting from '../../modules/meeting/meeting.model.js';
import Note from '../../modules/note/note.model.js';
import Property from '../../modules/property/property.model.js';
import Notification from '../../modules/notification/notification.model.js';
import Activity from '../../modules/activity/activity.model.js';
import Session from '../../modules/session/session.model.js';
import bcrypt from 'bcrypt';
import logger from '../../utils/logger.js';

export async function up() {
  logger.info('Running Initial System Setup Migration...');

  const permissionData = [
    // Lead
    { name: 'lead:create', module: 'lead', action: 'create' },
    { name: 'lead:read', module: 'lead', action: 'read' },
    { name: 'lead:update', module: 'lead', action: 'update' },
    { name: 'lead:delete', module: 'lead', action: 'delete' },
    { name: 'lead:assign', module: 'lead', action: 'assign' },
    { name: 'lead:stage:update', module: 'lead', action: 'stage_update' },
    { name: 'lead:duplicate:read', module: 'lead', action: 'read' },
    { name: 'lead:duplicate:update', module: 'lead', action: 'update' },


    // Task
    { name: 'task:create', module: 'task', action: 'create' },
    { name: 'task:read', module: 'task', action: 'read' },
    { name: 'task:update', module: 'task', action: 'update' },
    { name: 'task:complete', module: 'task', action: 'complete' },

    // Meeting
    { name: 'meeting:create', module: 'meeting', action: 'create' },
    { name: 'meeting:read', module: 'meeting', action: 'read' },
    { name: 'meeting:update', module: 'meeting', action: 'update' },

    // Notes
    { name: 'note:add', module: 'note', action: 'add' },
    { name: 'note:read', module: 'note', action: 'read' },

    // Property
    { name: 'property:create', module: 'property', action: 'create' },
    { name: 'property:read', module: 'property', action: 'read' },

    // Notifications
    { name: 'notification:read', module: 'notification', action: 'read' },

    // Activity
    { name: 'activity:read', module: 'activity', action: 'read' },

    // User
    { name: 'user:create', module: 'user', action: 'create' },
    { name: 'user:read', module: 'user', action: 'read' },
    { name: 'user:update', module: 'user', action: 'update' },
    { name: 'user:disable', module: 'user', action: 'disable' },

    // Role
    { name: 'role:create', module: 'role', action: 'create' },
    { name: 'role:read', module: 'role', action: 'read' },
    { name: 'role:update', module: 'role', action: 'update' },
    { name: 'role:delete', module: 'role', action: 'delete' },
    { name: 'role:restore', module: 'role', action: 'restore' },

    // Dashboard
    { name: 'dashboard:view', module: 'dashboard', action: 'view' },

    // Reports
    { name: 'reports:view', module: 'reports', action: 'view' },

    // Permission management
    { name: 'permission:read', module: 'permission', action: 'read' },
    { name: 'permission:update', module: 'permission', action: 'update' }
  ];

  const permissions = await Permission.insertMany(permissionData);
  logger.info(`Created ${permissions.length} permissions`);

  // Assign roleLevels
  const roleDefinitions = {
    superAdmin: {
      name: 'Super Admin',
      description: 'Full system access',
      roleLevel: 1,
      isSystem: true,
      permissions: permissions.map(p => p._id)
    },
    admin: {
      name: 'Admin',
      description: 'High privilege admin',
      roleLevel: 2,
      isSystem: true,
      permissions: permissions
        .filter(p => !p.name.startsWith('permission:'))
        .map(p => p._id)
    },
    manager: {
      name: 'Manager',
      description: 'Team manager with lead/task control',
      roleLevel: 3,
      isSystem: true,
      permissions: permissions
        .filter(p =>
          !p.name.startsWith('user:') &&
          !p.name.startsWith('property:')
        )
        .map(p => p._id)
    },
    salesExec: {
      name: 'Sales Executive',
      description: 'Basic sales privileges',
      roleLevel: 4,
      isSystem: true,
      permissions: permissions.filter(p =>
        [
          'lead:read', 'lead:update', 'lead:duplicate:read',
          'task:create', 'task:read', 'task:update',
          'meeting:create', 'meeting:read',
          'note:add'
        ].includes(p.name)
      ).map(p => p._id)
    }
  };

  const roleDocs = {};
  for (const key of Object.keys(roleDefinitions)) {
    roleDocs[key] = await Role.create(roleDefinitions[key]);
    logger.info(`Created role: ${roleDefinitions[key].name}`);
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  await User.create({
    fullName: 'System Owner',
    email: 'owner@crm.com',
    phone: '9999999999',
    password: hashedPassword,
    role: roleDocs.superAdmin._id
  });

  logger.info('Created Super Admin user: owner@crm.com / Admin@123');

  logger.info('Syncing indexes...');
  await Lead.syncIndexes();
  await Task.syncIndexes();
  await Meeting.syncIndexes();
  await Note.syncIndexes();
  await Property.syncIndexes();
  await Notification.syncIndexes();
  await Activity.syncIndexes();
  await Session.syncIndexes();

  logger.info('Initial Setup Migration Completed');
}
