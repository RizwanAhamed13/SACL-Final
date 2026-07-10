#!/usr/bin/env node

/**
 * Full SACL browser smoke/e2e flow.
 *
 * What this script does:
 * 1. Uses API only for setup: creates/updates E2E users and a unique test part.
 * 2. Uses the UI like a real user to login, enter all four forms, search/view records,
 *    approve as HOF/HOD, generate report as ADMIN, download Excel, and verify workbook data.
 *
 * Local:
 *   cd frontend
 *   npm install
 *   npx playwright install chromium
 *   BASE_URL=http://localhost:5173 npm run e2e:full-ui
 *
 * VPS/cloud:
 *   cd frontend
 *   ALLOW_PROD_E2E=1 BASE_URL=https://your-domain.example ADMIN_EMPLOYEE_ID=EMP043 ADMIN_PASSWORD='...' npm run e2e:full-ui
 *
 * Important: this creates real records in whichever backend/database BASE_URL points to.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import * as XLSX from 'xlsx';

const FORM_PERMISSIONS = 'QC_REGISTER,MICRO_STRUCTURE,TENSILE_TEST,IMPACT_TEST';
const DEFAULT_PASSWORD = process.env.E2E_PASSWORD || 'Rizwan@25012007';
const BASE_URL = stripTrailingSlash(process.env.BASE_URL || 'http://localhost:5173');
const API_URL = stripTrailingSlash(process.env.API_URL || `${BASE_URL}/api`);
const HEADLESS = process.env.HEADLESS !== '0';
const SLOW_MO = Number(process.env.SLOW_MO || 0);
const ARTIFACT_DIR = path.resolve(process.cwd(), process.env.E2E_ARTIFACT_DIR || 'e2e-artifacts');
const RUN_ID = process.env.E2E_RUN_ID || new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const ITERATIONS = Number(process.env.E2E_ITERATIONS || 25);

const credentials = {
  admin: { employeeId: process.env.ADMIN_EMPLOYEE_ID || 'EMP043', password: process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD },
  user: { employeeId: process.env.USER_EMPLOYEE_ID || 'E2E_USER', password: process.env.USER_PASSWORD || DEFAULT_PASSWORD },
  hof: { employeeId: process.env.HOF_EMPLOYEE_ID || 'E2E_HOF', password: process.env.HOF_PASSWORD || DEFAULT_PASSWORD },
  hod: { employeeId: process.env.HOD_EMPLOYEE_ID || 'E2E_HOD', password: process.env.HOD_PASSWORD || DEFAULT_PASSWORD },
};

const data = {
  partName: `E2E_FULL_UI_${RUN_ID}`,
  dateCode: `D${RUN_ID}`,
  heatCode: `H${RUN_ID}`,
  disa: 'DISA I',
  today: new Date().toISOString().slice(0, 10),
  qc: {
    qtyMoulds: '42',
    compositionC: '3.55',
    compositionSi: '2.22',
    compositionMn: '0.31',
    compositionP: '0.02',
    compositionS: '0.01',
    compositionMgFirst: '0.045',
    compositionMgLast: '0.041',
    compositionCu: '0.15',
    compositionCr: '0.03',
    compositionSn: '0.02',
    timeOfPouringStart: '10:00',
    timeOfPouringEnd: '10:30',
    tappingTime: '09:45',
    pouringTempStart: '1390',
    pouringTempEnd: '1380',
    ppCode: 'PP-E2E',
    treatmentNo: 'TRT-1',
    fcNoHeatNo: 'FC-1',
    conNo: 'CON-1',
    tappingWtKgs: '1000',
    mgKgs: '10',
    resMgConvertorPercent: '0.043',
    recMgPercent: '0.044',
    streamInnoculant: '0.8',
    pTimeSecStart: '14',
    pTimeSecEnd: '16',
    correctiveC: '0.1',
    correctiveSi: '0.2',
    correctiveMn: '0.1',
    correctiveS: '0',
    correctiveCr: '0',
    correctiveCu: '0',
    correctiveSn: '0',
    remarks: 'E2E UI QC record',
  },
  micro: {
    TRA: { nodularityPercent: '91', graphiteType: 'VI', countNosPerMm2Min: '130', countNosPerMm2Max: '165', sizeMin: '5', sizeMax: '7', ferritePercentMin: '35', ferritePercentMax: '52', pearlitePercentMin: '45', pearlitePercentMax: '62', carbidePercentMin: '1', carbidePercentMax: '2' },
    SBA: { nodularityPercent: '89', graphiteType: 'VI', countNosPerMm2Min: '120', countNosPerMm2Max: '150', sizeMin: '5', sizeMax: '8', ferritePercentMin: '34', ferritePercentMax: '50', pearlitePercentMin: '47', pearlitePercentMax: '63', carbidePercentMin: '1', carbidePercentMax: '3' },
    LBJ: { nodularityPercent: '92', graphiteType: 'VI', countNosPerMm2Min: '135', countNosPerMm2Max: '160', sizeMin: '5', sizeMax: '6', ferritePercentMin: '36', ferritePercentMax: '54', pearlitePercentMin: '42', pearlitePercentMax: '60', carbidePercentMin: '0', carbidePercentMax: '1' },
    BORE: { nodularityPercent: '90', graphiteType: 'VI', countNosPerMm2Min: '125', countNosPerMm2Max: '155', sizeMin: '6', sizeMax: '8', ferritePercentMin: '33', ferritePercentMax: '48', pearlitePercentMin: '48', pearlitePercentMax: '65', carbidePercentMin: '1', carbidePercentMax: '2' },
    'SBA.CA': { nodularityPercent: '93', graphiteType: 'VI', countNosPerMm2Min: '140', countNosPerMm2Max: '170', sizeMin: '5', sizeMax: '7', ferritePercentMin: '38', ferritePercentMax: '55', pearlitePercentMin: '41', pearlitePercentMax: '58', carbidePercentMin: '0', carbidePercentMax: '1' },
    'LBJ.CA': { nodularityPercent: '88', graphiteType: 'VI', countNosPerMm2Min: '115', countNosPerMm2Max: '145', sizeMin: '6', sizeMax: '8', ferritePercentMin: '32', ferritePercentMax: '45', pearlitePercentMin: '50', pearlitePercentMax: '68', carbidePercentMin: '2', carbidePercentMax: '4' },
  },
  tensile: {
    common: { barDiaMm: '12', gaugeLengthMm: '50' },
    TRA: { maxLoadKn: '62', yieldLoadKn: '38', tensileStrength: '510', yieldStrength02: '345', yieldStrength05: '360', elongationPercent: '12.5' },
    SBA: { maxLoadKn: '64', yieldLoadKn: '39', tensileStrength: '525', yieldStrength02: '352', yieldStrength05: '368', elongationPercent: '13.2' },
  },
  impact: {
    TRA: { Unotch: { observedValue1: '14.1', observedValue2: '14.4', observedValue3: '14.2' }, Vnotch: { observedValue1: '12.1', observedValue2: '12.3', observedValue3: '12.2' }, Unnotch: { observedValue1: '16.1', observedValue2: '16.3', observedValue3: '16.2' } },
    SBA: { Unotch: { observedValue1: '15.1', observedValue2: '15.4', observedValue3: '15.2' }, Vnotch: { observedValue1: '13.1', observedValue2: '13.3', observedValue3: '13.2' }, Unnotch: { observedValue1: '17.1', observedValue2: '17.3', observedValue3: '17.2' } },
  },
};

const results = {
  baseUrl: BASE_URL,
  apiUrl: API_URL,
  runId: RUN_ID,
  partName: data.partName,
  dateCode: data.dateCode,
  heatCode: data.heatCode,
  iterations: ITERATIONS,
  steps: [],
  downloadedExcel: null,
  resultJson: null,
};

guardProductionTarget();
await fs.mkdir(ARTIFACT_DIR, { recursive: true });

let browser, context, page;
try {
  browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: SLOW_MO,
    channel: process.env.E2E_BROWSER_CHANNEL || undefined,
  });
  context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 950 } });
  page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.setDefaultTimeout(Number(process.env.E2E_TIMEOUT_MS || 30000));

  log('Setup users and part through UI');
  await loginUi(page, credentials.admin, 'ADMIN');
  await createUsersUi(page);
  await createPartUi(page);



  await loginUi(page, credentials.user, 'USER');
  await enterQcRegister(page);
  await enterMicroStructure(page);
  await enterTensile(page);
  await enterImpact(page);
  await verifySearchInRole(page, 'USER');

  await loginUi(page, credentials.hof, 'HOF');
  await verifySearchInRole(page, 'HOF');
  await approveRecords(page, 'HOF');

  await loginUi(page, credentials.hod, 'HOD');
  await verifySearchInRole(page, 'HOD');
  await approveRecords(page, 'HOD');

  await loginUi(page, credentials.admin, 'ADMIN');
  await verifySearchInRole(page, 'ADMIN');
  await verifyReportAndDownloadExcel(page);
  await verifyEfficiencyUi(page);
  await verifyPerformanceFeedbackUi(page);
  

  await writeResult('passed');
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  const html = await page.evaluate(() => document.body.innerHTML); console.log("DOM SNAPSHOT:", html); results.error = error?.stack || String(error);
  await writeResult('failed').catch(() => {});
  console.error(JSON.stringify(results, null, 2));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}

async function loginUi(page, cred, roleName) {
  log(`Login UI as ${roleName}`);
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear()).catch(() => {});
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="text"]').fill(cred.employeeId);
  await page.locator('input[type="password"]').fill(cred.password);
  await Promise.all([
    page.waitForURL('**/*/', { timeout: 30000 }),
    page.getByRole('button', { name: 'Sign In' }).click(),
  ]);
  await page.waitForLoadState('domcontentloaded');
  await expectText(page, 'Quality');
}

