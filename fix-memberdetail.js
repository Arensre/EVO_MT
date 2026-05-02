const fs = require('fs');

const filePath = '/home/openclaw/EVO_MT/src/frontend/src/components/MemberDetail.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Helper function to add at the top of the component
const helperFunction = `
// Helper to format date for input[type="date"]
function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split('T')[0];
}

`;

// Add helper function before the MemberDetail component
const componentStart = 'export function MemberDetail({';
if (!content.includes('formatDateForInput')) {
  content = content.replace(componentStart, helperFunction + componentStart);
  console.log('✓ Added formatDateForInput helper');
}

// Fix initial formData
const oldFormData = `birth_date: member.birth_date || "",`;
const newFormData = `birth_date: formatDateForInput(member.birth_date),`;
content = content.replace(new RegExp(oldFormData.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newFormData);
console.log('✓ Fixed birth_date in formData');

// Fix entry_date
const oldEntryDate = `entry_date: member.entry_date || "",`;
const newEntryDate = `entry_date: formatDateForInput(member.entry_date),`;
content = content.replace(new RegExp(oldEntryDate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newEntryDate);
console.log('✓ Fixed entry_date in formData');

// Fix join_date
const oldJoinDate = `join_date: member.join_date || "",`;
const newJoinDate = `join_date: formatDateForInput(member.join_date),`;
content = content.replace(new RegExp(oldJoinDate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newJoinDate);
console.log('✓ Fixed join_date in formData');

fs.writeFileSync(filePath, content);
console.log('✓ MemberDetail.tsx updated');
