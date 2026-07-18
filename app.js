const state = {
  role: "cpa",
  route: "dashboard",
  dashboardScope: "mine",
  dashboardQuery: "",
  dashboardPage: 1,
  dashboardPageSize: 8,
  dashboardSelectedReturnId: "return-ashford-2025",
  workspaceTab: "overview",
  reviewFieldId: "federal-wages",
  activeReturnId: "return-ashford-2025",
  collaborationFilter: "all",
  statusLens: "shared",
  complexityQuery: "",
  complexityFilter: "all",
  complexityLimit: 18,
  complexityItemId: "item-1",
  correctionFieldId: null,
  clientUploadComplete: false,
  clientVehicleConfirmed: false,
};

const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const ALLOWED_UPLOAD_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

const roles = {
  cpa: {
    label: "Firm · Preparer",
    copy: "Firm context · personal assignments, a 148-return firm queue, internal notes, and review tools.",
  },
  reviewer: {
    label: "Firm · Reviewer",
    copy: "Quality-control context · evidence, approvals, and reviewer-ready work.",
  },
  client: {
    label: "Personal · Client",
    copy: "Personal-return context · client-safe tasks, messages, and progress.",
  },
};

const data = {
  returns: [
    {
      id: "return-ashford-2025",
      client: "Ashford Design LLC",
      year: "2025",
      entity: "S-Corp",
      stage: "Waiting on client",
      nextOwner: "Client",
      blocking: "Missing officer health insurance statement",
      urgency: "Today",
      completion: 72,
      summary:
        "Most of the return is assembled. Two source-linked fields need confirmation before review can finish.",
      assignedTo: "Aravind",
      counts: { openRequests: 2, reviewFlags: 3, verifiedFields: 18, totalFields: 24 },
    },
    {
      id: "return-ramos-2025",
      client: "Ramos Family",
      year: "2025",
      entity: "1040",
      stage: "CPA verification needed",
      nextOwner: "CPA",
      blocking: "1099-R withholding mismatch",
      urgency: "High",
      completion: 61,
      summary: "The system mapped $21,460 from 1099-R Box 4 to federal withholding with 64% confidence. A CPA must verify the source.",
      assignedTo: "Aravind",
      counts: { openRequests: 0, reviewFlags: 4, verifiedFields: 11, totalFields: 19 },
    },
    {
      id: "return-parker-2025",
      client: "Parker & Bloom",
      year: "2025",
      entity: "Partnership",
      stage: "Ready for reviewer",
      nextOwner: "Reviewer",
      blocking: "Confirm foreign transaction disclosure classification",
      urgency: "Normal",
      completion: 93,
      summary: "Preparation is complete; one disclosure classification awaits reviewer judgment.",
      assignedTo: "Maya Chen",
      counts: { openRequests: 0, reviewFlags: 1, verifiedFields: 29, totalFields: 31 },
    },
  ],
  priorityCards: [
    {
      type: "risk",
      title: "Fix withholding mismatch on Ramos Family return",
      reason: "The source match is only 64% confident because nearby Box 4 and Box 14 labels overlap.",
      action: "Open traceability review",
      returnId: "return-ramos-2025",
      route: "review",
      badge: "Highest risk · Needs review",
    },
    {
      type: "today",
      title: "Ask Ashford Design for one missing source document",
      reason: "Everything else is ready. One document is blocking completion and the client already logged in today.",
      action: "Open client-linked request",
      returnId: "return-ashford-2025",
      route: "workspace",
      badge: "Fast unblock · Client online",
    },
    {
      type: "client",
      title: "Start Parker reviewer handoff",
      reason: "Preparation is complete, so the reviewer can resolve the final disclosure classification without preparer follow-up.",
      action: "Open return workspace",
      returnId: "return-parker-2025",
      route: "workspace",
      badge: "Ready for review",
    },
  ],
  timeline: [
    { label: "Documents received", state: "ready", note: "W-2, 1099s, prior-year package uploaded" },
    { label: "Document fields captured", state: "ready", note: "24 source-linked fields prepared for review" },
    { label: "Client follow-up needed", state: "blocked", note: "Officer insurance statement still missing" },
    { label: "Reviewer handoff", state: "ready", note: "Available once missing document arrives" },
  ],
  workspace: {
    links: ["Return overview", "Messages", "Officer insurance request", "K-1 questionnaire"],
    messages: [
      {
        audience: "Client-visible",
        owner: "CPA",
        body: "We are missing the officer health insurance statement for 2025. Uploading it will unblock final review.",
        nextAction: "Client uploads document",
      },
      {
        audience: "Internal note",
        owner: "Reviewer",
        body: "Once insurance is uploaded, re-check shareholder wage reasonableness before sign-off.",
        nextAction: "CPA re-checks after upload",
      },
    ],
    requests: [
      { title: "Officer health insurance statement", due: "Today", state: "overdue", owner: "Client" },
      { title: "Confirm business-use vehicle percentage", due: "Tomorrow", state: "open", owner: "Client" },
    ],
    docs: [
      { id: "doc-w2", title: "W-2 · Jenna Ashford", tag: "Verified", note: "Linked to wages and withholding fields", audience: "client" },
      { id: "doc-payroll", title: "Q4 payroll reconciliation", tag: "Needs review", note: "Officer wages need a final reasonableness check", audience: "internal" },
      { id: "doc-insurance", title: "Officer insurance statement", tag: "Missing", note: "Client has not uploaded yet", audience: "client" },
    ],
  },
  returnWorkspaces: {
    "return-ramos-2025": {
      links: ["Return overview", "1099-R review", "Withholding warning", "Retirement questionnaire"],
      messages: [
        {
          audience: "Client-visible",
          owner: "CPA",
          body: "We have your retirement form and are completing an internal withholding check. No action is needed from you.",
          nextAction: "CPA confirms Box 4 mapping",
        },
        {
          audience: "Internal note",
          owner: "Reviewer",
          body: "The scan crowds Boxes 4 and 14. Confirm federal withholding against the source before sign-off.",
          nextAction: "CPA reviews source evidence",
        },
      ],
      requests: [
        { title: "Confirm 1099-R federal withholding", due: "Today", state: "open", owner: "CPA" },
        { title: "Review retirement distribution code", due: "Today", state: "open", owner: "Reviewer" },
      ],
      docs: [
        { id: "doc-ramos-1099r", title: "1099-R · Fidelity", tag: "Needs review", note: "Box 4 mapping needs human confirmation", audience: "internal" },
        { id: "doc-ramos-ssa", title: "SSA-1099 · Ramos Family", tag: "Verified", note: "Benefits and withholding are source-linked", audience: "client" },
        { id: "doc-ramos-prior", title: "2024 return package", tag: "Verified", note: "Used only for comparison and anomaly review", audience: "client" },
      ],
    },
    "return-parker-2025": {
      links: ["Return overview", "Reviewer notes", "K-1 package", "Partner basis schedules"],
      messages: [
        {
          audience: "Client-visible",
          owner: "CPA",
          body: "Your information is complete and the return is in final internal review. We will contact you when signatures are ready.",
          nextAction: "Reviewer completes sign-off",
        },
        {
          audience: "Internal note",
          owner: "Reviewer",
          body: "Package is internally consistent. Complete the foreign-transaction disclosure check before release.",
          nextAction: "Reviewer closes final warning",
        },
      ],
      requests: [
        { title: "Complete reviewer sign-off", due: "Tomorrow", state: "open", owner: "Reviewer" },
      ],
      docs: [
        { id: "doc-parker-k1", title: "Draft partner K-1 package", tag: "Verified", note: "Allocation totals reconcile to the partnership return", audience: "client" },
        { id: "doc-parker-basis", title: "Partner basis schedules", tag: "Verified", note: "Beginning and ending basis roll forward correctly", audience: "client" },
        { id: "doc-parker-foreign", title: "Foreign transaction statement", tag: "Needs review", note: "Disclosure classification awaits reviewer confirmation", audience: "internal" },
      ],
    },
  },
  returnTimelines: {
    "return-ramos-2025": [
      { label: "Documents received", state: "ready", note: "1099-R, SSA-1099, and prior-year package uploaded" },
      { label: "Document fields captured", state: "ready", note: "19 fields captured; one source ambiguity identified" },
      { label: "Withholding review", state: "blocked", note: "CPA must confirm the Box 4 mapping" },
      { label: "Reviewer handoff", state: "ready", note: "Available after the warning is resolved" },
    ],
    "return-parker-2025": [
      { label: "Documents received", state: "ready", note: "Partnership package is complete" },
      { label: "Preparation completed", state: "ready", note: "Allocations and basis schedules reconcile" },
      { label: "Reviewer handoff", state: "ready", note: "File is already assigned to the reviewer" },
      { label: "Final disclosure check", state: "blocked", note: "One foreign-transaction classification remains" },
    ],
  },
  collaborationThreads: [
    {
      id: "thread-insurance",
      title: "Officer insurance statement request",
      context: "Ashford Design LLC · Source document request",
      visibility: "client",
      linkedTo: ["Request", "Missing document", "Officer insurance deduction field"],
      owner: "Client",
      status: "Waiting on client",
      lastUpdate: "July 17, 2026",
      messages: [
        { author: "CPA", audience: "Client-visible", body: "Please upload the officer health insurance statement for 2025 so we can finalize the deduction." },
        { author: "Client", audience: "Client-visible", body: "Understood. I can upload this afternoon." },
      ],
    },
    {
      id: "thread-withholding",
      title: "1099-R withholding mismatch review",
      context: "Ramos Family · Source review issue",
      visibility: "internal",
      linkedTo: ["Review flag", "1099-R document", "Federal withholding field"],
      owner: "CPA",
      status: "Needs internal review",
      lastUpdate: "July 17, 2026",
      messages: [
        { author: "Automated source check", audience: "Internal note", body: "Source-match confidence dropped to 64% because the line labels overlap near Boxes 4 and 14." },
        { author: "Reviewer", audience: "Internal note", body: "Confirm Box 4 before this reaches final review." },
      ],
    },
    {
      id: "thread-vehicle",
      title: "Vehicle-use clarification",
      context: "Ashford Design LLC · Questionnaire follow-up",
      visibility: "client",
      linkedTo: ["Questionnaire", "Vehicle expenses", "Business-use percentage"],
      owner: "Client",
      status: "Ready for response",
      lastUpdate: "July 16, 2026",
      messages: [
        { author: "CPA", audience: "Client-visible", body: "Can you confirm whether 82% reflects business miles only or total annual usage?" },
      ],
    },
  ],
  statusStages: [
    {
      key: "gathering",
      label: "Waiting on documents",
      sharedMeaning: "We cannot finish the return until missing documents arrive.",
      clientView: "You still have documents to upload.",
      staffView: "Outstanding requests are blocking preparation.",
      owner: "Client",
      blocking: true,
    },
    {
      key: "prep",
      label: "In preparation",
      sharedMeaning: "The return is being assembled and checked.",
      clientView: "Your documents are in review.",
      staffView: "Preparation is active and no client action is currently required.",
      owner: "CPA",
      blocking: false,
    },
    {
      key: "review",
      label: "Ready for reviewer",
      sharedMeaning: "Preparation is complete and an internal reviewer can finish the return.",
      clientView: "Your return is in final internal review.",
      staffView: "The file is ready for reviewer sign-off.",
      owner: "Reviewer",
      blocking: false,
    },
    {
      key: "signoff",
      label: "Ready for signature",
      sharedMeaning: "Internal work is complete and the client needs to sign.",
      clientView: "You need to review and sign your return.",
      staffView: "Awaiting client signature package completion.",
      owner: "Client",
      blocking: true,
    },
  ],
  complexityItems: Array.from({ length: 180 }, (_, idx) => {
    const kinds = ["Document", "Question", "Task", "Warning", "Message", "Calculation"];
    const statuses = ["Needs attention", "Verified", "Open", "Blocked", "In review"];
    const kind = kinds[idx % kinds.length];
    const status = statuses[idx % statuses.length];
    return {
      id: `item-${idx + 1}`,
      title:
        kind === "Document"
          ? `Document ${idx + 1} · Source packet`
          : kind === "Question"
            ? `Question ${idx + 1} · Clarify input`
            : kind === "Task"
              ? `Task ${idx + 1} · Follow-up action`
              : kind === "Warning"
                ? `Warning ${idx + 1} · Source confidence`
                : kind === "Message"
                  ? `Message ${idx + 1} · Thread context`
                  : `Calculation ${idx + 1} · Derived value`,
      kind,
      status,
      summary:
        kind === "Warning"
          ? "Requires judgment before the return can move forward."
          : kind === "Document"
            ? "Linked to one or more return fields and review steps."
            : "Part of the connected workflow for this return.",
      returnId: ["return-ashford-2025", "return-ramos-2025", "return-parker-2025"][idx % 3],
      priority: idx % 5 === 0 ? "High" : idx % 3 === 0 ? "Medium" : "Normal",
    };
  }),
  reviewFields: [
    {
      id: "federal-wages",
      returnId: "return-ashford-2025",
      label: "Wages, salaries, tips",
      value: "$184,500",
      source: "W-2 · Box 1",
      document: "W-2 · Jenna Ashford",
      page: "Page 1",
      evidence: "Box 1 shows 184,500.00. No transformation applied.",
      confidence: 98,
      state: "verified",
      reviewNote: "The value was read directly from W-2 Box 1 and matched a single wage field.",
      history: "Imported → matched to federal wages → CPA verified",
      canEdit: "Locked after verification",
    },
    {
      id: "federal-withholding",
      returnId: "return-ramos-2025",
      label: "Federal income tax withheld",
      value: "$21,460",
      source: "1099-R · Box 4",
      document: "1099-R · Fidelity",
      page: "Page 1",
      evidence:
        "The system found 21,460.00 next to Box 4, but nearby labels are visually crowded.",
      confidence: 64,
      state: "suggested",
      reviewNote:
        "The amount likely maps to federal withholding, but confidence is lower because the scanned PDF has overlapping annotations near Boxes 4 and 14.",
      history: "Imported → automated source match flagged → awaiting CPA review",
      canEdit: "Editable with reason",
    },
    {
      id: "health-insurance",
      returnId: "return-ashford-2025",
      label: "Officer health insurance deduction",
      value: "Pending source",
      source: "Missing document",
      document: "Officer insurance statement",
      page: "—",
      evidence: "No source uploaded yet. This field is intentionally unresolved.",
      confidence: 0,
      state: "locked",
      reviewNote: "No value is available because the source package is incomplete.",
      history: "Open request sent to client",
      canEdit: "Locked until source arrives",
    },
    {
      id: "vehicle-use",
      returnId: "return-ashford-2025",
      label: "Business-use vehicle percentage",
      value: "82%",
      source: "Client questionnaire · Vehicle section",
      document: "Annual questionnaire",
      page: "Vehicle expenses",
      evidence: "Client answered 82% on the questionnaire. CPA can override after review.",
      confidence: 89,
      state: "editable",
      reviewNote: "Client-provided answer compared with prior-year usage and mileage totals.",
      history: "Client answered → automated consistency check passed → preparer review pending",
      canEdit: "Editable",
    },
    {
      id: "retirement-distribution",
      returnId: "return-ramos-2025",
      label: "Taxable retirement distribution",
      value: "$86,200",
      source: "1099-R · Box 2a",
      document: "1099-R · Fidelity",
      page: "Page 1",
      evidence: "Box 2a shows 86,200.00 and matches the taxable amount imported into the return.",
      confidence: 97,
      state: "verified",
      reviewNote: "The value was read directly from Box 2a with a matching distribution code and no competing amount nearby.",
      history: "Imported → mapped to taxable pension income → CPA verified",
      canEdit: "Locked after verification",
    },
    {
      id: "state-withholding",
      returnId: "return-ramos-2025",
      label: "State income tax withheld",
      value: "$4,115",
      source: "1099-R · Box 14",
      document: "1099-R · Fidelity",
      page: "Page 1",
      evidence: "Box 14 shows 4,115.00. The value is legible but remains editable until state allocation is confirmed.",
      confidence: 91,
      state: "editable",
      reviewNote: "The amount and California payer context are consistent; preparer judgment is still required for allocation.",
      history: "Imported → state matched → preparer review pending",
      canEdit: "Editable",
    },
    {
      id: "partner-income",
      returnId: "return-parker-2025",
      label: "Ordinary business income",
      value: "$312,840",
      source: "Form 1065 · Page 1, Line 22",
      document: "Draft Form 1065",
      page: "Page 1",
      evidence: "Line 22 reconciles to the partner allocation schedule and the draft K-1 package.",
      confidence: 99,
      state: "verified",
      reviewNote: "The return total and all partner allocations reconcile without a variance.",
      history: "Calculated → reconciled to K-1 allocation schedule → reviewer verified",
      canEdit: "Locked after verification",
    },
    {
      id: "guaranteed-payments",
      returnId: "return-parker-2025",
      label: "Guaranteed payments to partners",
      value: "$96,000",
      source: "Partner compensation schedule",
      document: "Partner compensation schedule",
      page: "Page 2",
      evidence: "Four quarterly payments of 24,000 reconcile to the general ledger and allocation schedule.",
      confidence: 96,
      state: "verified",
      reviewNote: "The schedule, ledger postings, and return line agree exactly.",
      history: "Ledger grouped → schedule matched → preparer and reviewer verified",
      canEdit: "Locked after verification",
    },
    {
      id: "foreign-disclosure",
      returnId: "return-parker-2025",
      label: "Foreign transaction disclosure",
      value: "Review classification",
      source: "Foreign transaction statement",
      document: "Foreign transaction statement",
      page: "Page 1",
      evidence: "A cross-border software payment is documented, but the disclosure category requires reviewer judgment.",
      confidence: 72,
      state: "suggested",
      reviewNote: "The payment pattern suggests a reportable category, but contract language is not conclusive enough to automate.",
      history: "Statement imported → automated check flagged potential disclosure → awaiting reviewer decision",
      canEdit: "Editable with reason",
    },
  ],
  client: {
    heroTitle: "You have one thing blocking your tax return.",
    heroBody:
      "Upload the officer health insurance statement. It should take under two minutes, and everything else is already in progress.",
    tasks: [
      { title: "Upload officer health insurance statement", urgency: "Do now", status: "Required" },
      { title: "Answer vehicle-use question", urgency: "After upload", status: "Ready" },
      { title: "Review completed items", urgency: "Later", status: "Hidden until relevant" },
    ],
    progress: [
      { label: "Documents uploaded", value: 7, total: 8 },
      { label: "Questions answered", value: 11, total: 12 },
      { label: "CPA review complete", value: 3, total: 4 },
    ],
  },
};