async function enterQcRegister(page) {
  log(`USER enters QC Register (${ITERATIONS} records)`);
  await page.goto(`${BASE_URL}/qc-register`, { waitUntil: 'domcontentloaded' });
  for (let i = 1; i <= ITERATIONS; i++) {
    await clickButton(page, 'Add Entry');
    await selectPartName(page, data.partName);
    await fillByName(page, { date: data.today, dateCode: data.dateCode, heatCode: `${data.heatCode}_${i}`, ...data.qc });
    await selectNativeIfPresent(page, 'disa', data.disa);
    await saveForm(page, 'Save Record');
  }
  await searchAndExpect(page, '/qc-register', data.partName, [data.partName, `${data.heatCode}_1`, data.dateCode]);
}

async function enterMicroStructure(page) {
  log(`USER enters Micro Structure (${ITERATIONS} records)`);
  await page.goto(`${BASE_URL}/micro-structure`, { waitUntil: 'domcontentloaded' });
  for (let i = 1; i <= ITERATIONS; i++) {
    await clickButton(page, 'Add Analysis');
    await selectPartName(page, data.partName);
    await waitForNamedField(page, 'TRA_countNosPerMm2Min');
    await fillByName(page, { inspectionDate: data.today, dateCode: data.dateCode, disa: data.disa, remarks: `E2E UI micro record ${i}` });
    for (const [loc, values] of Object.entries(data.micro)) {
      const prefix = loc.replace(/[^a-zA-Z0-9]/g, '_');
      await fillByName(page, Object.fromEntries(Object.entries(values).map(([k, v]) => [`${prefix}_${k}`, v])));
    }
    await saveForm(page, 'Save Analysis');
  }
  await searchAndExpect(page, '/micro-structure', data.partName, [data.partName, '130-165', '120-150']);
}

