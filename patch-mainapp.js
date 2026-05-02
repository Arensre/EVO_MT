const fs = require('fs');

const filePath = process.argv[2] || '/home/openclaw/EVO_MT/src/frontend/src/MainApp.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Find and replace the MembersView function
const oldMembersView = `// Members View Component
function MembersView() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const queryClient = useQueryClient();

  const { data: memberTypes = [] } = useQuery({
    queryKey: ['member-types'],
    queryFn: async () => {
      const response = await axios.get(\`\${API_URL}/stammdaten/member-types\`);
      return response.data;
    }
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const response = await axios.get(\`\${API_URL}/members\`);
      return response.data;
    }
  });`;

const newMembersView = `// Members View Component
function MembersView() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [memberFilters, setMemberFilters] = useState<{ search?: string; member_type_id?: number; is_active?: boolean }>({});
  const queryClient = useQueryClient();

  const { data: memberTypes = [] } = useQuery({
    queryKey: ['member-types'],
    queryFn: async () => {
      const response = await axios.get(\`\${API_URL}/stammdaten/member-types\`);
      return response.data;
    }
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', memberFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (memberFilters.search) params.append('search', memberFilters.search);
      if (memberFilters.member_type_id) params.append('member_type_id', String(memberFilters.member_type_id));
      if (memberFilters.is_active !== undefined) params.append('is_active', String(memberFilters.is_active));
      
      const response = await axios.get(\`\${API_URL}/members?\${params.toString()}\`);
      return response.data;
    }
  });`;

if (content.includes(oldMembersView)) {
  content = content.replace(oldMembersView, newMembersView);
  console.log('✓ Replaced members query with filtered query');
} else {
  console.log('⚠ Could not find exact match for members query, trying alternative...');
}

// Add isLoading and activeFilters to MemberList call
const oldMemberListCall = `<MemberList
            members={members}
            selectedId={selectedMember?.id}
            onSelect={setSelectedMember}
            onAddNew={() => setIsModalOpen(true)}
            onDelete={setMemberToDelete}
            memberTypes={memberTypes}
          />`;

const newMemberListCall = `<MemberList
            members={members}
            selectedId={selectedMember?.id}
            onSelect={setSelectedMember}
            onAddNew={() => setIsModalOpen(true)}
            onDelete={setMemberToDelete}
            memberTypes={memberTypes}
            onFilterChange={(filters) => {
              setMemberFilters({
                search: filters.search,
                member_type_id: filters.memberTypeId,
                is_active: filters.isActive
              });
              setSelectedMember(null);
            }}
            activeFilters={memberFilters}
          />`;

if (content.includes(oldMemberListCall)) {
  content = content.replace(oldMemberListCall, newMemberListCall);
  console.log('✓ Replaced MemberList call with filter props');
} else {
  console.log('⚠ Could not find exact MemberList call match');
}

// Add isLoading check
const oldDiv = `<div className={\`\${selectedMember ? 'w-2/5' : 'w-full'} overflow-auto p-6 transition-all duration-300\`}>
          <MemberList`;

const newDiv = `<div className={\`\${selectedMember ? 'w-2/5' : 'w-full'} overflow-auto p-6 transition-all duration-300\`}>
          {isLoading ? (
            <div className="text-center py-12">Laden...</div>
          ) : (
          <MemberList`;

if (content.includes(oldDiv)) {
  content = content.replace(oldDiv, newDiv);
  
  // Also need to close the loading check
  const oldClosing = `memberTypes={memberTypes}
            onFilterChange={(filters) => {
              setMemberFilters({
                search: filters.search,
                member_type_id: filters.memberTypeId,
                is_active: filters.isActive
              });
              setSelectedMember(null);
            }}
            activeFilters={memberFilters}
          />
        </div>`;
          
  const newClosing = `memberTypes={memberTypes}
            onFilterChange={(filters) => {
              setMemberFilters({
                search: filters.search,
                member_type_id: filters.memberTypeId,
                is_active: filters.isActive
              });
              setSelectedMember(null);
            }}
            activeFilters={memberFilters}
          />
          )}
        </div>`;
  
  if (content.includes(oldClosing)) {
    content = content.replace(oldClosing, newClosing);
    console.log('✓ Added loading state');
  }
}

fs.writeFileSync(filePath, content);
console.log('✓ File updated successfully');