const portfolioReturns = [
  ...data.returns,
  ...Array.from({ length: 145 }, (_, index) => {
    const nextOwner = index % 17 === 0 ? "Client" : index % 7 === 0 ? "Reviewer" : "CPA";
    const urgency = index % 23 === 0 ? "High" : index % 19 === 0 ? "Today" : "Normal";
    const reviewFlags = index % 13 === 0 ? 1 : 0;
    const assignedTo = ["Aravind", "Maya Chen", "Jordan Lee", "Unassigned"][index % 4];
    return {
      id: `portfolio-return-${index + 1}`,
      client: `Portfolio Client ${String(index + 1).padStart(3, "0")}`,
      year: "2025",
      entity: ["1040", "S-Corp", "Partnership"][index % 3],
      stage: nextOwner === "Reviewer" ? "Ready for reviewer" : nextOwner === "Client" ? "Waiting on client" : "In preparation",
      nextOwner,
      urgency,
      completion: 38 + (index % 59),
      assignedTo,
      blocking:
        nextOwner === "Client"
          ? "Waiting for requested client information"
          : reviewFlags > 0
            ? "Resolve source review flag"
            : "No blocking issue",
      summary:
        nextOwner === "Reviewer"
          ? "Preparation is complete and the return is queued for reviewer action."
          : nextOwner === "Client"
            ? "The return is paused until the client completes an outstanding request."
            : reviewFlags > 0
              ? "Preparation is active and one source-level review flag needs attention."
              : "Preparation is moving forward with no current blocker.",
      counts: {
        openRequests: nextOwner === "Client" ? 1 : 0,
        reviewFlags,
        verifiedFields: 8 + (index % 21),
        totalFields: 30,
      },
    };
  }),
];

function getReturnPriorityScore(returnItem) {
  const urgencyWeight = { High: 22, Today: 16, Normal: 0 }[returnItem.urgency] || 0;
  const ownerWeight = returnItem.nextOwner === "CPA" ? 8 : returnItem.nextOwner === "Reviewer" ? 5 : 3;
  return urgencyWeight + ownerWeight + returnItem.counts.reviewFlags * 6 + returnItem.counts.openRequests * 5;
}

function getRankedPriorityCards() {
  return data.priorityCards
    .map((card) => {
      const returnItem = data.returns.find((item) => item.id === card.returnId);
      return { ...card, score: getReturnPriorityScore(returnItem) };
    })
    .filter((card) => {
      const returnItem = data.returns.find((item) => item.id === card.returnId);
      return state.dashboardScope === "firm" || returnItem.assignedTo === "Aravind";
    })
    .sort((left, right) => right.score - left.score);
}

function getDashboardReturns() {
  const query = state.dashboardQuery.trim().toLowerCase();
  return portfolioReturns
    .filter((item) => state.dashboardScope === "firm" || item.assignedTo === "Aravind")
    .filter((item) => {
      if (!query) return true;
      return [item.client, item.entity, item.stage, item.nextOwner, item.assignedTo]
        .some((value) => String(value).toLowerCase().includes(query));
    })
    .sort((left, right) => {
      const scoreDifference = getReturnPriorityScore(right) - getReturnPriorityScore(left);
      return scoreDifference || left.client.localeCompare(right.client);
    });
}

