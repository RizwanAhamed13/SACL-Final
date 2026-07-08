import re

def patch_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Find the block inside handleConfirmSave:
    # if (formData.id) {
    #   await axios.put(`/api/qc-register/${formData.id}`, formData);
    
    # We will inject logic to update the status to HOD_APPROVED if user is HOD.
    
    replace_logic = """      if (formData.id) {
        let payload = formData;
        if (user?.role?.toUpperCase()?.includes('HOD') && formData.status === 'HOF_APPROVED') {
          payload = { ...formData, status: 'HOD_APPROVED', hodApprovedBy: user.employeeId || user.fullName };
        }
        await axios.put(`/api/"""
        
    if "qc-register" in filename:
        api_path = "qc-register"
    elif "MicroStructure" in filename:
        api_path = "micro-structure"
    elif "MicroTensile" in filename:
        api_path = "micro-tensile"
    elif "ImpactTest" in filename:
        api_path = "impact-test"

    content = content.replace(
        f"if (formData.id) {{\n        await axios.put(`/api/{api_path}/${{formData.id}}`, formData);",
        replace_logic + f"{api_path}/${{formData.id}}`, payload);"
    )
    
    with open(filename, 'w') as f:
        f.write(content)

patch_file('frontend/src/pages/QcRegister.jsx')
patch_file('frontend/src/pages/MicroStructure.jsx')
patch_file('frontend/src/pages/MicroTensile.jsx')
patch_file('frontend/src/pages/ImpactTest.jsx')