async function enterTensile(page) {
  log(`USER enters Tensile Test (${ITERATIONS} records)`);
  await page.goto(`${BASE_URL}/micro-tensile`, { waitUntil: 'domcontentloaded' });
  for (let i = 1; i <= ITERATIONS; i++) {
    await clickButton(page, 'Add Test');
    await selectPartName(page, data.partName);
    await waitForNamedField(page, 'TRA_tensileStrength');
    await fillByName(page, { dateOfInspection: data.today, dateCode: data.dateCode, heatCode: `${data.heatCode}_${i}`, disa: data.disa, remarks: `E2E UI tensile record ${i}`, ...data.tensile.common });
    for (const [loc, values] of Object.entries({ TRA: data.tensile.TRA, SBA: data.tensile.SBA })) {
      await fillByName(page, Object.fromEntries(Object.entries(values).map(([k, v]) => [`${loc}_${k}`, v])));
    }
    await saveForm(page, 'Save Record');
  }
  await searchAndExpect(page, '/micro-tensile', data.partName, [data.partName, '510', '525']);
}

async function enterImpact(page) {
  log(`USER enters Impact Test (${ITERATIONS} records)`);
  await page.goto(`${BASE_URL}/impact-test`, { waitUntil: 'domcontentloaded' });
  for (let i = 1; i <= ITERATIONS; i++) {
    await clickButton(page, 'Add Test');
    await selectPartName(page, data.partName);
    await waitForNamedField(page, 'TRA_Unotch_observedValue1');
    await fillByName(page, { dateOfInspection: data.today, dateCode: data.dateCode, disa: data.disa, specification: '10-20', remarks: `E2E UI impact record ${i}` });
    for (const [loc, notches] of Object.entries(data.impact)) {
      for (const [notch, values] of Object.entries(notches)) {
        await fillByName(page, Object.fromEntries(Object.entries(values).map(([k, v]) => [`${loc}_${notch}_${k}`, v])));
      }
    }
    await saveForm(page, 'Save Record');
  }
  await searchAndExpect(page, '/impact-test', data.partName, [data.partName, '14.1', '13.1']);
}