function getDashboardMetrics(returnItems) {
  return {
    owned: returnItems.length,
    actionToday: returnItems.filter((item) => item.urgency === "High" || item.urgency === "Today").length,
    clientBlockers: returnItems.filter(
      (item) => item.nextOwner === "Client" && item.counts.openRequests > 0
    ).length,
    reviewFlags: returnItems.reduce((total, item) => total + item.counts.reviewFlags, 0),
    reviewerReady: returnItems.filter((item) => item.nextOwner === "Reviewer").length,
  };
}

const pageTitles = {
  dashboard: "CPA Dashboard",
  collaboration: "Client & CPA Collaboration",
  status: "Return Status & Progress",
  workspace: "Connected Return Workspace",
  review: "Traceability Review",
  complexity: "Complexity Made Navigable",
  client: "Client First-Run Experience",
};

const fieldStateLabels = {
  suggested: "Suggested · Needs approval",
  verified: "Verified",
  editable: "Editable",
  locked: "Locked",
};

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

function isStaffRole() {
  return state.role !== "client";
}

function getActiveReturn() {
  return data.returns.find((item) => item.id === state.activeReturnId) || data.returns[0];
}

function getActiveReturnForId(returnId) {
  return data.returns.find((item) => item.id === returnId) || data.returns[0];
}

function getReviewFields() {
  return data.reviewFields.filter((field) => field.returnId === state.activeReturnId);
}

function getActiveField() {
  const returnFields = getReviewFields();
  return returnFields.find((field) => field.id === state.reviewFieldId) || returnFields[0];
}

function getActiveWorkspace() {
  return data.returnWorkspaces[state.activeReturnId] || data.workspace;
}

function getActiveTimeline() {
  return data.returnTimelines[state.activeReturnId] || data.timeline;
}

function getVisibleTimeline() {
  if (isStaffRole()) return getActiveTimeline();
  return [
    {
      label: "Documents received",
      state: "ready",
      note: "Your uploaded documents are available to your CPA.",
    },
    {
      label: "Preparation in progress",
      state: "ready",
      note: "Your CPA is organizing and reviewing your information.",
    },
    {
      label: state.clientVehicleConfirmed
        ? "Client checklist complete"
        : state.clientUploadComplete
          ? "One confirmation remaining"
          : "Client action needed",
      state: state.clientVehicleConfirmed ? "ready" : "blocked",
      note: state.clientVehicleConfirmed
        ? "Every requested client item is complete."
        : state.clientUploadComplete
          ? "Confirm what the vehicle-use percentage represents."
          : "Upload the requested officer insurance statement.",
    },
    {
      label: "Final internal review",
      state: state.clientVehicleConfirmed ? "ready" : "blocked",
      note: state.clientVehicleConfirmed
        ? "Your CPA owns the next step."
        : "This begins after your requested items are complete.",
    },
  ];
}

function getWorkspaceTarget(linkLabel) {
  if (/message|note/i.test(linkLabel)) return "messages";
  if (/document|package|schedule|K-1/i.test(linkLabel)) return "documents";
  if (/request|questionnaire|warning/i.test(linkLabel)) return "tasks";
  return "overview";
}

function announce(message) {
  const region = document.getElementById("route-announcer");
  region.textContent = "";
  window.setTimeout(() => {
    region.textContent = message;
  }, 30);
}

function focusPageTitle() {
  window.requestAnimationFrame(() => document.getElementById("page-title").focus());
}

function restoreFocus(selector, fallbackSelector = "#page-title") {
  window.requestAnimationFrame(() => {
    const target = document.querySelector(selector) || document.querySelector(fallbackSelector);
    target?.focus();
  });
}

function syncRouteToUrl(replace = false) {
  const nextHash = `#${state.route}`;
  if (window.location.hash === nextHash) return;
  window.history[replace ? "replaceState" : "pushState"](null, "", nextHash);
}

function setRole(role) {
  const previousRole = state.role;
  const previousRoute = state.route;
  state.role = role;
  if (role === "client") state.correctionFieldId = null;
  if (role === "client") state.activeReturnId = "return-ashford-2025";
  if (role !== "client" && previousRole === "client") {
    state.collaborationFilter = "all";
    state.statusLens = role === "reviewer" ? "staff" : "shared";
    if (state.route === "client") state.route = "dashboard";
  }
  normalizeState();
  render();
  if (previousRoute !== state.route) {
    syncRouteToUrl();
    focusPageTitle();
  } else {
    restoreFocus(`[data-role="${role}"]`);
  }
  announce(`${roles[state.role].label} view active. ${pageTitles[state.route]}.`);
}

function setRoute(route) {
  if (!pageTitles[route] || route === state.route) return;
  state.route = route;
  if (route !== "review") state.correctionFieldId = null;
  normalizeState();
  render();
  syncRouteToUrl();
  focusPageTitle();
  announce(`${pageTitles[state.route]} loaded.`);
}

function openReturn(returnId, route = "workspace", fieldId = null) {
  state.activeReturnId = returnId;
  state.dashboardSelectedReturnId = returnId;
  state.route = route;
  state.correctionFieldId = null;
  if (route === "review") {
    const requestedField = getReviewFields().find((field) => field.id === fieldId);
    const suggestion = getReviewFields().find((field) => field.state === "suggested");
    state.reviewFieldId = requestedField?.id || suggestion?.id || getReviewFields()[0]?.id;
  }
  normalizeState();
  render();
  syncRouteToUrl();
  focusPageTitle();
  announce(`${getActiveReturn().client} opened in ${pageTitles[state.route]}.`);
}

function pickField(fieldId) {
  const routeChanged = state.route !== "review";
  state.reviewFieldId = fieldId;
  state.correctionFieldId = null;
  state.route = "review";
  normalizeState();
  render();
  if (routeChanged) {
    syncRouteToUrl();
    focusPageTitle();
  } else {
    restoreFocus(`[data-field-id="${fieldId}"]`);
    announce(`${getActiveField().label} evidence loaded.`);
  }
}

function normalizeState() {
  const returnFields = getReviewFields();
  if (!returnFields.some((field) => field.id === state.reviewFieldId)) {
    state.reviewFieldId = returnFields.find((field) => field.state === "suggested")?.id || returnFields[0]?.id;
    state.correctionFieldId = null;
  }
  if (state.role === "client") {
    if (["dashboard", "review", "complexity"].includes(state.route)) {
      state.route = "client";
    }
    state.collaborationFilter = "client";
    state.statusLens = "client";
  }
}

function renderRoleSwitcher() {
  const container = document.getElementById("role-switcher");
  container.innerHTML = "";
  Object.entries(roles).forEach(([key, role]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = role.label;
    button.className = key === state.role ? "active" : "";
    button.dataset.role = key;
    button.setAttribute("aria-pressed", String(key === state.role));
    button.addEventListener("click", () => setRole(key));
    container.appendChild(button);
  });
  document.getElementById("role-copy").textContent = roles[state.role].copy;
}

function renderNav() {
  document.querySelectorAll(".nav-link").forEach((button) => {
    const isActive = button.dataset.route === state.route;
    const isStaffOnly = ["dashboard", "review", "complexity"].includes(button.dataset.route);
    button.classList.toggle("active", isActive);
    button.toggleAttribute("hidden", state.role === "client" && isStaffOnly);
    button.setAttribute("aria-current", isActive ? "page" : "false");
    button.onclick = () => setRoute(button.dataset.route);
  });
}

function renderTopbar() {
  const title = state.role === "reviewer" && state.route === "dashboard" ? "Reviewer Dashboard" : pageTitles[state.route];
  document.getElementById("page-title").textContent = title;
  document.title = `${title} · LedgerLift`;
  document.getElementById("global-status-pill").textContent =
    state.role === "client"
      ? "Client portal · Guided"
      : state.role === "reviewer"
        ? "Reviewer queue · Quality control"
        : "Return season · Active";
  const actions = document.querySelector(".topbar-actions");
  actions.classList.toggle("hidden", state.role === "client");
  actions.setAttribute("aria-hidden", String(state.role === "client"));
}

function renderBreadcrumbs() {
  const activeReturn = getActiveReturn();
  const crumbs = ["LedgerLift"];
  if (state.route === "dashboard") {
    crumbs.push("Dashboard");
  }
  if (state.route === "collaboration") {
    crumbs.push("Collaboration");
  }
  if (state.route === "status") {
    crumbs.push("Status");
  }
  if (state.route === "workspace" || state.route === "review") {
    crumbs.push("Returns", `${activeReturn.client} ${activeReturn.year}`);
  }
  if (state.route === "workspace") {
    crumbs.push(state.workspaceTab[0].toUpperCase() + state.workspaceTab.slice(1));
  }
  if (state.route === "review") {
    crumbs.push("Traceability", getActiveField().label);
  }
  if (state.route === "complexity") {
    crumbs.push("Complexity navigator");
  }
  if (state.route === "client") {
    crumbs.push("Client portal", "First visit");
  }
  document.getElementById("breadcrumbs").innerHTML = `
    <ol>
      ${crumbs
        .map(
          (crumb, index) =>
            `<li class="breadcrumb" ${index === crumbs.length - 1 ? 'aria-current="page"' : ""}>${crumb}</li>`
        )
        .join("")}
    </ol>`;
}

