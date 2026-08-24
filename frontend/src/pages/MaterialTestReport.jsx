import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import { PartNameSelect } from '../components/PartNameSelect';

// Import exact logo images uploaded by user
import sakthiAutoLogo from '../assets/sakthi_auto_logo.png';
import isiMarkLogo from '../assets/isi_mark_logo.png';

const MaterialTestReport = () => {
  const [partName, setPartName] = useState('');
  const [dateCode, setDateCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [processedLogo, setProcessedLogo] = useState('');

  // Form state holding all editable values for the MTR
  const [formData, setFormData] = useState({
    // Header Info
    customer: '',
    reportNo: '',
    partNameText: '',
    issueDate: '',
    partNo: '',
    specification: '',
    revNo: '',
    revDate: '',
    material: '',
    dateCodeText: '',

    // Specification thresholds
    specMinC: '', specMaxC: '',
    specMinSi: '', specMaxSi: '',
    specMinMn: '', specMaxMn: '',
    specMinP: '', specMaxP: '',
    specMinS: '', specMaxS: '',
    specMinCu: '', specMaxCu: '',
    specMinCr: '', specMaxCr: '',
    specGraphiteType: 'Type A + B (Type B:20% Max)',
    specMinSize: '3', specMaxSize: '6',
    specMinFerrite: '', specMaxFerrite: '5% Max',
    specMinHardness: '85', specMaxHardness: '98',
    specTensile: '260 (Min)',

    // Observed values
    obsMinC: '', obsMaxC: '',
    obsMinSi: '', obsMaxSi: '',
    obsMinMn: '', obsMaxMn: '',
    obsMinP: '', obsMaxP: '',
    obsMinS: '', obsMaxS: '',
    obsMinCu: '', obsMaxCu: '',
    obsMinCr: '', obsMaxCr: '',
    obsGraphiteType: '',
    obsMinSize: '', obsMaxSize: '',
    obsMinFerrite: '', obsMaxFerrite: '',
    obsMinHardness: '', obsMaxHardness: '',
    obsTensile: '',
    obsRemarks: 'O.K'
  });

  // Dynamic canvas-based image processing to strip the dark background and darken white text
  useEffect(() => {
    const img = new Image();
    img.src = sakthiAutoLogo;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        // Match the dark grey background color (around RGB 60-80)
        if (r < 100 && g < 100 && b < 100 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
          data[i+3] = 0; // Make pixel fully transparent
        } 
        // Match white and light grey text pixels, and convert them to dark grey/black
        else if (r > 150 && g > 150 && b > 150 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15) {
          data[i] = 20;
          data[i+1] = 20;
          data[i+2] = 20;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      setProcessedLogo(canvas.toDataURL());
    };
  }, []);

  const handleFetchData = async (e) => {
    e.preventDefault();
    if (!partName) return toast.error("Please select a Part Name");
    if (!dateCode) return toast.error("Please enter a Date Code");

    setLoading(true);
    try {
      const res = await axios.get('/api/reports/material-test-report', {
        params: { partName, dateCode }
      });
      const data = res.data;

      const meta = data.partMetadata || {};
      const obs = data.observedValues || {};

      const formatNum = (val) => (val !== null && val !== undefined) ? String(val) : '';

      setFormData({
        customer: meta.customer || 'MARUTI SUZUKI INDIA LTD',
        reportNo: String(data.reportNo || ''),
        partNameText: meta.name || partName,
        issueDate: data.issueDate || new Date().toISOString().split('T')[0],
        partNo: meta.partNo || '',
        specification: meta.specification || 'IS 210',
        revNo: meta.revNo || '',
        revDate: meta.revDate || '',
        material: meta.material || '',
        dateCodeText: dateCode,

        // Specifications (from DB config)
        specMinC: formatNum(meta.qcMinC), specMaxC: formatNum(meta.qcMaxC),
        specMinSi: formatNum(meta.qcMinSi), specMaxSi: formatNum(meta.qcMaxSi),
        specMinMn: formatNum(meta.qcMinMn), specMaxMn: formatNum(meta.qcMaxMn),
        specMinP: formatNum(meta.qcMinP), specMaxP: formatNum(meta.qcMaxP),
        specMinS: formatNum(meta.qcMinS), specMaxS: formatNum(meta.qcMaxS),
        specMinCu: formatNum(meta.qcMinCu), specMaxCu: formatNum(meta.qcMaxCu),
        specMinCr: formatNum(meta.qcMinCr), specMaxCr: formatNum(meta.qcMaxCr),
        specGraphiteType: 'Type A + B (Type B:20% Max)',
        specMinSize: formatNum(meta.microSizeMin) || '3', specMaxSize: formatNum(meta.microSizeMax) || '6',
        specMinFerrite: formatNum(meta.microMinFerrite) || '', specMaxFerrite: meta.microMaxFerrite ? `${meta.microMaxFerrite}% Max` : '5% Max',
        specMinHardness: '85', specMaxHardness: '98',
        specTensile: meta.tensileMinStrength ? `${meta.tensileMinStrength} (Min)` : '260 (Min)',

        // Observed values
        obsMinC: formatNum(obs.c?.min), obsMaxC: formatNum(obs.c?.max),
        obsMinSi: formatNum(obs.si?.min), obsMaxSi: formatNum(obs.si?.max),
        obsMinMn: formatNum(obs.mn?.min), obsMaxMn: formatNum(obs.mn?.max),
        obsMinP: formatNum(obs.p?.min), obsMaxP: formatNum(obs.p?.max),
        obsMinS: formatNum(obs.s?.min), obsMaxS: formatNum(obs.s?.max),
        obsMinCu: formatNum(obs.cu?.min), obsMaxCu: formatNum(obs.cu?.max),
        obsMinCr: formatNum(obs.cr?.min), obsMaxCr: formatNum(obs.cr?.max),
        obsGraphiteType: obs.graphiteType || 'Type A',
        obsMinSize: formatNum(obs.size?.min), obsMaxSize: formatNum(obs.size?.max),
        obsMinFerrite: formatNum(obs.ferritePercent?.min), obsMaxFerrite: formatNum(obs.ferritePercent?.max),
        obsMinHardness: '', obsMaxHardness: '',
        obsTensile: formatNum(obs.tensileStrength?.min || obs.tensileStrength?.max),
        obsRemarks: 'O.K'
      });
      setShowReport(true);
      toast.success("Loaded values successfully. You can now edit and generate report.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const formatRange = (min, max, suffix = '') => {
    if (!min && !max) return '—';
    if (min && max) {
      if (min === max) return `${min}${suffix}`;
      return `${min} - ${max}${suffix}`;
    }
    return min ? `>= ${min}${suffix}` : `<= ${max}${suffix}`;
  };

  return (
    <>
      <style>{`
        /* Non-printing elements */
        .mtr-search-card {
          background: #fff; border-radius: 14px; border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 22px 28px; margin-bottom: 28px;
        }
        .mtr-editor-section {
          background: #fff; border-radius: 14px; border: 1px solid #e2e8f0;
          padding: 22px 28px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .mtr-editor-title {
          font-size: 15px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #cbd5e1;
          padding-bottom: 6px; margin-bottom: 16px; margin-top: 10px;
        }

        /* Web View Preview Styles */
        .mtr-paper-container {
          background: #f1f5f9; padding: 20px; display: flex; justify-content: center;
        }
        .mtr-paper {
          background: #fff; width: 297mm; min-height: 210mm; padding: 10mm;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15); box-sizing: border-box;
          font-family: "Segoe UI", Arial, sans-serif; color: #000;
          position: relative; border: 1px solid #cbd5e1;
        }
        
        /* Double Border Layout matching physical sheet */
        .mtr-border-box {
          border: 2px solid #000; height: 100%; min-height: 185mm; padding: 5px; box-sizing: border-box;
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .mtr-inner-border {
          border: 1px solid #000; padding: 12px; height: 100%; flex-grow: 1;
          display: flex; flex-direction: column;
        }

        /* Center Header layout */
        .mtr-header-row {
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 12px;
        }

        /* Meta details table grid */
        .mtr-meta-table {
          width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 15px;
        }
        .mtr-meta-table td {
          border: 1px solid #000; padding: 4px 6px; vertical-align: top;
        }
        .mtr-meta-label { font-weight: 700; width: 14%; text-transform: uppercase; }
        .mtr-meta-val { width: 26%; }

        /* Horizontal Parameter Table */
        .mtr-values-table {
          width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 15px;
        }
        .mtr-values-table th, .mtr-values-table td {
          border: 1px solid #000; padding: 5px 3px; text-align: center; vertical-align: middle;
        }
        .mtr-values-table th { background: #f8fafc; font-weight: 800; font-size: 8.5px; text-transform: uppercase; }
        
        .text-left { text-align: left !important; padding-left: 6px !important; }

        /* Footer Declaration and Compliance info */
        .mtr-footer-declaration {
          font-size: 10px; line-height: 1.4; text-align: justify; margin-top: auto;
          padding-top: 8px; border-top: 1px solid #000; margin-bottom: 25px;
        }
        .mtr-signatures-row {
          display: flex; justify-content: space-between; align-items: flex-end;
          padding-top: 10px; font-size: 10.5px; font-weight: 700; margin-bottom: 5px;
        }
        .mtr-signature-col { text-align: center; width: 140px; }
        .mtr-signature-line { border-bottom: 1px solid #000; margin-bottom: 4px; height: 30px; }
        
        .mtr-compliance-bottom {
          display: flex; justify-content: space-between; font-size: 8px; font-weight: 600;
          color: #64748b; border-top: 1px solid #000; padding-top: 4px;
        }

        /* Printable Landscape layout */
        @media print {
          body * { visibility: hidden; }
          .mtr-print-target, .mtr-print-target * { visibility: visible; }
          .mtr-print-target {
            position: absolute; left: 0; top: 0; width: 297mm; height: 210mm;
            padding: 0; border: none; box-shadow: none;
          }
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
          .mtr-border-box {
            border: 2px solid #000 !important;
            height: 200mm;
            padding: 6px;
          }
        }
      `}</style>

      {/* Non-printing Search Panel */}
      <div className="breadcrumb no-print">
        <span className="breadcrumb-item">Home</span>
        <span className="breadcrumb-item">Reports</span>
        <span className="breadcrumb-item active">Material Test Report</span>
      </div>

      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Material Test Report (MTR)</h1>
          <p className="page-subtitle">Formulate and output the landscape test report dynamically</p>
        </div>
      </div>

      <div className="mtr-search-card no-print">
        <form onSubmit={handleFetchData}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '220px', flex: 1.5 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Part Name</label>
              <PartNameSelect value={partName} onChange={setPartName} />
            </div>
            <div style={{ minWidth: '180px', flex: 1 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Date Code</label>
              <input
                type="text"
                className="form-control"
                value={dateCode}
                onChange={(e) => setDateCode(e.target.value)}
                placeholder="e.g. 6G25"
                required
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary" style={{ height: '38px' }} disabled={loading}>
                {loading ? "Loading..." : "Load Data from DB"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading && <div style={{ padding: '40px 0', textAlign: 'center' }}><Skeleton height="400px" /></div>}

      {/* Editor Panel allowing user overrides */}
      {showReport && (
        <div className="mtr-editor-section no-print">
          <h3 className="card-title">MTR Value Verification &amp; Overrides</h3>
          <p className="text-muted" style={{ fontSize: '12px' }}>Verify and overwrite the values fetched from the database before generating the landscape layout.</p>

          <form>
            {/* Header section */}
            <div className="mtr-editor-title">Header Details</div>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Customer</label>
                <input type="text" name="customer" value={formData.customer} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="col-md-2">
                <label className="form-label">Part No</label>
                <input type="text" name="partNo" value={formData.partNo} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="col-md-2">
                <label className="form-label">Specification</label>
                <input type="text" name="specification" value={formData.specification} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="col-md-2">
                <label className="form-label">Rev No</label>
                <input type="text" name="revNo" value={formData.revNo} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="col-md-3">
                <label className="form-label">Rev Date</label>
                <input type="text" name="revDate" value={formData.revDate} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Material</label>
                <input type="text" name="material" value={formData.material} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="col-md-3">
                <label className="form-label">Report No</label>
                <input type="text" name="reportNo" value={formData.reportNo} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="col-md-3">
                <label className="form-label">Issue Date</label>
                <input type="text" name="issueDate" value={formData.issueDate} onChange={handleInputChange} className="form-control" />
              </div>
            </div>

            {/* Chemistry section */}
            <div className="mtr-editor-title">Observed Chemical Composition %</div>
            <div className="row g-3">
              {[
                { name: 'C', minKey: 'obsMinC', maxKey: 'obsMaxC' },
                { name: 'Si', minKey: 'obsMinSi', maxKey: 'obsMaxSi' },
                { name: 'Mn', minKey: 'obsMinMn', maxKey: 'obsMaxMn' },
                { name: 'P', minKey: 'obsMinP', maxKey: 'obsMaxP' },
                { name: 'S', minKey: 'obsMinS', maxKey: 'obsMaxS' },
                { name: 'Cu', minKey: 'obsMinCu', maxKey: 'obsMaxCu' },
                { name: 'Cr', minKey: 'obsMinCr', maxKey: 'obsMaxCr' },
              ].map(item => (
                <div className="col-md-3" key={item.name}>
                  <label className="form-label" style={{ fontWeight: 700 }}>{item.name} (%)</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input type="text" name={item.minKey} value={formData[item.minKey]} onChange={handleInputChange} className="form-control" placeholder="Min" />
                    <input type="text" name={item.maxKey} value={formData[item.maxKey]} onChange={handleInputChange} className="form-control" placeholder="Max" />
                  </div>
                </div>
              ))}
            </div>

            {/* Micro & Mechanical */}
            <div className="mtr-editor-title">Observed Microstructure &amp; Mechanical Properties</div>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Graphite Type</label>
                <input type="text" name="obsGraphiteType" value={formData.obsGraphiteType} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="col-md-3">
                <label className="form-label">Nodule Size (Min/Max)</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type="text" name="obsMinSize" value={formData.obsMinSize} onChange={handleInputChange} className="form-control" placeholder="Min" />
                  <input type="text" name="obsMaxSize" value={formData.obsMaxSize} onChange={handleInputChange} className="form-control" placeholder="Max" />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label">Ferrite % (Min/Max)</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type="text" name="obsMinFerrite" value={formData.obsMinFerrite} onChange={handleInputChange} className="form-control" placeholder="Min" />
                  <input type="text" name="obsMaxFerrite" value={formData.obsMaxFerrite} onChange={handleInputChange} className="form-control" placeholder="Max" />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label">Hardness (HRB) (Min/Max)</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type="text" name="obsMinHardness" value={formData.obsMinHardness} onChange={handleInputChange} className="form-control" placeholder="Min" />
                  <input type="text" name="obsMaxHardness" value={formData.obsMaxHardness} onChange={handleInputChange} className="form-control" placeholder="Max" />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">T. Strength (UTS) N/mm²</label>
                <input type="text" name="obsTensile" value={formData.obsTensile} onChange={handleInputChange} className="form-control" placeholder="Observed" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Remarks</label>
                <input type="text" name="obsRemarks" value={formData.obsRemarks} onChange={handleInputChange} className="form-control" />
              </div>
            </div>

            <div className="mtr-actions">
              <button type="button" className="btn btn-secondary" style={{ background: '#059669', color: '#fff', border: 'none' }} onClick={handlePrint}>
                Generate &amp; Print Report (Landscape)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Landscape Report Sheet View */}
      {showReport && (
        <div className="mtr-paper-container">
          <div className="mtr-paper mtr-print-target">
            <div className="mtr-border-box">
              <div className="mtr-inner-border">
                
                {/* Header block with Sakthi Auto on the left and company info in the center */}
                <div className="mtr-header-row">
                  
                  {/* Top Left: Processed Sakthi Auto Logo Image with White/Transparent background */}
                  <div style={{ width: '25%', display: 'flex', alignItems: 'center' }}>
                    {processedLogo ? (
                      <img 
                        src={processedLogo} 
                        alt="Sakthi Auto" 
                        style={{ height: '42px', width: 'auto', objectFit: 'contain' }} 
                      />
                    ) : (
                      <img 
                        src={sakthiAutoLogo} 
                        alt="Sakthi Auto" 
                        style={{ height: '42px', width: 'auto', objectFit: 'contain' }} 
                      />
                    )}
                  </div>

                  {/* Top Center: Company Name & Address */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '50%' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '0', color: '#000', letterSpacing: '0.5px' }}>
                      SAKTHI AUTO COMPONENT LIMITED
                    </h2>
                    <p style={{ fontSize: '8px', color: '#475569', fontWeight: '700', margin: '2px 0 0' }}>
                      MUKASI PALLAGOUNDENPALAYAM, UTHUKULI (TK), TIRUPPUR - 638056, TAMILNADU
                    </p>
                  </div>

                  {/* Top Right: Report No & Issue Date table */}
                  <div style={{ width: '25%', display: 'flex', justifyContent: 'flex-end' }}>
                    <table style={{ width: '150px', borderCollapse: 'collapse', fontSize: '9px' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #000', padding: '3px 5px', fontWeight: '700', textTransform: 'uppercase', background: '#f8fafc', width: '50%' }}>Report No.</td>
                          <td style={{ border: '1px solid #000', padding: '3px 5px', fontWeight: '700' }}>{formData.reportNo}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #000', padding: '3px 5px', fontWeight: '700', textTransform: 'uppercase', background: '#f8fafc' }}>Issue Date</td>
                          <td style={{ border: '1px solid #000', padding: '3px 5px', fontWeight: '700' }}>{formData.issueDate}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>

                <h4 style={{ textAlign: 'center', margin: '0 0 10px', fontWeight: 800, textDecoration: 'underline', fontSize: '13px', letterSpacing: '0.5px' }}>
                  MATERIAL TEST REPORT
                </h4>

                {/* Metadata table with merged vertical IS / CML stamp cell to eliminate gaps/blank space */}
                <table className="mtr-meta-table">
                  <tbody>
                    <tr>
                      <td className="mtr-meta-label">Customer</td>
                      <td className="mtr-meta-val"><strong>{formData.customer || '—'}</strong></td>
                      <td className="mtr-meta-label">Specification</td>
                      <td className="mtr-meta-val">{formData.specification || '—'}</td>
                      
                      {/* Integrated stamp cell to remove gap/blank space */}
                      <td rowSpan="3" style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle', padding: '5px' }}>
                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#000', letterSpacing: '0.5px', marginBottom: '2px', lineHeight: '1' }}>IS 210</div>
                        <img 
                          src={isiMarkLogo} 
                          alt="ISI Mark" 
                          style={{ height: '36px', width: 'auto', display: 'block', margin: '3px auto', objectFit: 'contain' }} 
                        />
                        <div style={{ fontSize: '7.5px', fontWeight: '800', color: '#000', whiteSpace: 'nowrap', lineHeight: '1' }}>CM/L-6500073207</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="mtr-meta-label">Part Name</td>
                      <td className="mtr-meta-val">{formData.partNameText || '—'}</td>
                      <td className="mtr-meta-label">Rev No / Date</td>
                      <td className="mtr-meta-val">
                        {formData.revNo || '—'} / {formData.revDate || '—'}
                      </td>
                    </tr>
                    <tr>
                      <td className="mtr-meta-label">Part No.</td>
                      <td className="mtr-meta-val">{formData.partNo || '—'}</td>
                      <td className="mtr-meta-label">Material</td>
                      <td className="mtr-meta-val">{formData.material || '—'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Main Horizontal Parameter Grid */}
                <table className="mtr-values-table">
                  <thead>
                    <tr>
                      <th rowSpan="2" colSpan="2" style={{ width: '14%', fontSize: '8px' }}>SPECIFICATION / OBSERVED</th>
                      <th colSpan="7">Chemical Composition %</th>
                      <th colSpan="3">Micro Structure (ASTM A247)</th>
                      <th colSpan="2">Mechanical properties</th>
                      <th rowSpan="2" style={{ width: '8%' }}>Remarks</th>
                    </tr>
                    <tr>
                      <th style={{ width: '6.5%' }}>C</th>
                      <th style={{ width: '6.5%' }}>Si</th>
                      <th style={{ width: '6.5%' }}>Mn</th>
                      <th style={{ width: '6.5%' }}>P</th>
                      <th style={{ width: '6.5%' }}>S</th>
                      <th style={{ width: '6.5%' }}>Cu</th>
                      <th style={{ width: '6.5%' }}>Cr</th>
                      <th style={{ width: '10%' }}>Graphite Type</th>
                      <th style={{ width: '6.5%' }}>Size</th>
                      <th style={{ width: '6.5%' }}>Ferrite %</th>
                      <th style={{ width: '6.5%' }}>Hardness (HRB)</th>
                      <th style={{ width: '7%' }}>T.Strength N/mm2</th>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {/* Specification Limit Row */}
                    <tr>
                      <td colSpan="2" style={{ fontWeight: '800', background: '#f8fafc', fontSize: '8px' }}>SPECIFICATION</td>
                      <td>{formatRange(formData.specMinC, formData.specMaxC)}</td>
                      <td>{formatRange(formData.specMinSi, formData.specMaxSi)}</td>
                      <td>{formatRange(formData.specMinMn, formData.specMaxMn)}</td>
                      <td>{formatRange(formData.specMinP, formData.specMaxP)}</td>
                      <td>{formatRange(formData.specMinS, formData.specMaxS)}</td>
                      <td>{formatRange(formData.specMinCu, formData.specMaxCu)}</td>
                      <td>{formatRange(formData.specMinCr, formData.specMaxCr)}</td>
                      <td style={{ fontSize: '8px' }}>{formData.specGraphiteType || '—'}</td>
                      <td>{formatRange(formData.specMinSize, formData.specMaxSize)}</td>
                      <td>{formData.specMaxFerrite || '—'}</td>
                      <td>{formatRange(formData.specMinHardness, formData.specMaxHardness)}</td>
                      <td>{formData.specTensile || '—'}</td>
                      <td style={{ color: '#64748b' }}>----</td>
                    </tr>

                    {/* Observed Row: Min */}
                    <tr>
                      <td rowSpan="2" style={{ fontWeight: '800', verticalAlign: 'middle', width: '8%', fontSize: '8px' }}>
                        OBSERVED VALUE
                      </td>
                      <td style={{ fontWeight: '700', width: '6%' }}>Min</td>
                      <td>{formData.obsMinC || '—'}</td>
                      <td>{formData.obsMinSi || '—'}</td>
                      <td>{formData.obsMinMn || '—'}</td>
                      <td>{formData.obsMinP || '—'}</td>
                      <td>{formData.obsMinS || '—'}</td>
                      <td>{formData.obsMinCu || '—'}</td>
                      <td>{formData.obsMinCr || '—'}</td>
                      
                      {/* Graphite Type Observed */}
                      <td rowSpan="2" style={{ verticalAlign: 'middle' }}>{formData.obsGraphiteType || '—'}</td>
                      
                      <td>{formData.obsMinSize || '—'}</td>
                      <td>{formData.obsMinFerrite || '—'}</td>
                      <td>{formData.obsMinHardness || '—'}</td>
                      
                      {/* Tensile Strength Observed */}
                      <td rowSpan="2" style={{ fontWeight: '700', verticalAlign: 'middle' }}>{formData.obsTensile || '—'}</td>
                      
                      {/* Remarks Observed */}
                      <td rowSpan="2" style={{ fontWeight: '800', color: '#16a34a', verticalAlign: 'middle' }}>
                        {formData.obsRemarks || '—'}
                      </td>
                    </tr>

                    {/* Observed Row: Max */}
                    <tr>
                      <td style={{ fontWeight: '700' }}>Max</td>
                      <td>{formData.obsMaxC || '—'}</td>
                      <td>{formData.obsMaxSi || '—'}</td>
                      <td>{formData.obsMaxMn || '—'}</td>
                      <td>{formData.obsMaxP || '—'}</td>
                      <td>{formData.obsMaxS || '—'}</td>
                      <td>{formData.obsMaxCu || '—'}</td>
                      <td>{formData.obsMaxCr || '—'}</td>
                      <td>{formData.obsMaxSize || '—'}</td>
                      <td>{formData.obsMaxFerrite || '—'}</td>
                      <td>{formData.obsMaxHardness || '—'}</td>
                    </tr>

                  </tbody>
                </table>

                {/* Declaration Statement */}
                <div className="mtr-footer-declaration">
                  We certified that the material described above fully conforms to <strong>{formData.specification || 'IS 210:2009'}</strong> chemical composition and physical properties of the product, as tested in accordance with the scheme of inspection and Testing contained in the BIS certification marks Licence No.CM/L-6500073207
                </div>

                {/* Signatures */}
                <div className="mtr-signatures-row">
                  <div className="mtr-signature-col">
                    <div className="mtr-signature-line" />
                    <div>CHECKED BY</div>
                  </div>
                  <div className="mtr-signature-col">
                    <div className="mtr-signature-line" />
                    <div>APPROVED BY</div>
                  </div>
                </div>

              </div>

              {/* Bottom compliance details */}
              <div className="mtr-compliance-bottom">
                <span>QF/08/FYQ-21 ,Rev.No.: 01 dt 01.10.2024</span>
                <span>SAKTHI AUTO COMPONENT LIMITED - QUALITY MANAGEMENT SYSTEM</span>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialTestReport;
