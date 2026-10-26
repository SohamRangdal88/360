const admins = [
  { email: 'admin@college.edu.in', role: 'main', department: '' },
  { email: 'cse.admin@college.edu.in', role: 'department', department: 'Computer Science and Engineering' }
];

function getAdmin(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return admins.find((admin) => admin.email === normalized) || null;
}

module.exports = { admins, getAdmin };