function renderDashboard() {
  const queueReturns = getDashboardReturns();
  const pageCount = Math.max(1, Math.ceil(queueReturns.length / state.dashboardPageSize));
  state.dashboardPage = Math.min(Math.max(1, state.dashboardPage), pageCount);
  const pageStart = (state.dashboardPage - 1) * state.dashboardPageSize;
  const visibleReturns = queueReturns.slice(pageStart, pageStart + state.dashboardPageSize);
  const focusedReturn =
    queueReturns.find((item) => item.id === state.dashboardSelectedReturnId) || queueReturns[0] || null;
  if (focusedReturn) {
    state.dashboardSelectedReturnId = focusedReturn.id;
    if (state.route === "dashboard" && isStaffRole() && data.returns.some((item) => item.id === focusedReturn.id)) {
      state.activeReturnId = focusedReturn.id;
    }
  }
  const metrics = getDashboardMetrics(queueReturns);
  const rankedPriorityCards = getRankedPriorityCards();
  const scopeLabel = state.dashboardScope === "firm" ? "Firm queue" : "My assignments";
  const canOpenFocusedReturn = focusedReturn && data.returns.some((item) => item.id === focusedReturn.id);
  const route = document.getElementById("route-dashboard");
  route.innerHTML = `
    <div class="dashboard-grid">
      <div class="stack">
        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Work queue</p>
              <h3 class="section-title">What should I work on right now?</h3>
              <p class="muted">Move between personal assignments and the firm-wide queue without losing prioritization context.</p>
            </div>
            <div class="row-inline" role="group" aria-label="Dashboard queue scope">
              <button type="button" class="filter-pill ${state.dashboardScope === "mine" ? "active" : ""}" data-dashboard-scope="mine" aria-pressed="${state.dashboardScope === "mine"}">My assignments</button>
              <button type="button" class="filter-pill ${state.dashboardScope === "firm" ? "active" : ""}" data-dashboard-scope="firm" aria-pressed="${state.dashboardScope === "firm"}">Firm queue</button>
            </div>
          </div>
          <div class="kpi-row">
            <div class="kpi">
              <p class="label">Returns in view</p>
              <div class="kpi-value">${metrics.owned}</div>
              <p class="muted tiny">${metrics.actionToday} need action today · ${scopeLabel}</p>
            </div>
            <div class="kpi">
              <p class="label">Client blockers</p>
              <div class="kpi-value">${metrics.clientBlockers}</div>
              <p class="muted tiny">Returns waiting on client action</p>
            </div>
            <div class="kpi">
              <p class="label">Review flags</p>
              <div class="kpi-value">${metrics.reviewFlags}</div>
              <p class="muted tiny">Across the current queue view</p>
            </div>
            <div class="kpi">
              <p class="label">Reviewer-ready</p>
              <div class="kpi-value">${metrics.reviewerReady}</div>
              <p class="muted tiny">Best queue for delegation</p>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Prioritized work</p>
              <h3 class="section-title">Top actions</h3>
            </div>
            <span class="badge warn">Urgency logic uses blocker + owner + confidence</span>
          </div>
          <div class="stack">
            ${rankedPriorityCards
              .map(
                (card) => `
                <article class="priority-card ${card.type}">
                  <div class="row-between">
                    <div>
                      <p class="label">${card.badge}</p>
                      <h4>${card.title}</h4>
                      <p class="muted">${card.reason}</p>
                      <p class="tiny note">Priority score ${card.score} · blocker, owner, urgency, and source-match risk.</p>
                    </div>
                    <button type="button" data-return-id="${card.returnId}" data-route="${card.route}" ${card.fieldId ? `data-field-id="${card.fieldId}"` : ""} class="open-return">
                      ${card.action}
                    </button>
                  </div>
                </article>`
              )
              .join("")}
          </div>
        </section>
      </div>

      <div class="stack">
        <section class="card">
          ${
            focusedReturn
              ? `<div class="section-header">
                  <div>
                    <p class="label">Focused return</p>
                    <h3 class="section-title">${escapeHtml(focusedReturn.client)}</h3>
                    <p class="muted">Assigned to ${escapeHtml(focusedReturn.assignedTo)}</p>
                  </div>
                  <span class="badge ${focusedReturn.urgency === "High" ? "danger" : focusedReturn.urgency === "Today" ? "warn" : "info"}">${escapeHtml(focusedReturn.stage)}</span>
                </div>
                <p class="muted">${escapeHtml(focusedReturn.summary)}</p>
                <div class="bar" role="progressbar" aria-label="Return completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${focusedReturn.completion}"><span style="width:${focusedReturn.completion}%"></span></div>
                <div class="mini-kpi-row" style="margin-top:14px;">
                  <div class="kpi">
                    <p class="label">Next owner</p>
                    <div class="kpi-value" style="font-size:24px;">${escapeHtml(focusedReturn.nextOwner)}</div>
                    <p class="muted tiny">Priority score ${getReturnPriorityScore(focusedReturn)}</p>
                  </div>
                  <div class="kpi">
                    <p class="label">Blocking issue</p>
                    <div class="kpi-value" style="font-size:18px;">${escapeHtml(focusedReturn.blocking)}</div>
                  </div>
                </div>
                ${
                  canOpenFocusedReturn
                    ? `<button type="button" class="primary-action" data-open-focused-return="${focusedReturn.id}">Open connected return</button>`
                    : '<p class="footer-note" style="margin-top:14px;">Generated queue record · select another return or continue filtering.</p>'
                }`
              : '<div class="empty-state"><strong>No matching returns.</strong><p class="muted">Try a broader search or switch queue scope.</p></div>'
          }
        </section>

        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Return queue</p>
              <h3 class="section-title">${scopeLabel}</h3>
              <p class="muted">Search the complete queue, then select a return without leaving the dashboard.</p>
            </div>
            <span class="badge info" aria-live="polite">${queueReturns.length} matching returns</span>
          </div>
          <label class="sr-only" for="dashboard-search">Search the return queue</label>
          <input class="search-input" id="dashboard-search" type="search" placeholder="Search client, entity, stage, owner..." autocomplete="off" />
          <div class="stack dashboard-queue" style="margin-top:12px;">
            ${visibleReturns
              .map(
                (item) => `
                <button type="button" class="summary-row queue-return ${item.id === focusedReturn?.id ? "active" : ""}" data-dashboard-return-id="${item.id}" aria-pressed="${item.id === focusedReturn?.id}">
                  <div class="row-between">
                    <div>
                      <h4 class="card-title">${escapeHtml(item.client)}</h4>
                      <p class="muted tiny">${escapeHtml(item.entity)} · ${item.year} · ${escapeHtml(item.assignedTo)}</p>
                    </div>
                    <span class="badge ${item.urgency === "High" ? "danger" : item.urgency === "Today" ? "warn" : "info"}">${escapeHtml(item.urgency)}</span>
                  </div>
                  <div class="row-inline" style="margin-top:10px;">
                    <span class="pill">Next owner: ${escapeHtml(item.nextOwner)}</span>
                    <span class="pill">Review flags: ${item.counts.reviewFlags}</span>
                    <span class="pill">Priority: ${getReturnPriorityScore(item)}</span>
                  </div>
                </button>`
              )
              .join("")}
            ${queueReturns.length === 0 ? '<div class="empty-state"><strong>No queue matches.</strong><p class="muted">Clear the search or switch between personal and firm scope.</p></div>' : ""}
          </div>
          <div class="queue-pagination" aria-label="Return queue pages">
            <button type="button" class="ghost-button" id="dashboard-previous-page" ${state.dashboardPage === 1 ? "disabled" : ""}>Previous</button>
            <span class="pill" aria-live="polite">Page ${state.dashboardPage} of ${pageCount}</span>
            <button type="button" class="ghost-button" id="dashboard-next-page" ${state.dashboardPage === pageCount ? "disabled" : ""}>Next</button>
          </div>
        </section>
      </div>
    </div>
  `;

  route.querySelectorAll(".open-return").forEach((button) => {
    button.addEventListener("click", () =>
      openReturn(button.dataset.returnId, button.dataset.route, button.dataset.fieldId || null)
    );
  });

  route.querySelectorAll("[data-dashboard-scope]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedScope = button.dataset.dashboardScope;
      state.dashboardScope = selectedScope;
      state.dashboardPage = 1;
      state.dashboardSelectedReturnId = getDashboardReturns()[0]?.id || "";
      renderDashboard();
      restoreFocus(`[data-dashboard-scope="${selectedScope}"]`);
      announce(`${selectedScope === "firm" ? "Firm queue" : "My assignments"} loaded.`);
    });
  });

  const dashboardSearch = route.querySelector("#dashboard-search");
  dashboardSearch.value = state.dashboardQuery;
  dashboardSearch.addEventListener("input", (event) => {
    state.dashboardQuery = event.target.value;
    state.dashboardPage = 1;
    state.dashboardSelectedReturnId = getDashboardReturns()[0]?.id || "";
    const cursorPosition = event.target.selectionStart;
    renderDashboard();
    window.requestAnimationFrame(() => {
      const nextInput = document.getElementById("dashboard-search");
      nextInput?.focus();
      nextInput?.setSelectionRange(cursorPosition, cursorPosition);
    });
  });

  route.querySelectorAll("[data-dashboard-return-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const returnId = button.dataset.dashboardReturnId;
      state.dashboardSelectedReturnId = returnId;
      if (data.returns.some((item) => item.id === returnId)) state.activeReturnId = returnId;
      renderDashboard();
      restoreFocus(`[data-dashboard-return-id="${returnId}"]`);
      const selectedReturn = portfolioReturns.find((item) => item.id === returnId);
      announce(`${selectedReturn.client} queue summary loaded.`);
    });
  });

  route.querySelector("[data-open-focused-return]")?.addEventListener("click", (event) => {
    openReturn(event.currentTarget.dataset.openFocusedReturn, "workspace");
  });

  route.querySelector("#dashboard-previous-page")?.addEventListener("click", () => {
    state.dashboardPage = Math.max(1, state.dashboardPage - 1);
    const firstReturnId = getDashboardReturns()[(state.dashboardPage - 1) * state.dashboardPageSize]?.id;
    if (firstReturnId) state.dashboardSelectedReturnId = firstReturnId;
    renderDashboard();
    restoreFocus(firstReturnId ? `[data-dashboard-return-id="${firstReturnId}"]` : "#dashboard-search");
    announce(`Return queue page ${state.dashboardPage} loaded.`);
  });

  route.querySelector("#dashboard-next-page")?.addEventListener("click", () => {
    state.dashboardPage = Math.min(pageCount, state.dashboardPage + 1);
    const firstReturnId = getDashboardReturns()[(state.dashboardPage - 1) * state.dashboardPageSize]?.id;
    if (firstReturnId) state.dashboardSelectedReturnId = firstReturnId;
    renderDashboard();
    restoreFocus(firstReturnId ? `[data-dashboard-return-id="${firstReturnId}"]` : "#dashboard-search");
    announce(`Return queue page ${state.dashboardPage} loaded.`);
  });
}

