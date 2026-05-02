const fs = require('fs');

const filePath = process.argv[2] || '/home/openclaw/EVO_MT/src/frontend/src/MainApp.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Add ErrorLog import
if (!content.includes('ErrorLogPanel') && !content.includes('addErrorLog')) {
  // Add import after existing imports
  const importMatch = content.match(/import.*from.*lucide-react.*;/);
  if (importMatch) {
    const lastImport = importMatch[importMatch.length - 1];
    const importIndex = content.lastIndexOf("import { LogOut } from 'lucide-react'");
    const insertAfter = content.indexOf(';', importIndex) + 1;
    
    content = content.slice(0, insertAfter) + 
      `\nimport { ErrorLogPanel, ErrorIndicator, addErrorLog } from './components/ErrorLog';` +
      content.slice(insertAfter);
    console.log('✓ Added ErrorLog import');
  }
}

// Add error state to MainApp component
const mainAppMatch = content.match(/export function MainApp\(\) \{/);
if (mainAppMatch) {
  const insertAfter = content.indexOf('export function MainApp() {') + 'export function MainApp() {'.length;
  
  if (!content.includes('const [isErrorLogOpen, setIsErrorLogOpen]')) {
    content = content.slice(0, insertAfter) + 
      `\n  const [isErrorLogOpen, setIsErrorLogOpen] = useState(false);` +
      content.slice(insertAfter);
    console.log('✓ Added error log state');
  }
}

// Update MembersView mutations with error handling
const oldCreateMutation = `const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await axios.post(\`\${API_URL}/members\`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setIsModalOpen(false);
    }
  });`;

const newCreateMutation = `const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await axios.post(\`\${API_URL}/members\`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      addErrorLog({
        source: 'backend',
        type: 'error',
        message: 'Fehler beim Erstellen des Mitglieds',
        details: error.response?.data?.error || error.message || 'Unbekannter Fehler'
      });
    }
  });`;

if (content.includes(oldCreateMutation)) {
  content = content.replace(oldCreateMutation, newCreateMutation);
  console.log('✓ Added error handling to createMutation');
}

// Update updateMutation
const oldUpdateMutation = `const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      await axios.put(\`\${API_URL}/members/\${id}\`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', selectedMember?.id] });
    }
  });`;

const newUpdateMutation = `const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await axios.put(\`\${API_URL}/members/\${id}\`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', selectedMember?.id] });
      // Update selected member with new data
      if (selectedMember && data) {
        setSelectedMember({ ...selectedMember, ...data });
      }
    },
    onError: (error: any) => {
      addErrorLog({
        source: 'backend',
        type: 'error',
        message: 'Fehler beim Speichern des Mitglieds',
        details: error.response?.data?.error || error.message || 'Unbekannter Fehler'
      });
    }
  });`;

if (content.includes(oldUpdateMutation)) {
  content = content.replace(oldUpdateMutation, newUpdateMutation);
  console.log('✓ Added error handling to updateMutation');
}

// Update deleteMutation
const oldDeleteMutation = `const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(\`\${API_URL}/members/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setSelectedMember(null);
      setMemberToDelete(null);
    }
  });`;

const newDeleteMutation = `const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(\`\${API_URL}/members/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setSelectedMember(null);
      setMemberToDelete(null);
    },
    onError: (error: any) => {
      addErrorLog({
        source: 'backend',
        type: 'error',
        message: 'Fehler beim Löschen des Mitglieds',
        details: error.response?.data?.error || error.message || 'Unbekannter Fehler'
      });
    }
  });`;

if (content.includes(oldDeleteMutation)) {
  content = content.replace(oldDeleteMutation, newDeleteMutation);
  console.log('✓ Added error handling to deleteMutation');
}

// Add ErrorIndicator to Sidebar area - find the logout button and add error indicator before it
const sidebarArea = `onLogout={handleLogoutClick}`;
if (content.includes(sidebarArea) && !content.includes('ErrorIndicator')) {
  // Find the div containing Sidebar and add error indicator
  const returnDiv = `<div className="flex h-screen">`;
  const insertAfterIndex = content.indexOf(returnDiv) + returnDiv.length;
  
  content = content.slice(0, insertAfterIndex) + 
    `\n      {/* Error Log Panel */}
      <ErrorLogPanel isOpen={isErrorLogOpen} onClose={() => setIsErrorLogOpen(false)} />` +
    content.slice(insertAfterIndex);
  console.log('✓ Added ErrorLogPanel');
}

// Add ErrorIndicator button - find a good spot, like near the logout button
const logoutButtonArea = `<Sidebar \n        activeView={activeView} \n        onViewChange={setActiveView}\n        onLogout={handleLogoutClick}\n      />`;
const enhancedSidebar = `<div className="flex flex-col h-full">
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
          onLogout={handleLogoutClick}
        />
        <div className="p-4 border-t border-gray-200">
          <ErrorIndicator onClick={() => setIsErrorLogOpen(true)} />
        </div>
      </div>`;

if (content.includes(logoutButtonArea) && !content.includes('ErrorIndicator')) {
  content = content.replace(logoutButtonArea, enhancedSidebar);
  console.log('✓ Added ErrorIndicator to sidebar');
}

fs.writeFileSync(filePath, content);
console.log('✓ File updated successfully');