async function verifySearchInRole(page, roleName) {
  log(`${roleName} views/searches all visible form records`);
  const pages = [
    ['/qc-register', [data.partName, data.heatCode]],
    ['/micro-structure', [data.partName, '130-165']],
    ['/micro-tensile', [data.partName, '510']],
    ['/impact-test', [data.partName, '14.1']],
  ];
  for (const [route, expected] of pages) {
    await searchAndExpect(page, route, data.partName, expected, { allowRedirectHome: roleName === 'HOF' });
  }
}

async function approveRecords(page, stage) {
  log(`${stage} approves all ${ITERATIONS} records through UI`);
  for (const route of ['/qc-register', '/micro-structure', '/micro-tensile', '/impact-test']) {
    await searchAndExpect(page, route, data.partName, [data.partName], { allowRedirectHome: stage === 'HOF' });
    
    if (stage === 'HOD') {
      let awaitingRows = page.locator('span.status-hof_approved');
      let count = await awaitingRows.count();
      if (count < 1) throw new Error(`No HOF APPROVED records found for HOD on ${route}`);
      while (count > 0) {
        const row = page.locator('tr').filter({ has: page.locator('span.status-hof_approved') }).first();
        await row.getByRole('button', { name: 'Edit' }).click();
        await clickButton(page, 'Approve HOD');
        await page.waitForTimeout(600); // Wait for modal and API
        await page.waitForLoadState('networkidle');
        count = await page.locator('span.status-hof_approved').count();
      }
      continue;
    }
    
    // For HOF
    let hofButton = page.getByRole('button', { name: 'Approve HOF' }).first();
    let count = await page.getByRole('button', { name: 'Approve HOF' }).count();
    if (count < 1) throw new Error(`Approve HOF button not found on ${route}`);
    while (await hofButton.count() > 0) {
      await hofButton.click();
      await page.waitForTimeout(600); // Wait for API
      await page.waitForLoadState('networkidle');
      hofButton = page.getByRole('button', { name: 'Approve HOF' }).first();
    }
  }
}

