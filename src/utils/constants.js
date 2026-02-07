const Roles = {
  CUSTOMER: 'CUSTOMER',
  PROVIDER: 'PROVIDER',
};

const AdminRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
};

const JobStatus = {
  REQUESTED: 'REQUESTED',
  BROADCASTED: 'BROADCASTED',
  ACCEPTED: 'ACCEPTED',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
};

const GenderTag = {
  M: 'M',
  W: 'W',
  B: 'B',
};

module.exports = {
  Roles,
  AdminRoles,
  JobStatus,
  GenderTag,
};
