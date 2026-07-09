
(function(){
  const data = window.CLINIC_APP_DATA;
  const insuranceSelect = document.getElementById('insuranceSelect');
  const insuranceSearch = document.getElementById('insuranceSearch');
  const planTableBody = document.getElementById('planTableBody');
  const nonCoveredList = document.getElementById('nonCoveredList');
  const OTHER_STORAGE_KEY = 'clinicAppOtherEntries';
  const planDate = document.getElementById('planDate');
  const clinicName = document.getElementById('clinicName');
  const patientName = document.getElementById('patientName');
  const deductibleInput = document.getElementById('deductible');
  const coinsuranceInput = document.getElementById('coinsurance');
  const copayInput = document.getElementById('copay');
  const copayVisitsInput = document.getElementById('copayVisits');
  const payInFullDiscountInput = document.getElementById('payInFullDiscount');
  const monthsAInput = document.getElementById('monthsA');
  const monthsBInput = document.getElementById('monthsB');

  const fullFeeTotalEl = document.getElementById('fullFeeTotal');
  const coveredTotalEl = document.getElementById('coveredTotal');
  const insurancePortionEl = document.getElementById('insurancePortion');
  const patientResponsibilityEl = document.getElementById('patientResponsibility');
  const detailList = document.getElementById('detailList');
  const paymentList = document.getElementById('paymentList');
  const assumptionList = document.getElementById('assumptionList');
  const estimateAcknowledge = document.getElementById('estimateAcknowledge');

  const printClinicName = document.getElementById('printClinicName');
  const printPatientName = document.getElementById('printPatientName');
  const printDate = document.getElementById('printDate');
  const printInsurance = document.getElementById('printInsurance');
  const printServicesBody = document.getElementById('printServicesBody');
  const printFullFeeTotal = document.getElementById('printFullFeeTotal');
  const printCoveredTotal = document.getElementById('printCoveredTotal');
  const printPatientResponsibility = document.getElementById('printPatientResponsibility');
  const printPaymentList = document.getElementById('printPaymentList');
  const printNonCoveredList = document.getElementById('printNonCoveredList');
  const printEstimateAcknowledge = document.getElementById('printEstimateAcknowledge');

  const state = {
    quantities: {},
    nonCoveredQty: {},
    insurance: null
  };

  const currency = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});

  const serviceLabels = {
    '72040': 'Cervical Spine X-Ray',
    '72050': 'Cervical Spine X-Ray Series',
    '72070': 'Thoracic Spine X-Ray',
    '72100': 'Lumbar Spine X-Ray',
    '72110': 'Lumbar Spine X-Ray Series',
    '97010': 'Hot / Cold Therapy',
    '97012': 'Mechanical Traction',
    '97014': 'Electrical Stimulation',
    'G0283': 'Electrical Stimulation',
    '97026': 'Infrared Therapy',
    '97035': 'Ultrasound Therapy',
    '97039': 'Unlisted Modality',
    '97110': 'Therapeutic Exercise',
    '97112': 'Neuromuscular Re-education',
    '97124': 'Massage Therapy',
    '97140': 'Manual Therapy',
    '97530': 'Therapeutic Activities',
    '98940': 'Spinal Adjustment',
    '98941': 'Spinal Adjustment',
    '98943': 'Extremity Adjustment',
    '99202': 'New Patient Exam',
    '99203': 'New Patient Exam',
    '99212': 'Established Patient Exam',
    '99213': 'Established Patient Exam'
  };

  const fullFeeSchedule = {
    '72040': 150,
    '72050': 250,
    '72070': 100,
    '72100': 100,
    '72110': 200,
    '97010': 30,
    '97012': 50,
    '97014': 50,
    'G0283': 50,
    '97026': 50,
    '97035': 50,
    '97039': 50,
    '97110': 75,
    '97112': 75,
    '97124': 60,
    '97140': 60,
    '97530': 75,
    '98940': 105,
    '98941': 115,
    '98943': 75,
    '99202': 150,
    '99203': 200,
    '99212': 100,
    '99213': 150
  };


  const nonCoveredFullFeeMap = {
    radiologist: 60,
    stimpads: 15.82,
    orthotics: 339,
    orthotics2pair: 559,
    nc98941: fullFeeSchedule['98941'],
    nc98943: fullFeeSchedule['98943'],
    nc97110: fullFeeSchedule['97110'],
    ncG0283: fullFeeSchedule['G0283'],
    nc97012: fullFeeSchedule['97012'],
    nc99213: fullFeeSchedule['99213'],
    nc99203: fullFeeSchedule['99203'],
    supportiveEM: 25
  };

  function fmtMoney(val){
    return currency.format(Number(val || 0));
  }

  function todayString(){
    const dt = new Date();
    const month = String(dt.getMonth()+1).padStart(2,'0');
    const day = String(dt.getDate()).padStart(2,'0');
    return dt.getFullYear() + '-' + month + '-' + day;
  }

  function displayDate(value){
    if (!value) return '—';
    const dt = new Date(value + 'T00:00:00');
    return dt.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  }

  function normalizeQty(value){
    const n = parseInt(value,10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function normalizeAmount(value){
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1000, n));
  }

  function loadOtherPresets(){
    try {
      const raw = localStorage.getItem(OTHER_STORAGE_KEY);
      const parsed = JSON.parse(raw || '[]');
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && typeof item.description === 'string' && Number.isFinite(Number(item.amount)));
      }
    } catch (e) {}
    return [];
  }

  function saveOtherPreset(description, amount){
    const desc = String(description || '').trim();
    const amt = normalizeAmount(amount);
    if (!desc || amt <= 0) return;
    const presets = loadOtherPresets();
    const deduped = presets.filter(item => !(item.description === desc && Number(item.amount) === amt));
    deduped.unshift({ description: desc, amount: amt });
    localStorage.setItem(OTHER_STORAGE_KEY, JSON.stringify(deduped.slice(0, 8)));
  }

  function buildInsuranceList(filterText=''){
    const current = state.insurance;
    insuranceSelect.innerHTML = '';
    const items = data.insuranceCompanies
      .filter(name => name.toLowerCase().includes(filterText.toLowerCase()))
      .sort((a,b) => a.localeCompare(b));

    items.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      if ((current && current === name) || (!current && insuranceSelect.options.length === 0)) {
        option.selected = true;
        state.insurance = name;
      }
      insuranceSelect.appendChild(option);
    });

    if (!items.length) {
      const option = document.createElement('option');
      option.textContent = 'No matches';
      insuranceSelect.appendChild(option);
    }
  }


  function renderOtherRow(){
    const row = document.createElement('div');
    row.className = 'noncovered-item noncovered-item-other';

    const left = document.createElement('div');
    const label = document.createElement('strong');
    label.textContent = 'OTHER';
    const helper = document.createElement('div');
    helper.className = 'muted';
    helper.textContent = 'Custom non-covered line item';
    left.appendChild(label);
    left.appendChild(helper);

    const fields = document.createElement('div');
    fields.className = 'other-fields';

    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.id = 'otherDescription';
    descInput.placeholder = 'Description';
    descInput.maxLength = 80;

    const presets = loadOtherPresets();
    if (presets.length) {
      const listId = 'otherPresetsList';
      descInput.setAttribute('list', listId);
      const datalist = document.createElement('datalist');
      datalist.id = listId;
      presets.forEach(item => {
        const option = document.createElement('option');
        option.value = item.description;
        option.label = item.description + ' — ' + fmtMoney(item.amount);
        datalist.appendChild(option);
      });
      fields.appendChild(datalist);
    }

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.id = 'otherAmount';
    amountInput.min = '0';
    amountInput.max = '1000';
    amountInput.step = '0.01';
    amountInput.placeholder = 'Amount';

    const qtyWrap = document.createElement('div');
    qtyWrap.className = 'qty-wrap';
    qtyWrap.innerHTML = '<span class="muted">Qty</span>';

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.id = 'otherQty';
    qtyInput.min = '0';
    qtyInput.step = '1';
    qtyInput.value = '0';
    qtyInput.className = 'qty-input noncovered-qty';
    qtyWrap.appendChild(qtyInput);

    const presetMap = {};
    presets.forEach(item => { presetMap[item.description] = Number(item.amount); });

    descInput.addEventListener('change', () => {
      const desc = descInput.value.trim();
      if (desc && presetMap[desc] !== undefined && !Number(amountInput.value)) {
        amountInput.value = presetMap[desc].toFixed(2);
      }
      recalc();
    });
    amountInput.addEventListener('input', recalc);
    qtyInput.addEventListener('input', recalc);
    amountInput.addEventListener('blur', () => {
      const desc = descInput.value.trim();
      const amt = normalizeAmount(amountInput.value);
      const qty = normalizeQty(qtyInput.value);
      if (desc && amt > 0 && qty > 0) saveOtherPreset(desc, amt);
    });
    descInput.addEventListener('blur', () => {
      const desc = descInput.value.trim();
      const amt = normalizeAmount(amountInput.value);
      const qty = normalizeQty(qtyInput.value);
      if (desc && amt > 0 && qty > 0) saveOtherPreset(desc, amt);
    });

    fields.appendChild(descInput);
    fields.appendChild(amountInput);
    row.appendChild(left);
    row.appendChild(fields);
    row.appendChild(qtyWrap);
    nonCoveredList.appendChild(row);
  }

  function renderNonCovered(){
    nonCoveredList.innerHTML = '';
    data.nonCoveredDefaults.forEach(item => {
      if (state.nonCoveredQty[item.id] === undefined) state.nonCoveredQty[item.id] = item.defaultQty || 0;
      const row = document.createElement('div');
      row.className = 'noncovered-item';

      const text = document.createElement('div');
      text.innerHTML = '<strong>' + item.label + '</strong><div class="muted">' + fmtMoney(item.amount) + ' each</div>';

      const qtyWrap = document.createElement('div');
      qtyWrap.className = 'qty-wrap';
      qtyWrap.innerHTML = '<span class="muted">Qty</span>';

      const qty = document.createElement('input');
      qty.type = 'number';
      qty.min = '0';
      qty.step = '1';
      qty.className = 'qty-input noncovered-qty';
      qty.value = state.nonCoveredQty[item.id];
      qty.addEventListener('input', () => {
        state.nonCoveredQty[item.id] = normalizeQty(qty.value);
        recalc();
      });
      qtyWrap.appendChild(qty);

      const amount = document.createElement('strong');
      amount.textContent = fmtMoney(item.amount);
      row.appendChild(text);
      row.appendChild(qtyWrap);
      row.appendChild(amount);
      nonCoveredList.appendChild(row);
    });
    renderOtherRow();
  }

  function renderPlanTable(){
    planTableBody.innerHTML = '';
    data.cptCatalog.forEach(item => {
      if (state.quantities[item.code] === undefined) state.quantities[item.code] = data.standardPlan[item.code] || 0;
      const tr = document.createElement('tr');
      tr.dataset.code = item.code;

      const categoryTd = document.createElement('td');
      categoryTd.textContent = item.category || '';

      const codeTd = document.createElement('td');
      codeTd.innerHTML = '<strong>' + (item.code === '99213' ? '99213 / 99213-25 estimate' : item.code) + '</strong><div class="muted">' + (serviceLabels[item.code] || '') + '</div>';

      const qtyTd = document.createElement('td');
      const qtyInput = document.createElement('input');
      qtyInput.className = 'qty-input';
      qtyInput.type = 'number';
      qtyInput.min = '0';
      qtyInput.step = '1';
      qtyInput.value = state.quantities[item.code];
      qtyInput.addEventListener('input', () => {
        state.quantities[item.code] = normalizeQty(qtyInput.value);
        recalc();
      });
      qtyTd.appendChild(qtyInput);

      const allowedTd = document.createElement('td');
      allowedTd.className = 'money allowed';

      const subtotalTd = document.createElement('td');
      subtotalTd.className = 'money subtotal';

      const notesTd = document.createElement('td');
      notesTd.className = 'note notes';

      tr.appendChild(categoryTd);
      tr.appendChild(codeTd);
      tr.appendChild(qtyTd);
      tr.appendChild(allowedTd);
      tr.appendChild(subtotalTd);
      tr.appendChild(notesTd);
      planTableBody.appendChild(tr);
    });
  }

  function selectedInsuranceSchedule(){
    const name = insuranceSelect.value;
    state.insurance = name;
    return data.feeSchedules[name] || {};
  }

  function recalc(){
    const schedule = selectedInsuranceSchedule();
    const insurerNotes = data.insurerCodeNotes[state.insurance] || {};
    let coveredTotal = 0;
    let fullFeeTotal = 0;
    let missingCodes = [];
    let visitCount = 0;

    [...planTableBody.querySelectorAll('tr')].forEach(tr => {
      const code = tr.dataset.code;
      const qty = normalizeQty(state.quantities[code]);
      const allowed = schedule[code];
      const allowedCell = tr.querySelector('.allowed');
      const subtotalCell = tr.querySelector('.subtotal');
      const notesCell = tr.querySelector('.notes');
      const hasAllowed = typeof allowed === 'number' && !Number.isNaN(allowed);
      const subtotal = hasAllowed ? allowed * qty : 0;
      const fullFee = Number(fullFeeSchedule[code] || 0);

      if (qty > 0) visitCount = Math.max(visitCount, qty);
      if (qty > 0 && !hasAllowed) missingCodes.push(code);

      coveredTotal += subtotal;
      fullFeeTotal += fullFee * qty;
      allowedCell.textContent = hasAllowed ? fmtMoney(allowed) : '—';
      subtotalCell.textContent = qty > 0 ? fmtMoney(subtotal) : '—';

      const noteParts = [];
      if (insurerNotes[code]) noteParts.push(insurerNotes[code]);
      if (code === '99213' && qty > 0) noteParts.push('Used for 99213-25 estimate.');
      if (!hasAllowed && qty > 0) noteParts.push('No allowed amount in fee sheet.');
      notesCell.textContent = noteParts.join(' ');
    });

    const deductible = Math.max(0, Number(deductibleInput.value) || 0);
    const coinsurancePct = Math.max(0, Math.min(100, Number(coinsuranceInput.value) || 0)) / 100;
    const copay = Math.max(0, Number(copayInput.value) || 0);
    const copayVisits = Math.max(0, Number(copayVisitsInput.value) || 0);

    const patientDeductiblePortion = Math.min(deductible, coveredTotal);
    const remainingCoveredAfterDeductible = Math.max(0, coveredTotal - patientDeductiblePortion);
    const patientCoinsurancePortion = remainingCoveredAfterDeductible * coinsurancePct;
    const patientCopayPortion = copay * copayVisits;

    let nonCoveredTotal = 0;
    let nonCoveredFullFeeTotal = 0;
    const nonCoveredSelected = [];
    data.nonCoveredDefaults.forEach(item => {
      const qty = normalizeQty(state.nonCoveredQty[item.id]);
      if (qty > 0) {
        const lineTotal = item.amount * qty;
        const fullLineTotal = Number(nonCoveredFullFeeMap[item.id] || item.amount || 0) * qty;
        nonCoveredTotal += lineTotal;
        nonCoveredFullFeeTotal += fullLineTotal;
        nonCoveredSelected.push(item.label + ' × ' + qty + ' — ' + fmtMoney(lineTotal));
      }
    });

    const otherDescriptionEl = document.getElementById('otherDescription');
    const otherAmountEl = document.getElementById('otherAmount');
    const otherQtyEl = document.getElementById('otherQty');
    const otherDescription = otherDescriptionEl ? otherDescriptionEl.value.trim() : '';
    const otherAmount = otherAmountEl ? normalizeAmount(otherAmountEl.value) : 0;
    const otherQty = otherQtyEl ? normalizeQty(otherQtyEl.value) : 0;
    if (otherDescription && otherAmount > 0 && otherQty > 0) {
      const otherTotal = otherAmount * otherQty;
      nonCoveredTotal += otherTotal;
      nonCoveredFullFeeTotal += otherTotal;
      nonCoveredSelected.push(otherDescription + ' × ' + otherQty + ' — ' + fmtMoney(otherTotal));
    }

    fullFeeTotal += nonCoveredFullFeeTotal;

    const patientResponsibility = patientDeductiblePortion + patientCoinsurancePortion + patientCopayPortion + nonCoveredTotal;
    const insurancePortion = Math.max(0, coveredTotal - patientDeductiblePortion - patientCoinsurancePortion);
    const totalPlanVisits = normalizeQty(state.quantities['98941']) + normalizeQty(state.nonCoveredQty['nc98941']);
    const averageCostPerVisit = totalPlanVisits > 0 ? patientResponsibility / totalPlanVisits : 0;

    const activeServiceRows = data.cptCatalog
      .map(item => {
        const code = item.code;
        const qty = normalizeQty(state.quantities[code]);
        const allowed = schedule[code];
        const hasAllowed = typeof allowed === 'number' && !Number.isNaN(allowed);
        const fullFee = Number(fullFeeSchedule[code] || 0);
        return {
          category: item.category || '',
          code: code === '99213' ? '99213-25' : code,
          serviceLabel: serviceLabels[item.code] || item.code,
          qty,
          fullFee,
          allowed,
          subtotal: hasAllowed ? allowed * qty : 0,
          hasAllowed
        };
      })
      .filter(row => row.qty > 0);

    fullFeeTotalEl.textContent = fmtMoney(fullFeeTotal);
    coveredTotalEl.textContent = fmtMoney(coveredTotal);
    insurancePortionEl.textContent = fmtMoney(insurancePortion);
    patientResponsibilityEl.textContent = fmtMoney(patientResponsibility);

    detailList.innerHTML = '';
    [
      'Patient: ' + (patientName.value.trim() || 'Not entered'),
      'Insurance: ' + (state.insurance || 'Not selected'),
      'Total cost at full fees: ' + fmtMoney(fullFeeTotal),
      'Total allowed amount: ' + fmtMoney(coveredTotal),
      'Deductible applied to covered services: ' + fmtMoney(patientDeductiblePortion),
      'Coinsurance patient portion: ' + fmtMoney(patientCoinsurancePortion),
      'Copay estimate: ' + fmtMoney(patientCopayPortion) + ' (' + copayVisits + ' visits × ' + fmtMoney(copay) + ')',
      'Selected non-covered items: ' + (nonCoveredSelected.length ? nonCoveredSelected.join('; ') : 'None'),
      'Non-covered total: ' + fmtMoney(nonCoveredTotal),
      'Average cost per visit: ' + fmtMoney(averageCostPerVisit) + ' (' + totalPlanVisits + ' visits)'
    ].forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      detailList.appendChild(li);
    });

    paymentList.innerHTML = '';
    const discountPct = Math.max(0, Math.min(100, Number(payInFullDiscountInput.value) || 0));
    const nonCoveredDiscountAmount = nonCoveredTotal * (discountPct / 100);
    const payInFullAmount = patientResponsibility - nonCoveredDiscountAmount;
    const monthsA = Math.max(1, Number(monthsAInput.value) || 3);
    const monthsB = Math.max(1, Number(monthsBInput.value) || 6);
    const paymentOptionTexts = [
      'Average cost per visit: ' + fmtMoney(averageCostPerVisit) + ' (' + totalPlanVisits + ' visits)',
      'Pay in full (' + discountPct + '% discount on non-covered services): ' + fmtMoney(payInFullAmount),
      monthsA + '-month plan: ' + fmtMoney(patientResponsibility / monthsA) + ' / month',
      monthsB + '-month plan: ' + fmtMoney(patientResponsibility / monthsB) + ' / month'
    ];
    paymentOptionTexts.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      paymentList.appendChild(li);
    });

    printClinicName.textContent = clinicName.value.trim() || 'Chiropractic Company';
    printPatientName.textContent = patientName.value.trim() || 'Not entered';
    printDate.textContent = displayDate(planDate.value);
    printInsurance.textContent = state.insurance || 'Not selected';
    printEstimateAcknowledge.checked = !!estimateAcknowledge.checked;
    printFullFeeTotal.textContent = fmtMoney(fullFeeTotal);
    printCoveredTotal.textContent = fmtMoney(coveredTotal);
    printPatientResponsibility.textContent = fmtMoney(patientResponsibility);

    printServicesBody.innerHTML = '';
    activeServiceRows.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + row.category + '</td>' +
        '<td><strong>' + row.code + '</strong><div class="print-service-label">' + row.serviceLabel + '</div></td>' +
        '<td class="money">' + row.qty + '</td>' +
        '<td class="money">' + fmtMoney(row.fullFee) + '</td>' +
        '<td class="money">' + (row.hasAllowed ? fmtMoney(row.allowed) : '—') + '</td>' +
        '<td class="money">' + fmtMoney(row.subtotal) + '</td>';
      printServicesBody.appendChild(tr);
    });
    if (!activeServiceRows.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="6">No services with units are currently included.</td>';
      printServicesBody.appendChild(tr);
    }

    printPaymentList.innerHTML = '';
    paymentOptionTexts.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      printPaymentList.appendChild(li);
    });

    printNonCoveredList.innerHTML = '';
    if (nonCoveredSelected.length) {
      nonCoveredSelected.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        printNonCoveredList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'None selected';
      printNonCoveredList.appendChild(li);
    }

    assumptionList.innerHTML = '';
    const assumptionItems = [];
    data.planAssumptions.forEach(text => assumptionItems.push(text));
    if (missingCodes.length) assumptionItems.push('Missing allowed amounts for selected codes under this payer: ' + missingCodes.join(', ') + '. Those lines are estimated at ' + fmtMoney(0) + '.');
    const insurerNoteCodes = Object.keys(insurerNotes);
    if (insurerNoteCodes.length) assumptionItems.push('Payer-specific fee sheet notes present for: ' + insurerNoteCodes.join(', ') + '. See service notes column.');
    if (!coveredTotal) assumptionItems.push('Covered allowed total is currently ' + fmtMoney(0) + '. Confirm the payer selection and service quantities.');
    assumptionItems.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      if (text.includes('Missing allowed amounts') || text.includes('currently $0.00')) li.className = 'warning';
      assumptionList.appendChild(li);
    });
  }

  function resetPlan(){
    Object.keys(state.quantities).forEach(code => {
      state.quantities[code] = data.standardPlan[code] || 0;
    });
    [...planTableBody.querySelectorAll('tr')].forEach(tr => {
      const code = tr.dataset.code;
      const input = tr.querySelector('input');
      input.value = state.quantities[code];
    });
    deductibleInput.value = 0;
    coinsuranceInput.value = 0;
    copayInput.value = 0;
    copayVisitsInput.value = 24;
    payInFullDiscountInput.value = 10;
    monthsAInput.value = 3;
    monthsBInput.value = 6;
    data.nonCoveredDefaults.forEach(item => state.nonCoveredQty[item.id] = item.defaultQty || 0);
    renderNonCovered();
    const otherDescriptionEl = document.getElementById('otherDescription');
    const otherAmountEl = document.getElementById('otherAmount');
    const otherQtyEl = document.getElementById('otherQty');
    if (otherDescriptionEl) otherDescriptionEl.value = '';
    if (otherAmountEl) otherAmountEl.value = '';
    if (otherQtyEl) otherQtyEl.value = 0;
    recalc();
  }

  insuranceSearch.addEventListener('input', () => {
    const current = insuranceSelect.value;
    state.insurance = current;
    buildInsuranceList(insuranceSearch.value);
    recalc();
  });

  insuranceSelect.addEventListener('change', recalc);
  document.getElementById('recalculateBtn').addEventListener('click', recalc);
  document.getElementById('resetBtn').addEventListener('click', resetPlan);
  document.getElementById('printBtn').addEventListener('click', () => {
    const originalTitle = document.title;
    const safePatient = (patientName.value.trim() || 'Patient').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
    const safeDate = (planDate.value || todayString()).replace(/-/g, '');
    document.title = safePatient + '_FinancialCarePlan_' + safeDate;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  });
  [clinicName, patientName, planDate, deductibleInput, coinsuranceInput, copayInput, copayVisitsInput, payInFullDiscountInput, monthsAInput, monthsBInput]
    .forEach(el => el.addEventListener('input', recalc));
  estimateAcknowledge.addEventListener('change', recalc);

  clinicName.value = clinicName.value || 'Chiropractic Company';
  planDate.value = todayString();
  buildInsuranceList();
  renderNonCovered();
  renderPlanTable();
  recalc();
})();