async function verifyReportAndDownloadExcel(page) {
  log('ADMIN searches report and downloads Excel');
  await page.goto(`${BASE_URL}/reports`, { waitUntil: 'domcontentloaded' });
  await selectPartName(page, data.partName);
  await fillByName(page, { dateCode: data.dateCode });
  await clickButton(page, 'Search');
  for (const text of [data.partName, '1. QC Register', '2. Micro Structure', '3. Tensile Test', '4. Impact Test', '130', '165', '510', '14.1']) {
    await expectText(page, text).catch((error) => {
      throw new Error(`Report page missing expected text "${text}": ${error.message}`);
    });
  }

  const downloadPromise = page.waitForEvent('download');
  await clickButton(page, 'Download All');
  const download = await downloadPromise;
  const fileName = download.suggestedFilename();
  const savePath = path.join(ARTIFACT_DIR, `${RUN_ID}-${fileName}`);
  await download.saveAs(savePath);
  results.downloadedExcel = savePath;
  await verifyExcel(savePath);
}

async function verifyBackendReport(token) {
  log('Verify backend report API counts');
  const query = new URLSearchParams({ partName: data.partName, dateCode: data.dateCode });
  const report = await apiJson(`/reports/search?${query}`, { token });
  const counts = Object.fromEntries(Object.entries(report).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0]));
  results.backendReportCounts = counts;
  for (const key of ['qcRegister', 'microStructure', 'microTensile', 'impactTest']) {
    if (counts[key] !== ITERATIONS) throw new Error(`Backend report missing ${key}, expected ${ITERATIONS} but got ${counts[key]}`);
  }
}

async function verifyExcel(filePath) {
  log('Verify downloaded Excel workbook');
  const wb = XLSX.read(await fs.readFile(filePath), { type: 'buffer' });
  const combined = XLSX.utils.sheet_to_json(wb.Sheets['Combined Report'], { header: 1, defval: '' }).flat();
  const expected = [data.partName, data.dateCode, `${data.heatCode}_1`, 'Count Min (nos/mm²)', 'Count Max (nos/mm²)', '130', '165', '510', '14.1'];
  const missing = expected.filter((value) => !combined.includes(value));
  if (missing.length > 0) throw new Error(`Excel Combined Report missing values: ${missing.join(', ')}`);
  results.excelVerified = true;
}

async function searchAndExpect(page, route, term, expectedTexts, options = {}) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
  if (options.allowRedirectHome && page.url().endsWith('/')) {
    results.steps.push({ step: `skip ${route}`, reason: 'role redirected home/no permission' });
    return;
  }
  const searchInput = page.locator('input[placeholder*="Search"]').first();
  if (await searchInput.count()) {
    await searchInput.fill(term);
    await clickButton(page, 'Search');
  }
  for (const expected of expectedTexts) await expectText(page, expected);
}

async function selectPartName(page, partName) {
  const input = page.locator('input[id^="react-select"][id$="-input"]').first();
  await input.waitFor({ state: 'visible' });
  await input.click();
  await input.fill(partName);
  await page.waitForTimeout(500);
  const option = page.locator('[id*="-option-"]').filter({ hasText: partName }).first();
  if (await option.count()) {
    await option.click();
  } else {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
  }
  await page.getByText(partName, { exact: true }).first().waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
}

async function fillByName(page, values) {
  for (const [name, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    
    const timePickerContainer = page.locator(`div[data-name="${cssEscape(name)}"]`).first();
    if ((await timePickerContainer.count()) > 0) {
      const match = String(value).match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        let h = parseInt(match[1], 10);
        let m = match[2];
        let ap = 'AM';
        if (h >= 12) {
          ap = 'PM';
          if (h > 12) h -= 12;
        } else if (h === 0) {
          h = 12;
        }
        await timePickerContainer.locator('select').nth(0).selectOption(h.toString().padStart(2, '0'));
        await timePickerContainer.locator('select').nth(1).selectOption(m);
        await timePickerContainer.locator('select').nth(2).selectOption(ap);
      }
      continue;
    }

    const locator = page.locator(`[name="${cssEscape(name)}"]`).first();
    if ((await locator.count()) === 0) continue;
    await locator.fill(String(value));
  }
}

