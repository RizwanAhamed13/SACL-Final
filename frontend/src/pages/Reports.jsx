import React, { useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Skeleton from '../components/Skeleton';
import { PartNameSelect } from '../components/PartNameSelect';

// ─────────────────────────────────────────────────────────────
// Excel styling helpers
// ─────────────────────────────────────────────────────────────

/** "#1e3a5f" → "FF1E3A5F" */
const hexToArgb = (hex) => 'FF' + hex.replace('#', '').toUpperCase();

/** Scan every cell to compute comfortable column widths */
const autoFitColumns = (rows) => {
  if (!rows || rows.length === 0) return [];
  const colCount = Math.max(...rows.map((r) => r.length));
  const widths = Array(colCount).fill(10);
  rows.forEach((row) => {
    row.forEach((cell, ci) => {
      const len = cell != null ? String(cell).length : 0;
      if (len + 4 > widths[ci]) widths[ci] = len + 4;
    });
  });
  return widths.map((w) => ({ wch: Math.min(w, 52) }));
};

/** Bold coloured header row */
const styleHeaderRow = (ws, rowIdx, colCount, bgHex, fgHex) => {
  for (let c = 0; c < colCount; c++) {
    const addr = XLSX.utils.encode_cell({ r: rowIdx, c });
    if (!ws[addr]) ws[addr] = { t: 's', v: '' };
    ws[addr].s = {
      fill: { patternType: 'solid', fgColor: { argb: hexToArgb(bgHex) } },
      font: { bold: true, sz: 10, color: { argb: hexToArgb(fgHex) }, name: 'Segoe UI' },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
      border: {
        bottom: { style: 'medium', color: { argb: hexToArgb(fgHex) } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      },
    };
  }
};

/** Alternating zebra rows */
const styleDataRows = (ws, startRow, endRow, colCount, accentHex) => {
  for (let r = startRow; r <= endRow; r++) {
    const isOdd = (r - startRow) % 2 === 1;
    for (let c = 0; c < colCount; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { t: 's', v: '' };
      ws[addr].s = {
        fill: isOdd
          ? { patternType: 'solid', fgColor: { argb: hexToArgb(accentHex) } }
          : { patternType: 'none' },
        font: { sz: 9, name: 'Segoe UI' },
        alignment: { vertical: 'center' },
        border: {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        },
      };
    }
  }
};

/** Section title banner row */
const styleTitleRow = (ws, rowIdx, colCount, bgHex) => {
  for (let c = 0; c < colCount; c++) {
    const addr = XLSX.utils.encode_cell({ r: rowIdx, c });
    if (!ws[addr]) ws[addr] = { t: 's', v: '' };
    ws[addr].s = {
      fill: { patternType: 'solid', fgColor: { argb: hexToArgb(bgHex) } },
      font: {
        bold: true, sz: c === 0 ? 13 : 11,
        color: { argb: 'FFFFFFFF' }, name: 'Segoe UI',
      },
      alignment: { horizontal: c === 0 ? 'left' : 'center', vertical: 'center' },
    };
  }
};

// ─────────────────────────────────────────────────────────────
// Section definitions — full column names, keys, theme colours
// ─────────────────────────────────────────────────────────────

const QC_HEADERS = [
  'ID', 'Part Name', 'Date', 'Heat Code', 'Date Code', 'Disa', 'Moulds',
  'C %', 'Si %', 'Mn %', 'P %', 'S %', 'Mg First %', 'Mg Last %', 'Cu %', 'Cr %', 'Sn %',
  'Pour Start', 'Pour End', 'Temp (°C)', 'PP Code', 'Treatment No', 'FC No / Heat No', 'Con No',
  'Tapping Time', 'Tapping Wt (kg)',
  'Corr C', 'Corr Si', 'Corr Mn', 'Corr S', 'Corr Cr', 'Corr Cu', 'Corr Sn',
  'Mg (kg)', 'Res Mg %', 'Rec Mg %', 'Stream Inoculant', 'P Time (sec)',
  'Remarks'
];
const QC_KEYS = [
  'id', 'partName', 'date', 'heatCode', 'dateCode', 'disa', 'qtyMoulds',
  'compositionC', 'compositionSi', 'compositionMn', 'compositionP', 'compositionS',
  'compositionMgFirst', 'compositionMgLast', 'compositionCu', 'compositionCr', 'compositionSn',
  'timeOfPouringStart', 'timeOfPouringEnd', (r) => (r.pouringTempStart || r.pouringTempEnd) ? `${r.pouringTempStart || '-'} - ${r.pouringTempEnd || '-'}` : r.pouringTemp, 'ppCode', 'treatmentNo', 'fcNoHeatNo', 'conNo',
  'tappingTime', 'tappingWtKgs',
  'correctiveC', 'correctiveSi', 'correctiveMn', 'correctiveS',
  'correctiveCr', 'correctiveCu', 'correctiveSn',
  'mgKgs', 'resMgConvertorPercent', 'recMgPercent', 'streamInnoculant', (r) => (r.pTimeSecStart || r.pTimeSecEnd) ? `${r.pTimeSecStart || '-'} - ${r.pTimeSecEnd || '-'}` : (r.pTimeSec ?? r.ptimeSec),
  'remarks'
];

const MICRO_HEADERS = [
  'ID', 'Part Name', 'Inspection Date', 'Heat Code', 'Date Code', 'Location',
  'Nodularity %', 'Graphite Type', 'Count (nos/mm²)',
  'Ferrite Min %', 'Ferrite Max %', 'Pearlite Min %', 'Pearlite Max %', 'Carbide Min %', 'Carbide Max %',
  'Size Min', 'Size Max', 'Remarks'
];
const MICRO_KEYS = [
  'id', 'partName', 'inspectionDate', 'heatCode', 'dateCode', (r) => r.location || r.microLocation,
  'nodularityPercent', 'graphiteType', 'countNosPerMm2',
  'ferritePercentMin', 'ferritePercentMax', 'pearlitePercentMin', 'pearlitePercentMax', 'carbidePercentMin', 'carbidePercentMax',
  'sizeMin', 'sizeMax', 'remarks'
];

const TENSILE_HEADERS = [
  'ID', 'Item', 'Inspection Date', 'Heat Code', 'Date Code', 'Location',
  'Bar Dia (mm)', 'Gauge Length (mm)', 'Max Load (kN)', 'Yield Load (kN)',
  'Tensile Strength', 'Yield Strength 0.2 %', 'Yield Strength 0.5 %', 'Elongation %',
  'Remarks'
];
const TENSILE_KEYS = [
  'id', 'item', 'dateOfInspection', 'heatCode', 'dateCode', (r) => r.location || r.mechLocation,
  'barDiaMm', 'gaugeLengthMm', 'maxLoadKn', 'yieldLoadKn',
  'tensileStrength', 'yieldStrength02', 'yieldStrength05', 'elongationPercent',
  'remarks'
];

const IMPACT_HEADERS = [
  'ID', 'Part Name', 'Inspection Date', 'Date Code', 'Location', 'Notch Type',
  'Observed Value 1 (J)', 'Observed Value 2 (J)', 'Observed Value 3 (J)',
  'Remarks'
];
const IMPACT_KEYS = [
  'id', 'partName', 'dateOfInspection', 'dateCode', (r) => r.location || r.mechLocation, 'notchType',
  'observedValue1', 'observedValue2', 'observedValue3',
  'remarks'
];

const THEMES = {
  qc: { bg: '#1e3a5f', fg: '#e0f0ff', rowTint: '#eef4fb' },
  micro: { bg: '#134e4a', fg: '#ccfbf1', rowTint: '#edfaf7' },
  tensile: { bg: '#78350f', fg: '#fef3c7', rowTint: '#fdf8ee' },
  impact: { bg: '#3b0764', fg: '#f3e8ff', rowTint: '#f6f0fd' },
};

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const getRecordValue = (record, key) => {
  const value = typeof key === 'function' ? key(record) : record[key];
  return (value != null && value !== '') ? value : '—';
};

// Expand records with locationValues JSON into multiple rows (one per location)
const expandLocationValues = (records, type) => {
  if (!records) return [];
  const expanded = [];
  records.forEach(r => {
    if (!r.locationValues) {
      expanded.push(r);
      return;
    }
    try {
      // BUG-008: Guard against malformed JSON — fall back to showing the record as-is
      let locValues;
      try {
        locValues = typeof r.locationValues === 'string' ? JSON.parse(r.locationValues) : r.locationValues;
      } catch {
        expanded.push(r);
        return;
      }
      if (!isObject(locValues)) { expanded.push(r); return; }
      Object.entries(locValues).forEach(([location, data]) => {
        if (type === 'impact') {
          if (!isObject(data)) {
            expanded.push({ ...r, location });
            return;
          }

          if ('v1' in data || 'v2' in data || 'v3' in data) {
            expanded.push({
              ...r,
              location,
              notchType: r.notchType || '—',
              observedValue1: data.v1,
              observedValue2: data.v2,
              observedValue3: data.v3,
            });
            return;
          }

          // Impact Test may have location × notch structure:
          // {TRA: {Unotch: {v1, v2, v3}, Vnotch: {...}}, ...}
          Object.entries(data).forEach(([notch, values]) => {
            if (!isObject(values)) return;
            expanded.push({
              ...r,
              location,
              notchType: notch,
              observedValue1: values.v1,
              observedValue2: values.v2,
              observedValue3: values.v3,
            });
          });
        } else {
          // Micro/Tensile have flat location structure: {TRA: {...fields...}, SBA: {...fields...}}
          expanded.push({
            ...r,
            location,
            ...data,
          });
        }
      });
    } catch (e) {
      expanded.push(r);
    }
  });
  return expanded;
};

// ─────────────────────────────────────────────────────────────
// Build one fully-styled worksheet for a single section
// ─────────────────────────────────────────────────────────────

const buildStyledSheet = (data, title, headers, keys, theme) => {
  const safe = data || [];
  const cols = headers.length;

  const titleRow = [title, ...Array(cols - 1).fill('')];
  const blankRow = Array(cols).fill('');
  const headerRow = [...headers];
  const dataRows = safe.length > 0
    ? safe.map((r) => keys.map((k) => getRecordValue(r, k)))
    : [['No records found.', ...Array(cols - 1).fill('')]];

  const allRows = [titleRow, blankRow, headerRow, ...dataRows];

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws['!cols'] = autoFitColumns(allRows);
  ws['!rows'] = [{ hpt: 28 }, { hpt: 6 }, { hpt: 22 }, ...dataRows.map(() => ({ hpt: 18 }))];

  styleTitleRow(ws, 0, cols, theme.bg);
  styleHeaderRow(ws, 2, cols, theme.bg, theme.fg);
  if (dataRows.length) styleDataRows(ws, 3, 3 + dataRows.length - 1, cols, theme.rowTint);

  return ws;
};

// ─────────────────────────────────────────────────────────────
// Build combined sheet (all sections stacked, each coloured)
// ─────────────────────────────────────────────────────────────

const buildCombinedSheet = (results) => {
  const sections = [
    { label: '1. QC REGISTER DATA', data: results.qcRegister, headers: QC_HEADERS, keys: QC_KEYS, theme: THEMES.qc },
    { label: '2. MICRO STRUCTURE DATA', data: results.microStructure, headers: MICRO_HEADERS, keys: MICRO_KEYS, theme: THEMES.micro },
    { label: '3. TENSILE TEST DATA', data: results.microTensile, headers: TENSILE_HEADERS, keys: TENSILE_KEYS, theme: THEMES.tensile },
    { label: '4. IMPACT TEST DATA', data: results.impactTest, headers: IMPACT_HEADERS, keys: IMPACT_KEYS, theme: THEMES.impact },
  ];
  const maxCols = Math.max(...sections.map((s) => s.headers.length));

  const allRows = [];
  const styleMap = [];

  sections.forEach(({ label, data, headers, keys, theme }) => {
    const safe = data || [];
    const cols = headers.length;

    styleMap.push({ rowIdx: allRows.length, type: 'title', theme, colCount: maxCols });
    allRows.push([label, ...Array(maxCols - 1).fill('')]);

    allRows.push(Array(maxCols).fill(''));   // blank spacer

    styleMap.push({ rowIdx: allRows.length, type: 'header', theme, colCount: cols });
    allRows.push([...headers, ...Array(maxCols - cols).fill('')]);

    const dataRows = safe.length > 0
      ? safe.map((r) => {
        const vals = keys.map((k) => getRecordValue(r, k));
        return [...vals, ...Array(maxCols - cols).fill('')];
      })
      : [['No records found.', ...Array(maxCols - 1).fill('')]];

    styleMap.push({ rowIdx: allRows.length, type: 'data', theme, colCount: maxCols, count: dataRows.length });
    dataRows.forEach((dr) => allRows.push(dr));

    allRows.push(Array(maxCols).fill(''));
    allRows.push(Array(maxCols).fill(''));
  });

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws['!cols'] = autoFitColumns(allRows);
  ws['!rows'] = allRows.map(() => ({ hpt: 18 }));

  styleMap.forEach(({ rowIdx, type, theme, colCount, count }) => {
    if (type === 'title') { styleTitleRow(ws, rowIdx, colCount, theme.bg); ws['!rows'][rowIdx] = { hpt: 26 }; }
    if (type === 'header') styleHeaderRow(ws, rowIdx, colCount, theme.bg, theme.fg);
    if (type === 'data' && count) styleDataRows(ws, rowIdx, rowIdx + count - 1, colCount, theme.rowTint);
  });

  return ws;
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const Reports = () => {
  const [searchParams, setSearchParams] = useState({ partName: '', dateCode: '', heatCode: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get('/api/reports/search', { params: searchParams });
      const approvedResults = {
        qcRegister: res.data.qcRegister,
        microStructure: expandLocationValues(res.data.microStructure, 'micro'),
        microTensile: expandLocationValues(res.data.microTensile, 'tensile'),
        impactTest: expandLocationValues(res.data.impactTest, 'impact')
      };
      setResults(approvedResults);
    } catch {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  /** Download All — Combined sheet + 4 individual sheets */
  const exportAllToExcel = () => {
    if (!results) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, buildCombinedSheet(results), 'Combined Report');
    XLSX.utils.book_append_sheet(wb, buildStyledSheet(results.qcRegister, '1. QC REGISTER DATA', QC_HEADERS, QC_KEYS, THEMES.qc), 'QC Register');
    XLSX.utils.book_append_sheet(wb, buildStyledSheet(results.microStructure, '2. MICRO STRUCTURE DATA', MICRO_HEADERS, MICRO_KEYS, THEMES.micro), 'Micro Structure');
    XLSX.utils.book_append_sheet(wb, buildStyledSheet(results.microTensile, '3. TENSILE TEST DATA', TENSILE_HEADERS, TENSILE_KEYS, THEMES.tensile), 'Tensile Test');
    XLSX.utils.book_append_sheet(wb, buildStyledSheet(results.impactTest, '4. IMPACT TEST DATA', IMPACT_HEADERS, IMPACT_KEYS, THEMES.impact), 'Impact Test');
    XLSX.writeFile(wb, `Sakthi_Autos_Quality_Report_${new Date().toISOString().split('T')[0]}.xlsx`, { cellStyles: true });
  };

  /** Download individual section */
  const exportSingle = (data, fileName, title, headers, keys, theme) => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, buildStyledSheet(data, title, headers, keys, theme), 'Sheet1');
    XLSX.writeFile(wb, `${fileName}.xlsx`, { cellStyles: true });
  };

  const dash = (val) => (val !== null && val !== undefined && val !== '') ? val : '—';

  const DlIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  return (
    <>
      <style>{`
        .rpt-page-title { font-size:1.55rem; font-weight:800; color:#0f172a; letter-spacing:-0.3px; margin:0; }
        .rpt-page-sub   { color:#64748b; font-size:0.82rem; margin:3px 0 0; }

        .rpt-search-card {
          background:#fff; border-radius:14px; border:1px solid #e2e8f0;
          box-shadow:0 2px 8px rgba(0,0,0,0.06); padding:22px 28px; margin-bottom:28px;
        }
        .rpt-field-label {
          font-weight:700; color:#475569; font-size:0.68rem;
          text-transform:uppercase; letter-spacing:0.07em; margin-bottom:6px; display:block;
        }
        .rpt-input {
          height:40px; border-radius:8px; border:1.5px solid #cbd5e1;
          font-size:0.85rem; padding:0 12px; width:100%; outline:none;
          transition:border-color 0.2s; color:#0f172a; background:#f8fafc;
        }
        .rpt-input:focus { border-color:#f97316; background:#fff; box-shadow:0 0 0 3px rgba(249,115,22,0.12); }

        .btn-search {
          background:linear-gradient(135deg,#f97316,#ea580c); border:none; color:#fff;
          font-weight:700; height:40px; padding:0 24px; border-radius:8px; font-size:0.85rem;
          display:inline-flex; align-items:center; gap:7px; cursor:pointer;
          box-shadow:0 2px 8px rgba(249,115,22,0.35); transition:all 0.2s; white-space:nowrap;
        }
        .btn-search:hover { background:linear-gradient(135deg,#ea580c,#c2410c); transform:translateY(-1px); }
        .btn-search:disabled { opacity:0.7; cursor:not-allowed; }

        .btn-download-all {
          background:linear-gradient(135deg,#10b981,#059669); border:none; color:#fff;
          font-weight:700; height:40px; padding:0 20px; border-radius:8px; font-size:0.82rem;
          display:inline-flex; align-items:center; gap:7px; cursor:pointer;
          box-shadow:0 2px 8px rgba(16,185,129,0.35); transition:all 0.2s; white-space:nowrap;
        }
        .btn-download-all:hover { background:linear-gradient(135deg,#059669,#047857); transform:translateY(-1px); }

        .btn-xls {
          background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none;
          padding:7px 16px; border-radius:7px; font-size:0.75rem; font-weight:700;
          display:inline-flex; align-items:center; gap:6px; cursor:pointer;
          box-shadow:0 1px 4px rgba(16,185,129,0.3); transition:all 0.2s;
        }
        .btn-xls:hover { background:linear-gradient(135deg,#059669,#047857); }

        .rpt-card {
          background:#fff; border-radius:14px; border:1px solid #e2e8f0;
          box-shadow:0 2px 8px rgba(0,0,0,0.06); margin-bottom:28px; overflow:hidden;
        }
        .rpt-section-header {
          padding:14px 22px; display:flex; justify-content:space-between;
          align-items:center; border-bottom:2px solid #e2e8f0;
        }
        .rpt-section-title {
          font-size:0.88rem; font-weight:800; color:#0f172a;
          margin:0; display:flex; align-items:center; gap:10px;
        }
        .rpt-count-badge { font-size:0.72rem; font-weight:700; padding:2px 10px; border-radius:20px; }

        .rpt-table-wrap { overflow:auto; max-height:420px; }
        .rpt-table      { width:100%; border-collapse:collapse; font-size:0.775rem; white-space:nowrap; }
        .rpt-table td   {
          padding:10px 16px; border-bottom:1px solid #f1f5f9;
          border-right:1px solid #f1f5f9; color:#334155; vertical-align:middle;
        }
        .rpt-table tr:last-child td { border-bottom:none; }
        .rpt-table tr:hover td      { background:#f8fafc; }
        .rpt-table td:first-child   { font-weight:700; color:#0f172a; }
        .rpt-table td.part-name     { color:#2563eb; font-weight:600; }
        .rpt-table th {
          padding:11px 16px; text-align:left; white-space:nowrap;
          font-size:0.72rem; font-weight:700; letter-spacing:0.04em;
          text-transform:uppercase; position:sticky; top:0; z-index:10;
        }

        .th-qc      { background:#1e3a5f; color:#e0f0ff; border-right:1px solid #2a4d78; }
        .th-micro   { background:#134e4a; color:#ccfbf1; border-right:1px solid #1a6560; }
        .th-tensile { background:#78350f; color:#fef3c7; border-right:1px solid #92400e; }
        .th-impact  { background:#3b0764; color:#f3e8ff; border-right:1px solid #4c1d95; }

        .rpt-accent-bar { height:4px; width:100%; }
        .accent-qc      { background:#1e3a5f; }
        .accent-micro   { background:#134e4a; }
        .accent-tensile { background:#78350f; }
        .accent-impact  { background:#3b0764; }

        .badge-qc      { background:#dbeafe; color:#1e3a5f; }
        .badge-micro   { background:#ccfbf1; color:#134e4a; }
        .badge-tensile { background:#fef3c7; color:#78350f; }
        .badge-impact  { background:#f3e8ff; color:#3b0764; }

        .status-badge  { padding:3px 10px; border-radius:20px; font-size:0.7rem; font-weight:700; }
        .status-blue   { background:#dbeafe; color:#1e40af; }
        .status-green  { background:#d1fae5; color:#065f46; }
        .status-amber  { background:#fef3c7; color:#92400e; }
        .status-purple { background:#ede9fe; color:#5b21b6; }

        .rpt-empty { text-align:center; padding:28px; color:#94a3b8; font-size:0.82rem; font-style:italic; }

        .search-row     { display:flex; align-items:flex-end; gap:16px; flex-wrap:wrap; }
        .search-field   { display:flex; flex-direction:column; }
        .search-field-sm{ min-width:160px; flex:1; }
        .search-field-md{ min-width:200px; flex:1.3; }
        .search-actions { display:flex; align-items:flex-end; gap:10px; margin-left:auto; flex-shrink:0; }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="rpt-page-title">Quality Logging &amp; Reporting</h1>
        <p className="rpt-page-sub">Cross-module data search and Excel extraction engine</p>
      </div>

      {/* Search Card */}
      <div className="rpt-search-card">
        <form onSubmit={handleSearch}>
          <div className="search-row">
            <div className="search-field search-field-md">
              <span className="rpt-field-label">Part Name</span>
              <PartNameSelect
                value={searchParams.partName}
                onChange={(val) => setSearchParams({ ...searchParams, partName: val })}
              />
            </div>
            <div className="search-field search-field-sm">
              <span className="rpt-field-label">Date Code</span>
              <input type="text" className="rpt-input" value={searchParams.dateCode}
                onChange={(e) => setSearchParams({ ...searchParams, dateCode: e.target.value })}
                placeholder="e.g. 6D08" />
            </div>
            <div className="search-field search-field-sm">
              <span className="rpt-field-label">Heat Code</span>
              <input type="text" className="rpt-input" value={searchParams.heatCode}
                onChange={(e) => setSearchParams({ ...searchParams, heatCode: e.target.value })}
                placeholder="e.g. H240130" />
            </div>
            <div className="search-actions">
              <button type="submit" className="btn-search" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Search
                </>}
              </button>
              {results && (
                <button type="button" className="btn-download-all" onClick={exportAllToExcel}>
                  <DlIcon /> Download All
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {loading && <div style={{ padding: '40px 0', textAlign: 'center' }}><Skeleton height="400px" /></div>}

      {results && (<div>

        {/* 1. QC REGISTER */}
        <div className="rpt-card">
          <div className="rpt-accent-bar accent-qc" />
          <div className="rpt-section-header" style={{ background: '#f8fafc' }}>
            <h6 className="rpt-section-title">
              1. QC Register <span className="rpt-count-badge badge-qc">{results.qcRegister.length} records</span>
            </h6>
            <button className="btn-xls"
              onClick={() => exportSingle(results.qcRegister, 'QC_Register_Full', '1. QC REGISTER DATA', QC_HEADERS, QC_KEYS, THEMES.qc)}>
              <DlIcon /> Download Excel
            </button>
          </div>
          <div className="rpt-table-wrap">
            <table className="rpt-table">
              <thead><tr>{QC_HEADERS.map(h => <th key={h} className="th-qc">{h}</th>)}</tr></thead>
              <tbody>
                {results.qcRegister.length === 0
                  ? <tr><td colSpan={QC_HEADERS.length} className="rpt-empty">No records found.</td></tr>
                  : results.qcRegister.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td><td className="part-name">{r.partName}</td><td>{r.date}</td>
                      <td style={{ fontWeight: 700 }}>{r.heatCode}</td><td>{r.dateCode}</td>
                      <td>{r.disa}</td><td>{r.qtyMoulds}</td>
                      <td>{dash(r.compositionC)}</td><td>{dash(r.compositionSi)}</td><td>{dash(r.compositionMn)}</td>
                      <td>{dash(r.compositionP)}</td><td>{dash(r.compositionS)}</td>
                      <td>{dash(r.compositionMgFirst)}</td><td>{dash(r.compositionMgLast)}</td>
                      <td>{dash(r.compositionCu)}</td><td>{dash(r.compositionCr)}</td><td>{dash(r.compositionSn)}</td>
                      <td>{dash(r.timeOfPouringStart)}</td><td>{dash(r.timeOfPouringEnd)}</td><td>{r.pouringTempStart || r.pouringTempEnd ? `${dash(r.pouringTempStart)} - ${dash(r.pouringTempEnd)}` : dash(r.pouringTemp)}</td>
                      <td>{dash(r.ppCode)}</td><td>{dash(r.treatmentNo)}</td>
                      <td>{dash(r.fcNoHeatNo)}</td><td>{dash(r.conNo)}</td>
                      <td>{dash(r.tappingTime)}</td><td>{dash(r.tappingWtKgs)}</td>
                      <td>{dash(r.correctiveC)}</td><td>{dash(r.correctiveSi)}</td><td>{dash(r.correctiveMn)}</td>
                      <td>{dash(r.correctiveS)}</td><td>{dash(r.correctiveCr)}</td><td>{dash(r.correctiveCu)}</td>
                      <td>{dash(r.correctiveSn)}</td>
                      <td>{dash(r.mgKgs)}</td><td>{dash(r.resMgConvertorPercent)}</td><td>{dash(r.recMgPercent)}</td>
                      <td>{dash(r.streamInnoculant)}</td><td>{r.pTimeSecStart || r.pTimeSecEnd ? `${dash(r.pTimeSecStart)} - ${dash(r.pTimeSecEnd)}` : dash(r.pTimeSec ?? r.ptimeSec)}</td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'normal' }}>{dash(r.remarks)}</td>
                      <td>{r.createdBy}</td>
                      <td><span className="status-badge status-blue">{r.status}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. MICRO STRUCTURE */}
        <div className="rpt-card">
          <div className="rpt-accent-bar accent-micro" />
          <div className="rpt-section-header" style={{ background: '#f0fdf9' }}>
            <h6 className="rpt-section-title">
              2. Micro Structure <span className="rpt-count-badge badge-micro">{results.microStructure.length} records</span>
            </h6>
            <button className="btn-xls"
              onClick={() => exportSingle(results.microStructure, 'Micro_Structure_Full', '2. MICRO STRUCTURE DATA', MICRO_HEADERS, MICRO_KEYS, THEMES.micro)}>
              <DlIcon /> Download Excel
            </button>
          </div>
          <div className="rpt-table-wrap">
            <table className="rpt-table">
              <thead><tr>{MICRO_HEADERS.map(h => <th key={h} className="th-micro">{h}</th>)}</tr></thead>
              <tbody>
                {results.microStructure.length === 0
                  ? <tr><td colSpan={MICRO_HEADERS.length} className="rpt-empty">No records found.</td></tr>
                  : results.microStructure.map((r, idx) => (
                    <tr key={`${r.id}-${r.location}-${idx}`}>
                      <td>{r.id}</td><td className="part-name">{r.partName}</td>
                      <td>{r.inspectionDate}</td><td style={{ fontWeight: 700 }}>{r.heatCode}</td><td>{r.dateCode}</td><td>{r.location || '—'}</td>
                      <td>{dash(r.nodularityPercent)}</td><td>{dash(r.graphiteType)}</td>
                      <td>{dash(r.countNosPerMm2)}</td>
                      <td>{dash(r.ferritePercentMin)}</td><td>{dash(r.ferritePercentMax)}</td>
                      <td>{dash(r.pearlitePercentMin)}</td><td>{dash(r.pearlitePercentMax)}</td>
                      <td>{dash(r.carbidePercentMin)}</td><td>{dash(r.carbidePercentMax)}</td>
                      <td>{dash(r.sizeMin)}</td><td>{dash(r.sizeMax)}</td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'normal' }}>{dash(r.remarks)}</td>
                      <td>{r.createdBy}</td>
                      <td><span className="status-badge status-green">{r.status}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. TENSILE TEST */}
        <div className="rpt-card">
          <div className="rpt-accent-bar accent-tensile" />
          <div className="rpt-section-header" style={{ background: '#fffbeb' }}>
            <h6 className="rpt-section-title">
              3. Tensile Test <span className="rpt-count-badge badge-tensile">{results.microTensile.length} records</span>
            </h6>
            <button className="btn-xls"
              onClick={() => exportSingle(results.microTensile, 'Tensile_Test_Full', '3. TENSILE TEST DATA', TENSILE_HEADERS, TENSILE_KEYS, THEMES.tensile)}>
              <DlIcon /> Download Excel
            </button>
          </div>
          <div className="rpt-table-wrap">
            <table className="rpt-table">
              <thead><tr>{TENSILE_HEADERS.map(h => <th key={h} className="th-tensile">{h}</th>)}</tr></thead>
              <tbody>
                {results.microTensile.length === 0
                  ? <tr><td colSpan={TENSILE_HEADERS.length} className="rpt-empty">No records found.</td></tr>
                  : results.microTensile.map((r, idx) => (
                    <tr key={`${r.id}-${r.location}-${idx}`}>
                      <td>{r.id}</td><td className="part-name">{r.item}</td>
                      <td>{r.dateOfInspection}</td><td style={{ fontWeight: 700 }}>{r.heatCode}</td><td>{r.dateCode}</td><td>{r.location || '—'}</td>
                      <td>{dash(r.barDiaMm)}</td><td>{dash(r.gaugeLengthMm)}</td>
                      <td>{dash(r.maxLoadKn)}</td><td>{dash(r.yieldLoadKn)}</td>
                      <td>{dash(r.tensileStrength)}</td><td>{dash(r.yieldStrength02)}</td>
                      <td>{dash(r.yieldStrength05)}</td><td>{dash(r.elongationPercent)}</td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'normal' }}>{dash(r.remarks)}</td>
                      <td>{r.createdBy}</td>
                      <td><span className="status-badge status-amber">{r.status}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. IMPACT TEST */}
        <div className="rpt-card">
          <div className="rpt-accent-bar accent-impact" />
          <div className="rpt-section-header" style={{ background: '#faf5ff' }}>
            <h6 className="rpt-section-title">
              4. Impact Test <span className="rpt-count-badge badge-impact">{results.impactTest.length} records</span>
            </h6>
            <button className="btn-xls"
              onClick={() => exportSingle(results.impactTest, 'Impact_Test_Full', '4. IMPACT TEST DATA', IMPACT_HEADERS, IMPACT_KEYS, THEMES.impact)}>
              <DlIcon /> Download Excel
            </button>
          </div>
          <div className="rpt-table-wrap">
            <table className="rpt-table">
              <thead><tr>{IMPACT_HEADERS.map(h => <th key={h} className="th-impact">{h}</th>)}</tr></thead>
              <tbody>
                {results.impactTest.length === 0
                  ? <tr><td colSpan={IMPACT_HEADERS.length} className="rpt-empty">No records found.</td></tr>
                  : results.impactTest.map((r, idx) => (
                    <tr key={`${r.id}-${r.location}-${r.notchType}-${idx}`}>
                      <td>{r.id}</td><td className="part-name">{r.partName}</td>
                      <td>{r.dateOfInspection}</td><td style={{ fontWeight: 700 }}>{r.dateCode}</td>
                      <td>{r.location || '—'}</td><td>{r.notchType || '—'}</td>
                      <td>{dash(r.observedValue1)}</td><td>{dash(r.observedValue2)}</td><td>{dash(r.observedValue3)}</td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'normal' }}>{dash(r.remarks)}</td>
                      <td>{r.createdBy}</td>
                      <td><span className="status-badge status-purple">{r.status}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>)}
    </>
  );
};

export default Reports;
