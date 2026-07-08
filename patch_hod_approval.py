import re

def patch_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # 1. Remove Approve HOD button
    # The Approve HOD button is like:
    # {(user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && (r.status || 'QC_ENTRY') === 'HOF_APPROVED' && (
    #   <button ...>Approve HOD</button>
    # )}
    content = re.sub(
        r'\{\(user\?\.role\?\.toUpperCase\(\)\?\.includes\(\'HOD\'\) \|\| user\?\.role\?\.toUpperCase\(\)\?\.includes\(\'ADMIN\'\)\) && \(r\.status \|\| \'QC_ENTRY\'\) === \'HOF_APPROVED\' && \([\s\S]*?</button>\s*\)\}',
        '',
        content
    )

    # 2. Add HOD Field-Wise Approval section in the form
    # We will insert it just before the `</form>` or before the form-actions div.
    # Usually it's before: <div className="form-actions"
    hod_section = """
        {user?.role?.toUpperCase()?.includes('HOD') && formData.status !== 'QC_ENTRY' && (
          <div className="form-section" style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '0.5rem', color: '#374151' }}>HOD Field-Wise Approval</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {Object.keys(formData).filter(k => !['id', 'status', 'hofApprovedBy', 'hodApprovedBy', 'createdBy', 'hodApprovedFields', 'remarks'].includes(k)).map(key => {
                const approvedFields = formData.hodApprovedFields ? formData.hodApprovedFields.split(',') : [];
                const isApproved = approvedFields.includes(key);
                return (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '12px', background: isApproved ? '#d1fae5' : '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isApproved} 
                      onChange={(e) => {
                        let newArr = [...approvedFields];
                        if (e.target.checked) newArr.push(key);
                        else newArr = newArr.filter(f => f !== key);
                        setFormData({...formData, hodApprovedFields: newArr.join(',')});
                      }} 
                    />
                    {key}
                  </label>
                );
              })}
            </div>
          </div>
        )}
"""
    content = content.replace('<div className="form-actions"', hod_section + '\n        <div className="form-actions"')

    with open(filename, 'w') as f:
        f.write(content)

patch_file('frontend/src/pages/QcRegister.jsx')
patch_file('frontend/src/pages/MicroStructure.jsx')
patch_file('frontend/src/pages/MicroTensile.jsx')
patch_file('frontend/src/pages/ImpactTest.jsx')