async function waitForNamedField(page, name) {
  await page.locator(`[name="${cssEscape(name)}"]`).waitFor({ state: 'visible' });
}

async function selectNativeIfPresent(page, name, value) {
  const locator = page.locator(`select[name="${cssEscape(name)}"]`).first();
  if ((await locator.count()) > 0) await locator.selectOption(value);
}

async function saveForm(page, saveButtonName) {
  await clickButton(page, saveButtonName);
  await clickButton(page, 'Confirm');
  await page.waitForTimeout(1000);
}

async function clickButton(page, name) {
  const button = page.getByRole('button', { name: new RegExp(name, 'i') }).first();
  await button.waitFor({ state: 'visible' });
  await button.click();
}

async function expectText(page, text) {
  await page.waitForFunction(
    (expected) => document.body.innerText.includes(expected),
    String(text),
  );
}

async function loginApi(cred) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId: cred.employeeId, password: cred.password }),
  });
  const json = await readJsonResponse(res, '/auth/login');
  return { token: json.token, user: json.user };
}

async function apiJson(pathname, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API_URL}${pathname}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return readJsonResponse(res, pathname);
}

async function upsertE2EUsers(token) {
  const users = await apiJson('/users', { token });
  const wanted = [
    { employeeId: credentials.user.employeeId, username: 'e2e_user', fullName: 'E2E User', role: 'USER', password: credentials.user.password, formPermissions: FORM_PERMISSIONS, active: true },
    { employeeId: credentials.hof.employeeId, username: 'e2e_hof', fullName: 'E2E HOF', role: 'HOF', password: credentials.hof.password, formPermissions: FORM_PERMISSIONS, active: true },
    { employeeId: credentials.hod.employeeId, username: 'e2e_hod', fullName: 'E2E HOD', role: 'HOD', password: credentials.hod.password, formPermissions: FORM_PERMISSIONS, active: true },
  ];
  for (const user of wanted) {
    const existing = users.find((u) => u.employeeId === user.employeeId || u.username === user.username);
    if (existing) {
      await apiJson(`/users/${existing.id}`, { method: 'PUT', token, body: { ...existing, ...user } });
    } else {
      await apiJson('/users', { method: 'POST', token, body: user });
    }
  }
}