function renderCollaboration() {
  const route = document.getElementById("route-collaboration");
  const visibleThreads = data.collaborationThreads.filter((thread) => {
    if (state.role === "client") {
      return thread.visibility === "client";
    }
    if (state.collaborationFilter === "all") return true;
    return thread.visibility === state.collaborationFilter;
  });

  route.innerHTML = `
    <div class="workspace-grid">
      <div class="stack">
        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Return collaboration</p>
              <h3 class="section-title">Contextual communication, not a generic inbox</h3>
              <p class="muted">Threads are anchored to tax objects so requests, evidence, and ownership stay together.</p>
            </div>
            ${
              isStaffRole()
                ? `<div class="row-inline" role="group" aria-label="Filter collaboration threads">
                    <button type="button" class="filter-pill ${state.collaborationFilter === "all" ? "active" : ""}" data-collab-filter="all">All threads</button>
                    <button type="button" class="filter-pill ${state.collaborationFilter === "client" ? "active" : ""}" data-collab-filter="client">Client-visible</button>
                    <button type="button" class="filter-pill ${state.collaborationFilter === "internal" ? "active" : ""}" data-collab-filter="internal">Internal only</button>
                  </div>`
                : '<span class="badge success">Client-safe threads only</span>'
            }
          </div>
          <div class="stack">
            ${visibleThreads
              .map(
                (thread) => `
                <article class="summary-row">
                  <div class="row-between">
                    <div>
                      <p class="label">${thread.context}</p>
                      <h4 class="card-title">${thread.title}</h4>
                    </div>
                    <span class="badge ${thread.owner === "Client" ? "warn" : "info"}">${thread.status}</span>
                  </div>
                  <div class="row-inline" style="margin:10px 0 12px;">
                    <span class="pill">Next owner: ${thread.owner}</span>
                    <span class="pill">${thread.visibility === "client" ? "Client-visible" : "Internal only"}</span>
                    <span class="pill">Updated ${thread.lastUpdate}</span>
                  </div>
                  <div class="object-map">
                    ${thread.linkedTo.map((item) => `<span class="object-chip">${item}</span>`).join("")}
                  </div>
                  <div class="stack" style="margin-top:12px;">
                    ${thread.messages
                      .filter((message) => isStaffRole() || message.audience === "Client-visible")
                      .map(
                        (message) => `
                        <article class="message">
                          <div class="row-between">
                            <strong>${message.author}</strong>
                            <span class="pill">${message.audience}</span>
                          </div>
                          <p style="margin-top:8px;">${message.body}</p>
                        </article>`
                      )
                      .join("")}
                  </div>
                </article>`
              )
              .join("")}
          </div>
        </section>
      </div>

      <div class="stack">
        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Outstanding requests</p>
              <h3 class="section-title">Ownership stays explicit</h3>
            </div>
          </div>
          <div class="stack">
            ${data.workspace.requests
              .map(
                (request) => `
                <article class="request-row">
                  <div class="row-between">
                    <div>
                      <h4>${request.title}</h4>
                      <p class="muted tiny">Owner: ${request.owner}</p>
                    </div>
                    <span class="badge ${request.state === "overdue" ? "danger" : request.state === "complete" ? "success" : "info"}">${request.state === "overdue" ? "Overdue" : request.state === "complete" ? "Complete" : "Open"}</span>
                  </div>
                  <p class="muted tiny" style="margin-top:8px;">Due: ${request.due}</p>
                </article>`
              )
              .join("")}
          </div>
        </section>

      </div>
    </div>
  `;

  route.querySelectorAll("[data-collab-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.collabFilter;
      state.collaborationFilter = selectedFilter;
      render();
      restoreFocus(`[data-collab-filter="${selectedFilter}"]`);
    });
  });
}

function renderStatus() {
  const route = document.getElementById("route-status");
  const activeReturn = getActiveReturn();
  const activeTimeline = getVisibleTimeline();
  const completedMilestones = activeTimeline
    .filter((item) => item.state === "ready")
    .map((item) => item.label);
  const happenedSummary = completedMilestones.length
    ? `${completedMilestones.slice(0, 2).join(" and ")} ${completedMilestones.length === 1 ? "is" : "are"} complete.`
    : "No workflow milestones are complete yet.";
  const nextOwnerLabel =
    state.role === "client" && activeReturn.nextOwner === "CPA"
      ? "Your CPA"
      : state.role === "client" && activeReturn.nextOwner === "Client"
        ? "You"
        : `The ${activeReturn.nextOwner.toLowerCase()}`;
  const nextActionSummary = ["None", "No client blockers"].includes(activeReturn.blocking)
    ? `${nextOwnerLabel} can continue; there is no current blocking issue.`
    : `${nextOwnerLabel} ${nextOwnerLabel === "You" ? "own" : "owns"} the next step: ${activeReturn.blocking}.`;

  route.innerHTML = `
    <div class="stack">
      <div class="stack">
        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Return workflow</p>
              <h3 class="section-title">Statuses everyone interprets the same way</h3>
              <p class="muted">Each status has one shared meaning, plus role-specific wording that keeps the mental model aligned.</p>
            </div>
            ${
              isStaffRole()
                ? `<div class="row-inline" role="group" aria-label="Switch status language">
                    <button type="button" class="filter-pill ${state.statusLens === "shared" ? "active" : ""}" data-status-lens="shared">Shared meaning</button>
                    <button type="button" class="filter-pill ${state.statusLens === "client" ? "active" : ""}" data-status-lens="client">Client wording</button>
                    <button type="button" class="filter-pill ${state.statusLens === "staff" ? "active" : ""}" data-status-lens="staff">Staff wording</button>
                  </div>`
                : '<span class="badge success">Plain-language client view</span>'
            }
          </div>
          <div class="timeline">
            ${data.statusStages
              .map(
                (stage) => `
                <article class="timeline-row">
                  <div class="row-between">
                    <strong>${stage.label}</strong>
                    <span class="badge ${stage.blocking ? "warn" : "info"}">Next owner: ${stage.owner}</span>
                  </div>
                  <p class="muted tiny" style="margin-top:8px;">${
                    state.statusLens === "shared"
                      ? stage.sharedMeaning
                      : state.statusLens === "client"
                        ? stage.clientView
                        : stage.staffView
                  }</p>
                </article>`
              )
              .join("")}
          </div>
        </section>

        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Focused return</p>
              <h3 class="section-title">${activeReturn.client}</h3>
            </div>
            <span class="badge ${activeReturn.nextOwner === "Client" ? "warn" : "info"}">${activeReturn.stage}</span>
          </div>
          <div class="mini-kpi-row">
            <div class="kpi">
              <p class="label">What happened</p>
              <p class="muted">${happenedSummary}</p>
            </div>
            <div class="kpi">
              <p class="label">What is next</p>
              <p class="muted">${nextActionSummary}</p>
            </div>
          </div>
        </section>
      </div>

    </div>
  `;

  route.querySelectorAll("[data-status-lens]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedLens = button.dataset.statusLens;
      state.statusLens = selectedLens;
      render();
      restoreFocus(`[data-status-lens="${selectedLens}"]`);
    });
  });
}

function renderWorkspace() {
  const activeReturn = getActiveReturn();
  const workspace = getActiveWorkspace();
  const timeline = getVisibleTimeline();
  const route = document.getElementById("route-workspace");
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "documents", label: "Documents" },
    { key: "messages", label: "Messages" },
    { key: "tasks", label: "Requests & tasks" },
  ];

  const contentByTab = {
    overview: `
      <div class="stack">
        <article class="summary-row">
          <div class="row-between">
            <div>
              <p class="label">Return status</p>
              <h3 class="section-title">${activeReturn.stage}</h3>
            </div>
            <span class="badge ${activeReturn.nextOwner === "Client" ? "warn" : "info"}">Next action owner: ${activeReturn.nextOwner}</span>
          </div>
          <p class="muted">${activeReturn.summary}</p>
          <div class="object-map">
            ${workspace.links
              .map(
                (link) =>
                  `<button type="button" class="object-node" data-workspace-tab="${getWorkspaceTarget(link)}">${escapeHtml(link)} <span aria-hidden="true">→</span></button>`
              )
              .join("")}
          </div>
        </article>
        <article class="summary-row">
          <p class="label">What happens next</p>
          <p class="muted">${
            state.activeReturnId !== "return-ashford-2025"
              ? activeReturn.blocking === "None"
                ? `The ${activeReturn.nextOwner.toLowerCase()} can continue without a blocking issue.`
                : `The ${activeReturn.nextOwner.toLowerCase()} owns the next step: ${activeReturn.blocking}.`
              : state.clientVehicleConfirmed
                ? "All client inputs are complete. The CPA can finish source review and prepare the reviewer handoff."
                : state.clientUploadComplete
                  ? "The statement is received. One vehicle-use confirmation remains before CPA review continues."
                  : "Uploading the missing insurance statement clears the main blocker and unlocks the next confirmation."
          }</p>
        </article>
      </div>`,
    documents: `
      <div class="stack">
        ${workspace.docs
          .filter((doc) => isStaffRole() || doc.audience === "client")
          .map(
            (doc) => `
            <article class="doc-row">
              <div class="row-between">
                <div>
                  <h4>${doc.title}</h4>
                  <p class="muted">${doc.note}</p>
                </div>
                <span class="field-state ${
                  doc.tag === "Missing" ? "locked" : doc.tag === "Needs review" ? "suggested" : doc.tag === "Verified" ? "verified" : "editable"
                }">${doc.tag}</span>
              </div>
            </article>`
          )
          .join("")}
      </div>`,
    messages: `
      <div class="stack">
        ${workspace.messages
          .filter((item) => isStaffRole() || item.audience === "Client-visible")
          .map(
            (message) => `
            <article class="message">
              <div class="row-between">
                <div>
                  <p class="label">${message.audience}</p>
                  <p>${message.body}</p>
                </div>
                <span class="pill">${message.owner}</span>
              </div>
              <p class="muted tiny" style="margin-top:10px;">Next action: ${message.nextAction}</p>
            </article>`
          )
          .join("")}
      </div>`,
    tasks: `
      <div class="stack">
        ${workspace.requests
          .map(
            (request) => `
            <article class="request-row">
              <div class="row-between">
                <div>
                  <h4>${request.title}</h4>
                  <p class="muted tiny">Owner: ${request.owner}</p>
                </div>
                <span class="request-state ${request.state === "overdue" ? "overdue" : request.state === "complete" ? "complete" : ""}">${
                  request.state === "overdue" ? "Overdue" : request.state === "complete" ? "Complete" : "Open"
                }</span>
              </div>
              <p class="muted tiny" style="margin-top:10px;">Due: ${request.due}</p>
            </article>`
          )
          .join("")}
      </div>`,
  };

  route.innerHTML = `
    <div class="workspace-grid">
      <section class="shell-frame">
        <div class="shell-top">
          <div>
            <p class="label">${state.role === "client" ? "Client workspace" : state.role === "reviewer" ? "Reviewer workspace" : "CPA workspace"}</p>
            <h3 class="card-title">${activeReturn.client} · ${activeReturn.year}</h3>
          </div>
          <div class="row-inline">
            <span class="badge info">${activeReturn.stage}</span>
            <span class="pill">Completion ${activeReturn.completion}%</span>
          </div>
        </div>
        <div class="shell-body">
          <nav class="context-nav" aria-label="Return sections">
            ${tabs
              .map(
                (tab) => `
                <button type="button" class="context-link ${state.workspaceTab === tab.key ? "active" : ""}" data-workspace-tab="${tab.key}">
                  ${tab.label}
                </button>`
              )
              .join("")}
          </nav>
          <div class="context-content">${contentByTab[state.workspaceTab]}</div>
        </div>
      </section>

      <div class="stack">
        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Return timeline</p>
              <h3 class="section-title">Connected activity</h3>
              <p class="muted">Documents, requests, and review milestones for this return.</p>
            </div>
          </div>
          <div class="timeline">
            ${timeline
              .map(
                (item) => `
                <article class="timeline-row">
                  <div class="row-between">
                    <strong>${item.label}</strong>
                    <span class="timeline-state ${item.state}">${item.state === "ready" ? "Clear" : "Blocked"}</span>
                  </div>
                  <p class="muted tiny" style="margin-top:8px;">${item.note}</p>
                </article>`
              )
              .join("")}
          </div>
        </section>

        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Access and permissions</p>
              <h3 class="section-title">${state.role === "client" ? "Client view" : state.role === "reviewer" ? "Reviewer view" : "Preparer view"}</h3>
            </div>
          </div>
          <ul class="compact-list">
            ${
              state.role === "cpa"
                ? `
                <li>Sees internal notes, review flags, ownership, and blockers.</li>
                <li>Can move from request → document → field review without leaving the shell.</li>
                <li>Can access documents, messages, requests, and field review from one return.</li>`
                : state.role === "reviewer"
                  ? `
                <li>Sees evidence, internal notes, unresolved approvals, and reviewer-ready work.</li>
                <li>Can confirm or correct generated suggestions while preserving the audit trail.</li>
                <li>Can review approvals and evidence without leaving the return.</li>`
                  : `
                <li>Sees only client-safe requests and progress.</li>
                <li>Starts with task urgency, not internal workflow labels.</li>
                <li>Can complete requests without seeing staff-only information.</li>`
            }
          </ul>
        </section>
      </div>
    </div>
  `;

  route.querySelectorAll("[data-workspace-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedTab = button.dataset.workspaceTab;
      state.workspaceTab = selectedTab;
      render();
      restoreFocus(`[data-workspace-tab="${selectedTab}"]`);
    });
  });
}

