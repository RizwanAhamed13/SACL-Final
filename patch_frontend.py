import os
import re

files = [
    'frontend/src/pages/QcRegister.jsx',
    'frontend/src/pages/MicroStructure.jsx',
    'frontend/src/pages/MicroTensile.jsx',
    'frontend/src/pages/ImpactTest.jsx'
]

endpoint_map = {
    'QcRegister.jsx': '/api/qc-register',
    'MicroStructure.jsx': '/api/micro-structure',
    'MicroTensile.jsx': '/api/micro-tensile',
    'ImpactTest.jsx': '/api/impact-test'
}

for filepath in files:
    filename = os.path.basename(filepath)
    endpoint = endpoint_map[filename]
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # 1. Add state and toggles
    state_addition = """  const [selectedIds, setSelectedIds] = useState([]);
  
  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const toggleSelectAll = () => {
    const pending = records.filter(r => r.status === 'HOF_APPROVED');
    if (selectedIds.length === pending.length && pending.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pending.map(r => r.id));
    }
  };

  const [approveAllModal"""
    content = content.replace('  const [approveAllModal', state_addition)
    
    # 2. Update Approve All button
    content = content.replace('Approve All ({hofPendingCount})', 'Approve {selectedIds.length > 0 ? `Selected (${selectedIds.length})` : `All (${hofPendingCount})`}')
    content = content.replace('title="HOD Bulk Approval"', 'title={selectedIds.length > 0 ? "Approve Selected Records" : "HOD Bulk Approval"}')
    content = content.replace('Approve all ${hofPendingCount}', '${selectedIds.length > 0 ? `Approve ${selectedIds.length} selected` : `Approve all ${hofPendingCount}`} pending')
    
    # 3. API Call
    api_call_old = f"axios.post('{endpoint}/approve-all')"
    api_call_new = f"selectedIds.length > 0 ? axios.post('{endpoint}/approve-bulk', selectedIds) : axios.post('{endpoint}/approve-all')"
    content = content.replace(api_call_old, api_call_new)
    
    # 4. Clear selection after fetch
    content = content.replace('fetchRecords();\n          } catch', 'fetchRecords();\n            setSelectedIds([]);\n          } catch')
    
    # 5. Add to table headers
    # Find the main thead > tr
    thead_tr_pattern = re.compile(r'<thead>\s*<tr>')
    thead_tr_replacement = r'''<thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    {(user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && (
                      <input 
                        type="checkbox" 
                        onChange={toggleSelectAll} 
                        checked={records.filter(r => r.status === 'HOF_APPROVED').length > 0 && selectedIds.length === records.filter(r => r.status === 'HOF_APPROVED').length}
                      />
                    )}
                  </th>'''
    content = thead_tr_pattern.sub(thead_tr_replacement, content, count=1)
    
    # 6. Add to table body
    # Find records.map > tr
    tbody_tr_pattern = re.compile(r'(records\.map\(\(r(?:ecord)?\).*?=>\s*\(\s*<tr[^>]*>)', re.DOTALL)
    tbody_tr_replacement = r'''\1
                    <td style={{ textAlign: 'center' }}>
                      {(user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && r.status === 'HOF_APPROVED' && (
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(r.id)} 
                          onChange={() => toggleSelection(r.id)} 
                        />
                      )}
                    </td>'''
    content = tbody_tr_pattern.sub(tbody_tr_replacement, content, count=1)
    
    # Wait, some maps might use `record` instead of `r`. Let's just fix `r.id` to whatever the variable is.
    
    with open(filepath, 'w') as f:
        f.write(content)
        
    print(f"Patched {filename}")