async function upsertPart(token) {
  const part = {
    name: data.partName,
    description: 'Created by full-ui-e2e script',
    active: true,
    qcMinC: 3.4, qcMaxC: 3.8, qcMinSi: 2.0, qcMaxSi: 2.5, qcMinMn: 0.2, qcMaxMn: 0.5,
    qcMinP: 0, qcMaxP: 0.06, qcMinS: 0, qcMaxS: 0.02, qcMinMg: 0.03, qcMaxMg: 0.06,
    qcMinCu: 0, qcMaxCu: 0.8, qcMinCr: 0, qcMaxCr: 0.1, qcMinSn: 0, qcMaxSn: 0.05,
    microMinNodularity: 80, microMaxNodularity: 100, microMinCount: 100, microMaxCount: 180,
    microMinFerrite: 30, microMaxFerrite: 60, microMinPearlite: 40, microMaxPearlite: 70, microMinCarbide: 0, microMaxCarbide: 5,
    microSizeMin: 5, microSizeMax: 8, microLocations: 'TRA,SBA,LBJ,BORE,SBA.CA,LBJ.CA', mechLocations: 'TRA,SBA',
    tensileMinStrength: 450, tensileMaxStrength: 650, tensileMinYield: 300, tensileMaxYield: 450,
    tensileMinYield05: 320, tensileMaxYield05: 470, tensileMinElongation: 8, tensileMaxElongation: 18,
    impactNotchTypes: 'Unotch,Vnotch,Unnotch',
    impactMinTRAUnotch: 10, impactMaxTRAUnotch: 20, impactMinTRAVnotch: 10, impactMaxTRAVnotch: 20, impactMinTRAUnnotch: 10, impactMaxTRAUnnotch: 20,
    impactMinSBAUnotch: 10, impactMaxSBAUnotch: 20, impactMinSBAVnotch: 10, impactMaxSBAVnotch: 20, impactMinSBAUnnotch: 10, impactMaxSBAUnnotch: 20,
    ppMinPouringTemp: 1350, ppMaxPouringTemp: 1450, ppMinMgKgs: 8, ppMaxMgKgs: 12,
    ppMinStreamInnoculant: 0.5, ppMaxStreamInnoculant: 1.2, ppMinPTimeSec: 10, ppMaxPTimeSec: 20,
    barDiaMin: 10, barDiaMax: 16,
  };
  try {
    const existing = await apiJson(`/part-names/name/${encodeURIComponent(part.name)}`, { token });
    await apiJson(`/part-names/${existing.id}`, { method: 'PUT', token, body: { ...existing, ...part } });
  } catch {
    await apiJson('/part-names', { method: 'POST', token, body: part });
  }
}