function renderReview() {
  const route = document.getElementById("route-review");
  const activeField = getActiveField();
  const reviewFields = getReviewFields();
  const reviewNoteLabel = {
    suggested: "Why this was suggested",
    verified: "Verification note",
    editable: "Validation note",
    locked: "Why this is unavailable",
  }[activeField.state];
  const activeFieldStateLabel =
    activeField.state === "suggested"
      ? "Suggested · Needs approval"
      : fieldStateLabels[activeField.state];

  route.innerHTML = `
    <div class="review-grid">
      <section class="card">
        <div class="section-header">
          <div>
            <p class="label">Field permissions</p>
            <h3 class="section-title">Review field states</h3>
          </div>
          <div class="row-inline">
            <span class="field-state suggested">Suggested · Needs approval</span>
            <span class="field-state verified">Verified</span>
            <span class="field-state editable">Editable</span>
            <span class="field-state locked">Locked</span>
          </div>
        </div>
        <div class="field-list" aria-label="Return fields">
          ${reviewFields
            .map(
              (field) => `
              <button type="button" class="field-row ${field.id === activeField.id ? "active" : ""}" data-field-id="${field.id}" aria-pressed="${field.id === activeField.id}">
                <div class="row-between">
                  <div>
                    <h4>${escapeHtml(field.label)}</h4>
                    <p class="muted">${escapeHtml(field.value)}</p>
                  </div>
                  <span class="field-state ${field.state}">${fieldStateLabels[field.state]}</span>
                </div>
                <div class="row-inline" style="margin-top:10px;">
                  <span class="pill">${escapeHtml(field.source)}</span>
                  <span class="pill">${escapeHtml(field.canEdit)}</span>
                </div>
              </button>`
            )
            .join("")}
        </div>
      </section>

      <div class="stack">
        <section class="card source-evidence">
          <div class="section-header">
            <div>
              <p class="label">Selected field traceability</p>
              <h3 class="section-title">${escapeHtml(activeField.label)}</h3>
            </div>
            <span class="field-state ${activeField.state}">${activeFieldStateLabel}</span>
          </div>
          <div class="summary-list">
            <article class="summary-row">
              <div class="row-between">
                <div>
                  <p class="label">Source</p>
                  <h4 class="card-title">${escapeHtml(activeField.document)}</h4>
                </div>
                <span class="pill">${escapeHtml(activeField.page)}</span>
              </div>
              <p class="muted">${escapeHtml(activeField.evidence)}</p>
            </article>

            <article class="summary-row">
              <p class="label">${reviewNoteLabel}</p>
              <p>${escapeHtml(activeField.reviewNote)}</p>
              ${
                activeField.state === "suggested"
                  ? `<div class="confidence-meter" style="margin-top:12px;" role="progressbar" aria-label="Source-match confidence" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${activeField.confidence}">
                      <strong>${activeField.confidence}%</strong>
                      <div class="confidence-track"><span style="width:${activeField.confidence}%"></span></div>
                    </div>`
                  : ""
              }
            </article>

            <article class="summary-row">
              <p class="label">Review history</p>
              <p>${escapeHtml(activeField.history)}</p>
            </article>
            <article class="summary-row">
              <p class="label">Reviewer action</p>
              <p>${
                activeField.state === "suggested"
                  ? "Confirm the mapping or override it with a reason."
                  : activeField.state === "verified"
                    ? "No action needed unless an upstream source changes."
                    : activeField.state === "locked"
                      ? "Wait for the missing source document before editing."
                      : "Review and adjust if the questionnaire answer conflicts with source support."
              }</p>
              ${
                activeField.state === "suggested"
                  ? `<div class="review-actions">
                      <button type="button" class="primary-action" id="confirm-suggested-field">Confirm mapping</button>
                      <button type="button" class="ghost-button" id="correct-review-field">Correct value</button>
                    </div>`
                  : activeField.state === "editable"
                    ? `<div class="review-actions"><button type="button" class="ghost-button" id="correct-review-field">Edit with source note</button></div>`
                    : ""
              }
              ${
                state.correctionFieldId === activeField.id
                  ? `<form class="correction-form" id="correction-form">
                      <label for="corrected-value"><span class="label">Corrected value</span></label>
                      <input class="search-input" id="corrected-value" name="correctedValue" value="${escapeHtml(activeField.value)}" required />
                      <label for="correction-reason"><span class="label">Reason for correction</span></label>
                      <textarea id="correction-reason" name="correctionReason" rows="3" required placeholder="Explain what the source supports"></textarea>
                      <div class="review-actions">
                        <button type="button" class="ghost-button" id="cancel-correction">Cancel</button>
                        <button type="submit" class="primary-action">Save correction</button>
                      </div>
                    </form>`
                  : ""
              }
            </article>
          </div>
        </section>

        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Document page preview</p>
              <h3 class="section-title">${escapeHtml(activeField.document)}</h3>
            </div>
          </div>
          <div class="doc-preview">
            <article class="document-sheet" aria-label="Source page for ${escapeHtml(activeField.label)}">
              <header class="document-header">
                <div>
                  <p class="document-kicker">Source record · Tax year 2025</p>
                  <h4>${escapeHtml(activeField.document)}</h4>
                </div>
                <div class="document-page-number">
                  <span>Reference</span>
                  <strong>${escapeHtml(activeField.page)}</strong>
                </div>
              </header>

              <div class="document-identity-grid" aria-label="Document identity">
                <div><span>Taxpayer</span><strong>${escapeHtml(getActiveReturn().client)}</strong></div>
                <div><span>Return type</span><strong>${escapeHtml(getActiveReturn().entity)}</strong></div>
                <div><span>Document status</span><strong>${fieldStateLabels[activeField.state]}</strong></div>
              </div>

              <div class="document-section-title">Reported information</div>
              <div class="document-field-grid" aria-hidden="true">
                <div><span>Account reference</span><strong>•••• 4821</strong></div>
                <div><span>Reporting period</span><strong>01/01/25–12/31/25</strong></div>
                <div><span>Document control</span><strong>LL-${activeField.id.slice(0, 3).toUpperCase()}-25</strong></div>
              </div>

              <div class="source-highlight" aria-label="Highlighted source evidence">
                <div class="source-highlight-marker" aria-hidden="true">Selected evidence</div>
                <div>
                  <span>${escapeHtml(activeField.source)}</span>
                  <strong>${escapeHtml(activeField.value)}</strong>
                  <p>${escapeHtml(activeField.evidence)}</p>
                </div>
              </div>

              <div class="document-lines" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </div>
              <footer class="document-footer">
                <span>LedgerLift source index</span>
                <span>${escapeHtml(activeField.page)} · Evidence anchored</span>
              </footer>
            </article>
          </div>
          <p class="footer-note" style="margin-top:12px;">
            Select another field to keep the return context fixed while the source page and highlighted evidence update.
          </p>
        </section>
      </div>
    </div>
  `;

  route.querySelectorAll("[data-field-id]").forEach((button) => {
    button.addEventListener("click", () => pickField(button.dataset.fieldId));
  });

  route.querySelector("#confirm-suggested-field")?.addEventListener("click", () => {
    const actionOwner = state.role === "reviewer" ? "Reviewer" : "CPA";
    activeField.state = "verified";
    activeField.confidence = 100;
    activeField.history = `${activeField.history} → ${actionOwner} confirmed mapping`;
    activeField.canEdit = "Locked after verification";
    activeField.reviewNote = `${activeField.reviewNote} Human review confirmed the recommendation.`;
    const activeReturn = getActiveReturn();
    activeReturn.counts.reviewFlags = Math.max(0, activeReturn.counts.reviewFlags - 1);
    render();
    window.requestAnimationFrame(() =>
      document.querySelector(`[data-field-id="${activeField.id}"]`)?.focus()
    );
    announce(`${activeField.label} verified by the ${actionOwner}.`);
  });

  route.querySelector("#correct-review-field")?.addEventListener("click", () => {
    state.correctionFieldId = activeField.id;
    renderReview();
    window.requestAnimationFrame(() => document.getElementById("corrected-value")?.focus());
  });

  route.querySelector("#cancel-correction")?.addEventListener("click", () => {
    state.correctionFieldId = null;
    renderReview();
    window.requestAnimationFrame(() => document.getElementById("correct-review-field")?.focus());
  });

  route.querySelector("#correction-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const correctedValue = String(formData.get("correctedValue") || "").trim();
    const correctionReason = String(formData.get("correctionReason") || "").trim();
    if (!correctedValue || !correctionReason) return;
    const actionOwner = state.role === "reviewer" ? "Reviewer" : "CPA";
    const wasSuggested = activeField.state === "suggested";
    activeField.value = correctedValue;
    activeField.evidence = `${actionOwner} correction saved. Reason: ${correctionReason}`;
    activeField.history = `${activeField.history} → ${actionOwner} corrected value with source note`;
    activeField.state = "verified";
    activeField.confidence = 100;
    activeField.canEdit = "Locked after verification";
    activeField.reviewNote = "The original automated suggestion was replaced by a human-reviewed correction. The reason remains in the audit trail.";
    state.correctionFieldId = null;
    const activeReturn = getActiveReturn();
    if (wasSuggested) {
      activeReturn.counts.reviewFlags = Math.max(0, activeReturn.counts.reviewFlags - 1);
    }
    render();
    window.requestAnimationFrame(() =>
      document.querySelector(`[data-field-id="${activeField.id}"]`)?.focus()
    );
    announce(`${activeField.label} corrected and verified.`);
  });
}

