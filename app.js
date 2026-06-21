(function () {
  "use strict";

  const CSV_URL = "./forecast.csv";
  const STORAGE_CSV = "tenki.forecastCsv";
  const STORAGE_SECTIONS = "tenki.selectedSections";
  const STORAGE_SIZE = "tenki.displaySize";

  const SECTION_INDEX = 2;
  const ELEMENT_INDEX = 13;
  const FIRST_HOUR_INDEX = 14;

  const excludedSections = new Set([
    "松井田妙義〜碓氷軽井沢",
    "碓氷軽井沢〜佐久",
    "佐久〜東部湯の丸・佐久小諸JCT〜小諸御影TB",
    "東部湯の丸〜坂城",
  ]);

  const sectionReplacements = [
    ["須坂長野東", "須坂"],
    ["信州中野", "中野"],
    ["豊田飯山", "飯山"],
    ["更埴JCT", "更埴"],
  ];

  const elementOrder = [
    { source: "天気", label: "天気", key: "weather" },
    { source: "降雪量(cm/h)", label: "降雪", key: "snowfall" },
    { source: "気温(℃)", label: "気温", key: "airtemp" },
    { source: "路温(℃)", label: "路温", key: "roadtemp" },
    { source: "路面状態", label: "路面", key: "roadstate" },
  ];

  const sizeClasses = {
    small: "size-small",
    standard: "",
    large: "size-large",
  };

  const weatherIcons = {
    "〇": '<svg viewBox="0 0 24 24" class="weather-icon sun" aria-label="晴れ"><circle cx="12" cy="12" r="5" fill="#f97316"/><g stroke="#f97316" stroke-width="2" stroke-linecap="round"><line x1="12" y1="3" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="3" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21" y2="12"/><line x1="5.64" y1="5.64" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="18.36" y2="18.36"/><line x1="5.64" y1="18.36" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="18.36" y2="5.64"/></g></svg>',
    "○": '<svg viewBox="0 0 24 24" class="weather-icon sun" aria-label="晴れ"><circle cx="12" cy="12" r="5" fill="#f97316"/><g stroke="#f97316" stroke-width="2" stroke-linecap="round"><line x1="12" y1="3" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="3" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21" y2="12"/><line x1="5.64" y1="5.64" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="18.36" y2="18.36"/><line x1="5.64" y1="18.36" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="18.36" y2="5.64"/></g></svg>',
    "◎": '<svg viewBox="0 0 24 24" class="weather-icon cloud" aria-label="曇り"><path d="M17 18a4 4 0 0 0 0-8h-1.5a5.5 5.5 0 0 0-10.5 2H5a4 4 0 0 0 0 8h12z" fill="#94a3b8"/></svg>',
    "●": '<svg viewBox="0 0 24 24" class="weather-icon rain" aria-label="雨"><path d="M17 15a4 4 0 0 0 0-8h-1.5a5.5 5.5 0 0 0-10.5 2H5a4 4 0 0 0 0 8h12z" fill="#475569"/><path d="M7 19.5a2.5 2.5 0 0 0 2.5-2.5c0-1.5-2.5-4.2-2.5-4.2s-2.5 2.7-2.5 4a2.5 2.5 0 0 0 2.5 2.5z" fill="#1d4ed8"/><path d="M14 19.5a2.5 2.5 0 0 0 2.5-2.5c0-1.5-2.5-4.2-2.5-4.2s-2.5 2.7-2.5 4a2.5 2.5 0 0 0 2.5 2.5z" fill="#1d4ed8"/></svg>',
    "＊": '<svg viewBox="0 0 24 24" class="weather-icon snow" aria-label="雪"><circle cx="12" cy="16" r="5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/><circle cx="12" cy="9.5" r="3.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/><path d="M9.5 6.5l1-3h3l1 3z" fill="#ef4444"/><line x1="8.5" y1="6.5" x2="15.5" y2="6.5" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/><path d="M10 12.5h4" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/><path d="M13.5 12.5l1.5 3" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/></svg>',
    "*": '<svg viewBox="0 0 24 24" class="weather-icon snow" aria-label="雪"><circle cx="12" cy="16" r="5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/><circle cx="12" cy="9.5" r="3.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/><path d="M9.5 6.5l1-3h3l1 3z" fill="#ef4444"/><line x1="8.5" y1="6.5" x2="15.5" y2="6.5" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/><path d="M10 12.5h4" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/><path d="M13.5 12.5l1.5 3" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/></svg>',
    "み": '<svg viewBox="0 0 24 24" class="weather-icon sleet" aria-label="みぞれ"><path d="M17 15a4 4 0 0 0 0-8h-1.5a5.5 5.5 0 0 0-10.5 2H5a4 4 0 0 0 0 8h12z" fill="#475569"/><path d="M10 20a2.2 2.2 0 0 0 2.2-2.2c0-1.3-2.2-3.8-2.2-3.8s-2.2 2.5-2.2 3.8A2.2 2.2 0 0 0 10 20z" fill="#1d4ed8"/><g stroke="#dbeafe" stroke-width="1.8" stroke-linecap="round"><line x1="6" y1="15" x2="6" y2="20"/><line x1="3.5" y1="17.5" x2="8.5" y2="17.5"/><line x1="4.2" y1="15.7" x2="7.8" y2="19.3"/><line x1="4.2" y1="19.3" x2="7.8" y2="15.7"/></g><g stroke="#dbeafe" stroke-width="1.8" stroke-linecap="round"><line x1="16.5" y1="15" x2="16.5" y2="20"/><line x1="14" y1="17.5" x2="19" y2="17.5"/><line x1="14.7" y1="15.7" x2="18.3" y2="19.3"/><line x1="14.7" y1="19.3" x2="18.3" y2="15.7"/></g></svg>'
  };

  const state = {
    forecast: null,
    selectedSections: null,
    displaySize: "standard",
  };

  const tableWrap = document.getElementById("tableWrap");
  const announcementTime = document.getElementById("announcementTime");
  const staleBanner = document.getElementById("staleBanner");
  const filterButton = document.getElementById("filterButton");
  const closeSheetButton = document.getElementById("closeSheetButton");
  const filterSheet = document.getElementById("filterSheet");
  const sheetOverlay = document.getElementById("sheetOverlay");
  const sectionList = document.getElementById("sectionList");

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    applySavedDisplaySize();
    bindSheetEvents();
    tableWrap.innerHTML = '<div class="status-message">読み込み中です</div>';

    try {
      const csvText = await fetchLatestCsv();
      safeSet(STORAGE_CSV, csvText);
      staleBanner.hidden = true;
      loadForecast(csvText);
    } catch (error) {
      const cachedCsv = safeGet(STORAGE_CSV);
      if (!cachedCsv) {
        announcementTime.textContent = "読み込み失敗";
        tableWrap.innerHTML = '<div class="status-message">forecast.csv を読み込めませんでした</div>';
        return;
      }
      staleBanner.hidden = false;
      loadForecast(cachedCsv);
    }
  }

  async function fetchLatestCsv() {
    const response = await fetch(`${CSV_URL}?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`CSV fetch failed: ${response.status}`);
    }
    return response.text();
  }

  function loadForecast(csvText) {
    const parsed = Papa.parse(csvText, {
      skipEmptyLines: true,
    });

    if (parsed.errors && parsed.errors.length) {
      throw new Error(parsed.errors[0].message);
    }

    state.forecast = buildForecast(parsed.data);
    announcementTime.textContent = formatAnnouncement(state.forecast.announcementRaw);
    hydrateSelectedSections();
    renderSectionList();
    renderTable();
  }

  function buildForecast(rows) {
    const header = rows[0] || [];
    const hourLabels = header.slice(FIRST_HOUR_INDEX);
    const baseYear = extractYear(header[0]) || new Date().getFullYear();
    const baseMonth = extractMonth(header[0]) || new Date().getMonth() + 1;
    const hours = parseHourLabels(hourLabels, baseYear, baseMonth);
    const sections = [];
    let currentBlock = null;

    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      const sectionName = clean(row[SECTION_INDEX]);
      const elementName = clean(row[ELEMENT_INDEX]);

      if (sectionName) {
        currentBlock = null;
        if (excludedSections.has(sectionName)) {
          continue;
        }
        currentBlock = createSectionBlock(sectionName, sections.length);
        sections.push(currentBlock);
      }

      if (!currentBlock || !elementName) {
        continue;
      }

      const values = row.slice(FIRST_HOUR_INDEX, FIRST_HOUR_INDEX + hours.length);
      currentBlock.rowsByElement[elementName] = values;
    }

    return {
      announcementRaw: header[0] || "",
      hours,
      dateGroups: buildDateGroups(hours),
      sections,
    };
  }

  function createSectionBlock(rawName, index) {
    const displayName = normalizeSectionName(rawName);
    const endpoints = splitSection(displayName);
    return {
      id: `${index}:${rawName}`,
      rawName,
      displayName,
      endpoints,
      rowsByElement: Object.create(null),
    };
  }

  function normalizeSectionName(name) {
    return sectionReplacements.reduce((value, pair) => value.split(pair[0]).join(pair[1]), name);
  }

  function splitSection(name) {
    const parts = name.split("〜");
    if (parts.length < 2) {
      return [name, ""];
    }
    return [parts[0], parts.slice(1).join("〜")];
  }

  function buildDateGroups(hours) {
    const groups = [];
    for (const hour of hours) {
      const last = groups[groups.length - 1];
      if (last && last.key === hour.dateKey) {
        last.count += 1;
      } else {
        groups.push({
          key: hour.dateKey,
          label: hour.dateLabel,
          weekdayClass: hour.weekdayClass,
          count: 1,
        });
      }
    }
    return groups;
  }

  function parseHourLabels(labels, baseYear, baseMonth) {
    let currentMonth = baseMonth;
    let previousDay = null;

    return labels.map((label) => {
      const match = String(label || "").match(/(\d{1,2})日(\d{1,2})時/);
      const day = match ? Number(match[1]) : previousDay || 1;
      if (previousDay !== null && day < previousDay) {
        currentMonth += 1;
      }
      previousDay = day;
      return parseHourLabel(label, baseYear, currentMonth);
    });
  }

  function parseHourLabel(label, baseYear, month) {
    const match = String(label || "").match(/(\d{1,2})日(\d{1,2})時/);
    const now = new Date();
    const day = match ? Number(match[1]) : now.getDate();
    const hour = match ? Number(match[2]) : 0;
    const date = new Date(baseYear, month - 1, day, hour);
    const displayMonth = date.getMonth() + 1;
    const displayDay = date.getDate();
    const weekday = date.getDay();
    return {
      raw: label,
      hour,
      dateKey: `${displayMonth}/${displayDay}`,
      dateLabel: `${displayMonth}/${displayDay}(${["日", "月", "火", "水", "木", "金", "土"][weekday]})`,
      weekdayClass: weekday === 0 ? "sunday" : weekday === 6 ? "saturday" : "weekday",
    };
  }

  function extractYear(value) {
    const match = String(value || "").match(/(\d{4})年/);
    return match ? Number(match[1]) : null;
  }

  function extractMonth(value) {
    const match = String(value || "").match(/(\d{1,2})月/);
    return match ? Number(match[1]) : null;
  }

  function formatAnnouncement(value) {
    const match = String(value || "").match(/(\d{4})年0?(\d{1,2})月0?(\d{1,2})日0?(\d{1,2})時0?(\d{1,2})分発表/);
    if (!match) {
      return value || "発表時刻不明";
    }
    return `${match[1]}/${Number(match[2])}/${Number(match[3])} ${pad2(match[4])}:${pad2(match[5])}発表`;
  }

  function hydrateSelectedSections() {
    const saved = safeJsonGet(STORAGE_SECTIONS);
    const validIds = new Set(state.forecast.sections.map((section) => section.id));

    if (Array.isArray(saved)) {
      state.selectedSections = new Set(saved.filter((id) => validIds.has(id)));
      return;
    }

    state.selectedSections = new Set(validIds);
  }

  function renderSectionList() {
    sectionList.replaceChildren();
    const fragment = document.createDocumentFragment();

    for (const section of state.forecast.sections) {
      const label = document.createElement("label");
      label.className = "section-option";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = state.selectedSections.has(section.id);
      input.addEventListener("change", () => {
        if (input.checked) {
          state.selectedSections.add(section.id);
        } else {
          state.selectedSections.delete(section.id);
        }
        persistSelectedSections();
        renderTable();
      });

      const text = document.createElement("span");
      text.textContent = section.displayName;

      label.append(input, text);
      fragment.append(label);
    }

    sectionList.append(fragment);
    updateSizeButtons();
  }

  function renderTable() {
    const selected = state.forecast.sections.filter((section) => state.selectedSections.has(section.id));
    if (!selected.length) {
      tableWrap.innerHTML = '<div class="empty-state">表示する区間が選択されていません<br>右上のフィルタから区間を選択してください</div>';
      return;
    }

    const table = document.createElement("table");
    table.className = "forecast-table";
    table.append(renderTableHead(), renderTableBody(selected));
    tableWrap.replaceChildren(table);
  }

  function renderTableHead() {
    const thead = document.createElement("thead");
    const dateRow = document.createElement("tr");
    const timeRow = document.createElement("tr");

    const sectionCorner = document.createElement("th");
    sectionCorner.className = "corner-section";
    sectionCorner.rowSpan = 2;
    sectionCorner.textContent = "区間";

    const elementCorner = document.createElement("th");
    elementCorner.className = "corner-element";
    elementCorner.rowSpan = 2;
    elementCorner.textContent = "要素";

    dateRow.append(sectionCorner, elementCorner);

    for (const group of state.forecast.dateGroups) {
      const th = document.createElement("th");
      th.className = `date-cell ${group.weekdayClass}`;
      th.colSpan = group.count;
      
      const span = document.createElement("span");
      span.className = "date-label";
      span.textContent = group.label;
      th.append(span);
      
      dateRow.append(th);
    }

    state.forecast.hours.forEach((hour, index) => {
      const th = document.createElement("th");
      th.className = `hour-cell${isDayStart(index) ? " day-start" : ""}`;
      th.textContent = String(hour.hour);
      timeRow.append(th);
    });

    thead.append(dateRow, timeRow);
    return thead;
  }

  function renderTableBody(sections) {
    const tbody = document.createElement("tbody");

    for (const section of sections) {
      elementOrder.forEach((element, elementIndex) => {
        const tr = document.createElement("tr");
        if (elementIndex === 0) {
          tr.className = "section-start";
          const sectionCell = document.createElement("th");
          sectionCell.className = "section-cell";
          sectionCell.rowSpan = elementOrder.length;
          sectionCell.append(renderSectionRoute(section));
          tr.append(sectionCell);
        }

        const elementCell = document.createElement("th");
        elementCell.className = "element-cell";
        elementCell.textContent = element.label;
        tr.append(elementCell);

        const values = section.rowsByElement[element.source] || [];
        for (let i = 0; i < state.forecast.hours.length; i += 1) {
          const td = document.createElement("td");
          td.className = `value-cell${isDayStart(i) ? " day-start" : ""}`;
          const rawValue = clean(values[i]);
          if (element.key === "weather" && weatherIcons[rawValue]) {
            td.innerHTML = weatherIcons[rawValue];
          } else {
            td.textContent = formatValue(element.key, values[i]);
          }
          tr.append(td);
        }

        tbody.append(tr);
      });
    }

    return tbody;
  }

  function renderSectionRoute(section) {
    const wrapper = document.createElement("div");
    wrapper.className = "section-route";

    const start = document.createElement("div");
    start.className = "section-endpoint";
    start.textContent = section.endpoints[0];

    const line = document.createElement("div");
    line.className = "section-line";

    const end = document.createElement("div");
    end.className = "section-endpoint";
    end.textContent = section.endpoints[1];

    wrapper.append(start, line, end);
    return wrapper;
  }

  function formatValue(elementKey, value) {
    const text = clean(value);
    if (!text || text === "-") {
      return "";
    }
    if (elementKey === "roadstate") {
      return Array.from(text)[0] || "";
    }
    return text;
  }

  function isDayStart(index) {
    return index > 0 && state.forecast.hours[index].dateKey !== state.forecast.hours[index - 1].dateKey;
  }

  function bindSheetEvents() {
    filterButton.addEventListener("click", openSheet);
    closeSheetButton.addEventListener("click", closeSheet);
    sheetOverlay.addEventListener("click", closeSheet);

    document.querySelectorAll("[data-size]").forEach((button) => {
      button.addEventListener("click", () => {
        setDisplaySize(button.dataset.size);
      });
    });
  }

  function openSheet() {
    sheetOverlay.hidden = false;
    filterSheet.classList.add("is-open");
    filterSheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("sheet-open");
  }

  function closeSheet() {
    filterSheet.classList.remove("is-open");
    filterSheet.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sheet-open");
    window.setTimeout(() => {
      if (!filterSheet.classList.contains("is-open")) {
        sheetOverlay.hidden = true;
      }
    }, 170);
  }

  function applySavedDisplaySize() {
    const saved = safeGet(STORAGE_SIZE);
    setDisplaySize(saved && sizeClasses[saved] !== undefined ? saved : "standard", false);
  }

  function setDisplaySize(size, persist = true) {
    state.displaySize = size;
    document.body.classList.remove("size-small", "size-large");
    if (sizeClasses[size]) {
      document.body.classList.add(sizeClasses[size]);
    }
    if (persist) {
      safeSet(STORAGE_SIZE, size);
    }
    updateSizeButtons();
  }

  function updateSizeButtons() {
    document.querySelectorAll("[data-size]").forEach((button) => {
      const active = button.dataset.size === state.displaySize;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
    });
  }

  function persistSelectedSections() {
    safeSet(STORAGE_SECTIONS, JSON.stringify(Array.from(state.selectedSections)));
  }

  function clean(value) {
    return String(value ?? "").trim();
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function safeGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_error) {
      // Rendering should continue even when localStorage is unavailable.
    }
  }

  function safeJsonGet(key) {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (_error) {
      return null;
    }
  }
})();