async function readJsonResponse(res, label) {
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${label} returned non-JSON ${res.status}: ${text.slice(0, 300)}`);
  }
  if (!res.ok) throw new Error(`${label} failed ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function writeResult(status) {
  results.status = status;
  results.resultJson = path.join(ARTIFACT_DIR, `${RUN_ID}-full-ui-e2e-result.json`);
  await fs.writeFile(results.resultJson, JSON.stringify(results, null, 2));
}

function log(message) {
  const entry = { at: new Date().toISOString(), step: message };
  results.steps.push(entry);
  console.log(`[full-ui-e2e] ${message}`);
}

function guardProductionTarget() {
  const host = new URL(BASE_URL).hostname;
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(host);
  if (!isLocal && process.env.ALLOW_PROD_E2E !== '1') {
    throw new Error(`BASE_URL=${BASE_URL} is not local. Set ALLOW_PROD_E2E=1 to create real test records against this target.`);
  }
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function cssEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}


async function createUsersUi(page) {
  log('ADMIN creates E2E Users via UI');
  await page.getByRole('link', { name: /User Management/i }).click();
  await page.waitForTimeout(1000);
  const users = [
    { ...credentials.user, fullName: 'E2E User', username: 'e2e_user', role: 'ROLE_QC' },
    { ...credentials.hof, fullName: 'E2E HOF', username: 'e2e_hof', role: 'ROLE_HOF' },
    { ...credentials.hod, fullName: 'E2E HOD', username: 'e2e_hod', role: 'ROLE_ADMIN' },
  ];
  for (const u of users) {
    await clickButton(page, 'Add User');
    await fillByName(page, { fullName: u.fullName, username: u.username, employeeId: u.employeeId, password: u.password });
    await selectNativeIfPresent(page, 'role', u.role);
    
    // Check form permissions
    if (u.role !== 'ROLE_ADMIN') {
      for (const form of ['QC Register', 'Micro Structure', 'Tensile Test', 'Impact Test']) {
        const cb = page.locator('label').filter({ hasText: form }).locator('input[type="checkbox"]');
        if (await cb.count() > 0 && !(await cb.isChecked())) {
          await cb.check();
        }
      }
    }
    await clickButton(page, 'Save User');
    await page.waitForTimeout(1000);
  }
}

async function createPartUi(page) {
  log('ADMIN creates Part Name via UI');
  await page.getByRole('link', { name: /Part Names/i }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /Add Part Name/ }).click();
  
  await fillByName(page, {
    name: data.partName,
    description: 'Created by full-ui-e2e script',
    minTensileStrength: 450, maxTensileStrength: 650, minYieldStrength: 300, maxYieldStrength: 450,
    minYieldStrength05: 320, maxYieldStrength05: 470, minElongationPercent: 8, maxElongationPercent: 18,
    minNodularityPercent: 80, maxNodularityPercent: 100, minCountNosPerMm2: 100, maxCountNosPerMm2: 180,
    minFerritePercent: 30, maxFerritePercent: 60, minPearlitePercent: 40, maxPearlitePercent: 70, minCarbidePercent: 0, maxCarbidePercent: 5,
    minSize: 5, maxSize: 8,
    minTRAUnotch: 10, maxTRAUnotch: 20, minTRAVnotch: 10, maxTRAVnotch: 20, minTRAUnnotch: 10, maxTRAUnnotch: 20,
    minSBAUnotch: 10, maxSBAUnotch: 20, minSBAVnotch: 10, maxSBAVnotch: 20, minSBAUnnotch: 10, maxSBAUnnotch: 20,
    minPouringTempStart: 1350, maxPouringTempEnd: 1450, minMgKgs: 8, maxMgKgs: 12,
    minStreamInnoculant: 0.5, maxStreamInnoculant: 1.2, minPTimeSecStart: 10, maxPTimeSecEnd: 20,
    barDiaMin: 10, barDiaMax: 16,
    minCompositionC: 3.4, maxCompositionC: 3.8, minCompositionSi: 2.0, maxCompositionSi: 2.5, minCompositionMn: 0.2, maxCompositionMn: 0.5,
    minCompositionP: 0, maxCompositionP: 0.06, minCompositionS: 0, maxCompositionS: 0.02, minCompositionMgFirst: 0.03, maxCompositionMgLast: 0.06,
    minCompositionCu: 0, maxCompositionCu: 0.8, minCompositionCr: 0, maxCompositionCr: 0.1, minCompositionSn: 0, maxCompositionSn: 0.05
  });
  
  // Click checkboxes for locations and notches
  for (const loc of ['TRA', 'SBA', 'LBJ', 'BORE', 'SBA.CA', 'LBJ.CA']) {
    await page.locator('label').filter({ hasText: new RegExp('^' + loc + '$') }).first().locator('input[type="checkbox"]').check();
    // Since TRA and SBA appear in both micro and mech, checking the first matches micro, let's also check the second for mech
    const cbs = await page.locator('label').filter({ hasText: new RegExp('^' + loc + '$') }).locator('input[type="checkbox"]').all();
    for (const cb of cbs) await cb.check();
  }
  for (const notch of ['U-notch', 'V-notch', 'Un-notch']) {
    await page.locator('label').filter({ hasText: new RegExp('^' + notch + '$') }).first().locator('input[type="checkbox"]').check();
  }
  
  await clickButton(page, 'Save Standard');
  await page.waitForTimeout(1000);
}

async function verifyEfficiencyUi(page) {
  log('ADMIN verifies Employee Efficiency UI');
  await page.getByRole('link', { name: /Efficiency/i }).click();
  await page.waitForTimeout(1000);
  const searchInput = page.getByPlaceholder('Search by UID or Name…');
  await searchInput.fill(credentials.user.employeeId);
  await page.waitForTimeout(500);
  await expectText(page, credentials.user.employeeId);
}

async function verifyPerformanceFeedbackUi(page) {
  log('ADMIN creates Performance Feedback via UI');
  await page.getByRole('link', { name: /Performance/i }).click();
  await page.waitForTimeout(1000);
  const userSelect = page.locator('select[name="employeeId"]');
  if (await userSelect.count() > 0) {
    await userSelect.selectOption(credentials.user.employeeId);
    await fillByName(page, { feedbackText: 'Great job running the E2E UI tests perfectly!' });
    await clickButton(page, 'Submit Feedback');
    await page.waitForTimeout(1000);
    await expectText(page, 'Great job running');
  }
}