function renderComplexity() {
  const route = document.getElementById("route-complexity");
  const filteredItems = data.complexityItems.filter((item) => {
    const kindMatch = state.complexityFilter === "all" || item.kind.toLowerCase() === state.complexityFilter;
    const query = state.complexityQuery.trim().toLowerCase();
    const queryMatch =
      query.length === 0 ||
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query);
    return kindMatch && queryMatch;
  });
  const visibleItems = filteredItems.slice(0, state.complexityLimit);
  const remainingItems = Math.max(0, filteredItems.length - visibleItems.length);
  const selectedItem =
    filteredItems.find((item) => item.id === state.complexityItemId) || filteredItems[0] || null;
  if (selectedItem) state.complexityItemId = selectedItem.id;

  route.innerHTML = `
    <div class="workspace-grid">
      <div class="stack">
        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">All return activity</p>
              <h3 class="section-title">Deep professional work that stays navigable</h3>
              <p class="muted">Use filters and search to narrow documents, questions, tasks, and warnings.</p>
            </div>
            <span class="badge info" aria-live="polite">${filteredItems.length} matching items</span>
          </div>
          <div class="search-row">
            <div class="filter-row" role="group" aria-label="Filter complexity items">
              <button type="button" class="filter-pill ${state.complexityFilter === "all" ? "active" : ""}" data-complexity-filter="all" aria-pressed="${state.complexityFilter === "all"}">All</button>
              <button type="button" class="filter-pill ${state.complexityFilter === "document" ? "active" : ""}" data-complexity-filter="document" aria-pressed="${state.complexityFilter === "document"}">Documents</button>
              <button type="button" class="filter-pill ${state.complexityFilter === "question" ? "active" : ""}" data-complexity-filter="question" aria-pressed="${state.complexityFilter === "question"}">Questions</button>
              <button type="button" class="filter-pill ${state.complexityFilter === "task" ? "active" : ""}" data-complexity-filter="task" aria-pressed="${state.complexityFilter === "task"}">Tasks</button>
              <button type="button" class="filter-pill ${state.complexityFilter === "warning" ? "active" : ""}" data-complexity-filter="warning" aria-pressed="${state.complexityFilter === "warning"}">Warnings</button>
            </div>
            <label class="sr-only" for="complexity-search">Search workspace items</label>
            <input class="search-input" id="complexity-search" type="search" placeholder="Search documents, warnings, questions..." autocomplete="off" />
          </div>
          <div class="stack" id="complexity-results" aria-label="Workspace search results">
            ${visibleItems
              .map(
                (item) => `
                <button type="button" class="summary-row complexity-item ${item.id === selectedItem?.id ? "active" : ""}" data-complexity-item="${item.id}" aria-pressed="${item.id === selectedItem?.id}">
                  <div class="row-between">
                    <div>
                      <p class="label">${item.kind}</p>
                      <h4 class="card-title">${item.title}</h4>
                    </div>
                    <div class="row-inline">
                      <span class="badge ${item.priority === "High" ? "danger" : item.priority === "Medium" ? "warn" : "info"}">${item.priority}</span>
                      <span class="pill">${item.status}</span>
                    </div>
                  </div>
                  <p class="muted">${item.summary}</p>
                </button>`
              )
              .join("")}
            ${filteredItems.length === 0 ? '<div class="empty-state"><strong>No matching work found.</strong><p class="muted">Try a broader search or choose a different item type.</p></div>' : ""}
          </div>
          ${remainingItems > 0 ? `<button type="button" class="load-more-button" id="complexity-load-more">Show ${Math.min(18, remainingItems)} more <span class="muted">(${remainingItems} remaining)</span></button>` : ""}
        </section>
      </div>

      <div class="stack">
        ${
          selectedItem
            ? `<section class="card complexity-detail" id="complexity-detail" aria-live="polite">
                <div class="section-header">
                  <div>
                    <p class="label">Selected ${selectedItem.kind}</p>
                    <h3 class="section-title">${selectedItem.title}</h3>
                  </div>
                  <span class="badge ${selectedItem.priority === "High" ? "danger" : selectedItem.priority === "Medium" ? "warn" : "info"}">${selectedItem.priority} priority</span>
                </div>
                <p class="muted">${selectedItem.summary}</p>
                <dl class="detail-grid">
                  <div><dt>Status</dt><dd>${selectedItem.status}</dd></div>
                  <div><dt>Connected return</dt><dd>${getActiveReturnForId(selectedItem.returnId).client}</dd></div>
                  <div><dt>Navigation state</dt><dd>Search, filters, and list position are retained.</dd></div>
                </dl>
                <div class="review-actions">
                  <button type="button" class="primary-action" data-open-complexity-return="${selectedItem.returnId}">Open connected return</button>
                  <button type="button" class="ghost-button" data-open-complexity-review="${selectedItem.returnId}">Open source-level review</button>
                </div>
              </section>`
            : ""
        }
      </div>
    </div>
  `;

  route.querySelectorAll("[data-complexity-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.complexityFilter;
      state.complexityFilter = selectedFilter;
      state.complexityLimit = 18;
      renderComplexity();
      restoreFocus(`[data-complexity-filter="${selectedFilter}"]`);
      const resultCount = route.querySelector(".section-header > .badge")?.textContent || "Workspace filter updated";
      announce(resultCount);
    });
  });

  route.querySelectorAll("[data-complexity-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedItemId = button.dataset.complexityItem;
      state.complexityItemId = selectedItemId;
      renderComplexity();
      restoreFocus(`[data-complexity-item="${selectedItemId}"]`);
      announce(`${data.complexityItems.find((item) => item.id === state.complexityItemId).title} detail loaded.`);
    });
  });

  route.querySelector("[data-open-complexity-return]")?.addEventListener("click", (event) => {
    openReturn(event.currentTarget.dataset.openComplexityReturn, "workspace");
  });

  route.querySelector("[data-open-complexity-review]")?.addEventListener("click", (event) => {
    openReturn(event.currentTarget.dataset.openComplexityReview, "review");
  });

  const searchInput = route.querySelector("#complexity-search");
  if (searchInput) {
    searchInput.value = state.complexityQuery;
    searchInput.addEventListener("input", (event) => {
      state.complexityQuery = event.target.value;
      state.complexityLimit = 18;
      const cursorPosition = event.target.selectionStart;
      renderComplexity();
      window.requestAnimationFrame(() => {
        const nextInput = document.getElementById("complexity-search");
        nextInput.focus();
        nextInput.setSelectionRange(cursorPosition, cursorPosition);
      });
    });
  }

  route.querySelector("#complexity-load-more")?.addEventListener("click", () => {
    const firstNewItemId = filteredItems[visibleItems.length]?.id;
    state.complexityLimit += 18;
    renderComplexity();
    if (firstNewItemId) restoreFocus(`[data-complexity-item="${firstNewItemId}"]`);
    announce(`${Math.min(state.complexityLimit, filteredItems.length)} of ${filteredItems.length} items shown.`);
  });
}

function getUploadFileError(file) {
  if (!file) return "";
  if (file.size > MAX_UPLOAD_SIZE_BYTES) return "Choose a file that is 20 MB or smaller.";
  const normalizedName = file.name.toLowerCase();
  const hasAllowedType = ALLOWED_UPLOAD_TYPES.has(file.type);
  const hasAllowedExtension = ALLOWED_UPLOAD_EXTENSIONS.some((extension) => normalizedName.endsWith(extension));
  if (!hasAllowedType && !hasAllowedExtension) return "Choose a PDF, JPG, or PNG file.";
  return "";
}

function setUploadValidation(errorMessage = "") {
  const input = document.getElementById("upload-file");
  const picker = document.querySelector('label[for="upload-file"]');
  document.getElementById("upload-file-error").textContent = errorMessage;
  input.setAttribute("aria-invalid", String(Boolean(errorMessage)));
  picker.classList.toggle("has-error", Boolean(errorMessage));
}

function openUploadDialog() {
  const dialog = document.getElementById("upload-dialog");
  const input = document.getElementById("upload-file");
  const fileName = document.getElementById("upload-file-name");
  const completeButton = document.getElementById("complete-upload");
  input.value = "";
  fileName.textContent = "No file selected";
  completeButton.disabled = true;
  setUploadValidation();
  dialog.showModal();
}

function completeClientUpload() {
  state.clientUploadComplete = true;
  const insuranceDoc = data.workspace.docs.find((doc) => doc.id === "doc-insurance");
  insuranceDoc.tag = "Received";
  insuranceDoc.note = "Uploaded by the client and queued for CPA review";
  const insuranceField = data.reviewFields.find((field) => field.id === "health-insurance");
  insuranceField.value = "$14,880";
  insuranceField.source = "Officer insurance statement · Total paid";
  insuranceField.page = "Page 1";
  insuranceField.evidence = "The uploaded statement shows 14,880.00 in eligible officer health insurance premiums.";
  insuranceField.confidence = 93;
  insuranceField.state = "suggested";
  insuranceField.reviewNote = "The statement total is clear and matches twelve monthly premium entries; CPA classification review remains required.";
  insuranceField.history = "Client uploaded → statement total captured → awaiting CPA classification review";
  insuranceField.canEdit = "Editable with reason";
  const insuranceRequest = data.workspace.requests.find((request) => request.title.startsWith("Officer health"));
  insuranceRequest.state = "complete";
  insuranceRequest.due = "Received just now";
  insuranceRequest.owner = "CPA";
  const ashfordReturn = data.returns.find((item) => item.id === "return-ashford-2025");
  ashfordReturn.stage = "Client follow-up";
  ashfordReturn.nextOwner = "Client";
  ashfordReturn.blocking = "Confirm business-use vehicle percentage";
  ashfordReturn.completion = 82;
  ashfordReturn.summary = "The missing statement is in. One client confirmation remains before CPA review can continue.";
  ashfordReturn.counts.openRequests = 1;
  const ashfordPriority = data.priorityCards.find((card) => card.returnId === "return-ashford-2025");
  ashfordPriority.title = "Prompt Ashford Design for one final confirmation";
  ashfordPriority.reason = "The statement is in. Confirming that 82% means business miles will complete the client package.";
  ashfordPriority.action = "Open client task";
  ashfordPriority.route = "client";
  ashfordPriority.badge = "Next client action · 30 sec";
  data.timeline[2] = {
    label: "Client follow-up needed",
    state: "blocked",
    note: "Document received; one vehicle-use confirmation remains",
  };
  const insuranceThread = data.collaborationThreads.find((thread) => thread.id === "thread-insurance");
  insuranceThread.owner = "CPA";
  insuranceThread.status = "Document received";
  document.getElementById("upload-dialog").close();
  render();
  focusPageTitle();
  announce("Officer insurance statement uploaded. One vehicle-use confirmation remains.");
}

function completeVehicleConfirmation(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const selectedVehicleUse = String(formData.get("vehicle-use") || "");
  if (!["business-miles", "total-usage"].includes(selectedVehicleUse)) return;
  const isBusinessMiles = selectedVehicleUse === "business-miles";
  state.clientVehicleConfirmed = true;
  const vehicleField = data.reviewFields.find((field) => field.id === "vehicle-use");
  const addsReviewFlag = !isBusinessMiles;
  vehicleField.value = isBusinessMiles ? "82%" : "Needs preparer correction";
  vehicleField.evidence = isBusinessMiles
    ? "Client confirmed that 82% represents business miles only. The preparer can override after source review."
    : "Client clarified that 82% represents total vehicle usage, not business miles. The preparer must correct the business-use percentage.";
  vehicleField.confidence = isBusinessMiles ? 94 : 38;
  vehicleField.state = "editable";
  vehicleField.history = isBusinessMiles
    ? "Client answered → client confirmed business-mile meaning → automated consistency check passed → preparer review pending"
    : "Client answered → client clarified total-usage meaning → preparer correction required";
  vehicleField.reviewNote = isBusinessMiles
    ? "The client confirmed that 82% refers to business miles, and the answer remains editable until preparer review."
    : "The client clarified that 82% is total vehicle usage, so the preparer must enter the supported business-use percentage.";
  vehicleField.canEdit = isBusinessMiles ? "Editable" : "Editable with reason";
  const vehicleRequest = data.workspace.requests.find((request) => request.title.startsWith("Confirm business-use"));
  vehicleRequest.state = "complete";
  vehicleRequest.due = "Confirmed just now";
  vehicleRequest.owner = "CPA";
  const ashfordReturn = data.returns.find((item) => item.id === "return-ashford-2025");
  ashfordReturn.stage = isBusinessMiles ? "CPA verification needed" : "CPA correction needed";
  ashfordReturn.nextOwner = "CPA";
  ashfordReturn.blocking = isBusinessMiles ? "No client blockers" : "Correct vehicle-use percentage";
  ashfordReturn.completion = isBusinessMiles ? 88 : 86;
  ashfordReturn.summary = isBusinessMiles
    ? "The client package is complete. The CPA can now finish source review and prepare the reviewer handoff."
    : "The client package is complete, and the vehicle answer is clear. The CPA must correct the business-use percentage before review.";
  ashfordReturn.counts.openRequests = 0;
  if (addsReviewFlag) ashfordReturn.counts.reviewFlags += 1;
  const ashfordPriority = data.priorityCards.find((card) => card.returnId === "return-ashford-2025");
  ashfordPriority.title = isBusinessMiles
    ? "Review the completed Ashford client package"
    : "Correct Ashford’s vehicle-use percentage";
  ashfordPriority.reason = isBusinessMiles
    ? "All client inputs are in. Source review can continue without another follow-up cycle."
    : "The client clarified that 82% is total vehicle usage, so the business-use percentage needs a preparer correction.";
  ashfordPriority.action = isBusinessMiles ? "Open return workspace" : "Open vehicle field review";
  ashfordPriority.route = isBusinessMiles ? "workspace" : "review";
  ashfordPriority.badge = isBusinessMiles ? "Ready for CPA · Client complete" : "Correction required · Client clarified";
  if (isBusinessMiles) delete ashfordPriority.fieldId;
  else ashfordPriority.fieldId = "vehicle-use";
  data.timeline[2] = {
    label: "Client follow-up complete",
    state: "ready",
    note: isBusinessMiles
      ? "All requested client documents and confirmations are in"
      : "Client inputs are complete; the vehicle percentage needs a preparer correction",
  };
  const vehicleThread = data.collaborationThreads.find((thread) => thread.id === "thread-vehicle");
  vehicleThread.owner = "CPA";
  vehicleThread.status = isBusinessMiles ? "Client confirmed" : "Client clarified · Correction needed";
  vehicleThread.messages.push({
    author: "Client",
    audience: "Client-visible",
    body: isBusinessMiles
      ? "Confirmed: 82% represents business miles only."
      : "Clarified: 82% represents total vehicle usage, not business miles.",
  });
  document.getElementById("vehicle-dialog").close();
  render();
  focusPageTitle();
  announce(
    isBusinessMiles
      ? "Vehicle-use answer confirmed. All client tasks are complete and the CPA owns the next step."
      : "Vehicle-use answer clarified. All client tasks are complete and the CPA must correct the percentage."
  );
}

function renderClient() {
  const route = document.getElementById("route-client");
  const uploadComplete = state.clientUploadComplete;
  const vehicleConfirmed = state.clientVehicleConfirmed;
  const heroTitle = vehicleConfirmed
    ? "You’re all set. Your CPA owns the next step."
    : uploadComplete
      ? "Document received. One quick confirmation remains."
      : data.client.heroTitle;
  const heroBody = vehicleConfirmed
    ? "Every requested item is complete. We’ll notify you when your return is ready for review and signature."
    : uploadComplete
      ? "Confirm that 82% means business miles only. It should take less than 30 seconds."
      : data.client.heroBody;
  const tasks = vehicleConfirmed
    ? [
        { title: "Officer health insurance statement", urgency: "Uploaded", status: "Complete" },
        { title: "Confirm vehicle-use percentage", urgency: "Confirmed", status: "Complete" },
        { title: "Wait for CPA review", urgency: "We’ll notify you", status: "In progress" },
      ]
    : uploadComplete
    ? [
        { title: "Officer health insurance statement", urgency: "Uploaded just now", status: "Complete" },
        { title: "Confirm vehicle-use percentage", urgency: "Your next action", status: "Required" },
        { title: "Review completed items", urgency: "Later", status: "Hidden until relevant" },
      ]
    : data.client.tasks;
  const progress = data.client.progress.map((item, index) =>
    (index === 0 && uploadComplete) || (index === 1 && vehicleConfirmed) ? { ...item, value: item.total } : item
  );
  const heroButtonId = vehicleConfirmed ? "" : uploadComplete ? "open-vehicle" : "open-upload";
  const heroButtonLabel = vehicleConfirmed
    ? "✓ All client tasks complete"
    : uploadComplete
      ? "Confirm 82% vehicle use"
      : "Upload document now";
  route.innerHTML = `
    <div class="client-grid">
      <div class="stack">
        <section class="onboarding-hero">
          <p class="label" style="color:#d3ecff;">Your return checklist</p>
          <h3 class="section-title" style="color:white;">${heroTitle}</h3>
          <p>${heroBody}</p>
          <div class="row-inline" style="margin-top:16px;">
            <button type="button" class="primary-button" ${heroButtonId ? `id="${heroButtonId}"` : ""} ${vehicleConfirmed ? "disabled" : ""}>${heroButtonLabel}</button>
            <span class="pill" style="background:rgba(255,255,255,0.16); color:white;">${vehicleConfirmed ? "No action needed" : uploadComplete ? "Estimated time: 30 sec" : "Estimated time: 2 min"}</span>
          </div>
        </section>

        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Immediate next steps</p>
              <h3 class="section-title">Your tasks</h3>
              <p class="muted">Complete the required items below in order.</p>
            </div>
          </div>
          <div class="stack">
            ${tasks
              .map(
                (task, index) => `
                <div class="checklist-item">
                  <div>
                    <strong>${index + 1}. ${task.title}</strong>
                    <p class="muted tiny">${task.urgency}</p>
                  </div>
                  <span class="badge ${task.status === "Required" ? "danger" : task.status === "Complete" ? "success" : "info"}">${task.status}</span>
                </div>`
              )
              .join("")}
          </div>
        </section>
      </div>

      <div class="stack">
        <section class="card">
          <div class="section-header">
            <div>
              <p class="label">Return progress</p>
              <h3 class="section-title">Simple, shared status</h3>
            </div>
          </div>
          ${progress
            .map(
              (item) => `
              <article class="summary-row">
                <div class="row-between">
                  <strong>${item.label}</strong>
                  <span class="pill">${item.value}/${item.total}</span>
                </div>
                <div class="bar" role="progressbar" aria-label="${item.label}" aria-valuemin="0" aria-valuemax="${item.total}" aria-valuenow="${item.value}"><span style="width:${(item.value / item.total) * 100}%"></span></div>
              </article>`
            )
            .join("")}
        </section>

      </div>
    </div>
  `;

  route.querySelector("#open-upload")?.addEventListener("click", openUploadDialog);
  route.querySelector("#open-vehicle")?.addEventListener("click", () =>
    document.getElementById("vehicle-dialog").showModal()
  );
}

function renderRoutes() {
  if (isStaffRole()) {
    renderDashboard();
    renderReview();
    renderComplexity();
  } else {
    ["dashboard", "review", "complexity"].forEach((routeName) => {
      document.getElementById(`route-${routeName}`).innerHTML = "";
    });
  }
  renderCollaboration();
  renderStatus();
  renderWorkspace();
  renderClient();
  document.querySelectorAll(".route").forEach((section) => {
    const isActive = section.id === `route-${state.route}`;
    section.classList.toggle("active", isActive);
    section.hidden = !isActive;
    section.setAttribute("aria-hidden", String(!isActive));
    if (isActive) {
      section.setAttribute("role", "region");
      section.setAttribute("aria-labelledby", "page-title");
    } else {
      section.removeAttribute("role");
      section.removeAttribute("aria-labelledby");
    }
  });
}

function applyAccessibilityAttributes() {
  document.querySelectorAll("button:not([type])").forEach((button) => {
    button.type = "button";
  });
  document.querySelectorAll(".filter-pill").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("active")));
  });
  document.querySelectorAll(".context-link").forEach((button) => {
    button.setAttribute("aria-current", button.classList.contains("active") ? "page" : "false");
  });
}

function render() {
  normalizeState();
  renderRoleSwitcher();
  renderNav();
  renderTopbar();
  renderBreadcrumbs();
  renderRoutes();
  applyAccessibilityAttributes();
}

document.getElementById("focus-traceability").addEventListener("click", () => {
  state.reviewFieldId = "federal-withholding";
  state.activeReturnId = "return-ramos-2025";
  state.route = "review";
  normalizeState();
  render();
  syncRouteToUrl();
  focusPageTitle();
  announce("Highest-risk review opened for Ramos Family.");
});

document.getElementById("upload-file").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const errorMessage = getUploadFileError(file);
  document.getElementById("upload-file-name").textContent = file ? file.name : "No file selected";
  document.getElementById("complete-upload").disabled = !file || Boolean(errorMessage);
  setUploadValidation(errorMessage);
});

document.getElementById("use-sample-upload").addEventListener("click", () => {
  document.getElementById("upload-file-name").textContent = "officer-insurance-statement-2025.pdf · sample";
  document.getElementById("complete-upload").disabled = false;
  setUploadValidation();
  announce("Sample officer insurance statement selected.");
});

document.getElementById("complete-upload").addEventListener("click", completeClientUpload);
document.getElementById("vehicle-form").addEventListener("submit", completeVehicleConfirmation);
document.getElementById("cancel-vehicle").addEventListener("click", () =>
  document.getElementById("vehicle-dialog").close()
);

window.addEventListener("popstate", () => {
  const routeFromHash = window.location.hash.slice(1);
  if (!pageTitles[routeFromHash]) return;
  state.route = routeFromHash;
  normalizeState();
  render();
  syncRouteToUrl(true);
  focusPageTitle();
  announce(`${pageTitles[state.route]} loaded.`);
});

const initialRoute = window.location.hash.slice(1);
if (pageTitles[initialRoute]) state.route = initialRoute;
normalizeState();
render();
syncRouteToUrl(true);
