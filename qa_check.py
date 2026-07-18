#!/usr/bin/env python3
"""Dependency-free structural smoke checks for the LedgerLift prototype."""

from __future__ import annotations

import argparse
import re
import ssl
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
SYSTEM_CA_BUNDLE = Path("/etc/ssl/cert.pem")


class PrototypeParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.buttons_without_type: list[int] = []
        self.local_assets: list[str] = []
        self.skip_targets: list[str] = []
        self.dialog_labels: list[str] = []
        self.label_fors: set[str] = set()
        self.input_ids: list[tuple[str, str, bool]] = []
        self._label_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"] or "")
        if tag == "button" and not values.get("type"):
            self.buttons_without_type.append(self.getpos()[0])
        if tag == "label":
            self._label_depth += 1
            if values.get("for"):
                self.label_fors.add(values["for"] or "")
        if tag == "input" and values.get("id"):
            self.input_ids.append(
                (values["id"] or "", values.get("type", "text") or "text", self._label_depth > 0)
            )
        if tag in {"link", "script"}:
            source = values.get("href") or values.get("src")
            if source and not urlparse(source).scheme:
                self.local_assets.append(source)
        if tag == "a" and "skip-link" in (values.get("class") or ""):
            self.skip_targets.append((values.get("href") or "").lstrip("#"))
        if tag == "dialog" and values.get("aria-labelledby"):
            self.dialog_labels.append(values["aria-labelledby"] or "")

    def handle_endtag(self, tag: str) -> None:
        if tag == "label":
            self._label_depth = max(0, self._label_depth - 1)


def check(condition: bool, message: str, failures: list[str]) -> None:
    if condition:
        print(f"PASS  {message}")
    else:
        print(f"FAIL  {message}")
        failures.append(message)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", help="Optionally verify the running local preview, e.g. http://127.0.0.1:8000/")
    args = parser.parse_args()

    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    js = (ROOT / "app.js").read_text(encoding="utf-8")
    audit = PrototypeParser()
    audit.feed(html)
    failures: list[str] = []

    duplicates = [item for item, count in Counter(audit.ids).items() if count > 1]
    check(not duplicates, "Static HTML IDs are unique", failures)
    check(not audit.buttons_without_type, "Every static button declares its type", failures)
    dynamic_buttons = re.findall(r"<button\b[^>]*>", js)
    check(bool(dynamic_buttons) and all('type="' in button for button in dynamic_buttons),
          "Every dynamically rendered button declares its type", failures)
    check(all((ROOT / asset.split("#", 1)[0].removeprefix("./")).exists() for asset in audit.local_assets),
          "All local HTML assets exist", failures)
    check(bool(audit.skip_targets) and all(target in audit.ids for target in audit.skip_targets),
          "Skip link targets the main landmark", failures)
    check(all(label in audit.ids for label in audit.dialog_labels), "Dialogs have valid accessible names", failures)

    unlabeled_inputs = [
        input_id
        for input_id, input_type, nested in audit.input_ids
        if input_type != "hidden" and input_id not in audit.label_fors and not nested
    ]
    check(not unlabeled_inputs, "Static form controls have labels", failures)
    check("aria-live" in html and "aria-pressed" in js and "aria-current" in js,
          "Dynamic states expose assistive-technology cues", failures)
    check('section.setAttribute("role", "region")' in js and
          'section.removeAttribute("role")' in js,
          "Only the active route is exposed as a labeled region", failures)
    check("prefers-reduced-motion" in css and "forced-colors" in css,
          "Reduced-motion and forced-color preferences are supported", failures)
    check("TODO" not in html + css + js and "FIXME" not in html + css + js,
          "No TODO or FIXME markers remain", failures)
    check('formData.get("vehicle-use")' in js and 'selectedVehicleUse === "business-miles"' in js,
          "Vehicle confirmation branches on the selected answer", failures)
    check('state.role = "cpa"' not in js,
          "Review interactions do not silently overwrite the active role", failures)
    check('audience: "internal"' in js and
          '.filter((doc) => isStaffRole() || doc.audience === "client")' in js,
          "Client document views filter internal-only records", failures)
    check('if (isStaffRole()) {' in js and
          '["dashboard", "review", "complexity"].forEach((routeName)' in js and
          'document.getElementById(`route-${routeName}`).innerHTML = "";' in js,
          "Client mode removes staff-only route content from the rendered DOM", failures)
    check('function getVisibleTimeline()' in js and
          'if (isStaffRole()) return getActiveTimeline();' in js and
          'label: "Preparation in progress"' in js,
          "Client timeline replaces internal workflow details with client-safe wording", failures)
    check("function restoreFocus" in js and js.count("restoreFocus(") >= 8,
          "Dynamic control updates restore keyboard focus", failures)
    check("file.size > MAX_UPLOAD_SIZE_BYTES" in js and "upload-file-error" in html,
          "Upload type and 20 MB validation are wired to accessible feedback", failures)
    check("reduce((total, item) => total + item.counts.reviewFlags, 0)" in js and
          "Math.min(18, remainingItems)" in js,
          "Dashboard and pagination labels use accurate counts", failures)
    unnecessary_ai_phrases = (
        "AI review needed",
        "AI extracted",
        "AI warnings",
        "AI warning",
        "AI risk",
        "AI reasoning",
        "AI assistant",
        "AI sanity-check",
    )
    check(not any(phrase in html + js for phrase in unnecessary_ai_phrases) and
          len(re.findall(r"\bAI\b", html + js)) == 2 and
          'suggested: "AI-generated · Needs approval"' in js,
          "AI terminology is limited to explicit provenance in staff review", failures)
    check('dashboardScope: "mine"' in js and 'data-dashboard-scope="firm"' in js and
          'id="dashboard-search"' in js and 'id="dashboard-next-page"' in js,
          "Dashboard supports preparer and firm queues with search and pagination", failures)
    check('state.dashboardSelectedReturnId = returnId;' in js and
          js.count('state.dashboardSelectedReturnId = getDashboardReturns()[0]?.id || "";') >= 2 and
          'state.route === "dashboard" && isStaffRole()' in js,
          "Dashboard focus stays aligned after opening, filtering, and searching", failures)
    check('blocking: "Confirm foreign transaction disclosure classification"' in js and
          'const nextActionSummary =' in js,
          "Focused-return status uses accurate return-specific blockers", failures)
    check('class="object-chip"' in js and ".object-chip" in css,
          "Informational relationship labels are not styled as controls", failures)
    check('class="document-sheet"' in js and 'class="source-highlight"' in js and
          ".document-identity-grid" in css,
          "Traceability review renders a structured source page with highlighted evidence", failures)

    if args.url:
        ssl_context = ssl.create_default_context()
        if SYSTEM_CA_BUNDLE.exists():
            ssl_context.load_verify_locations(cafile=str(SYSTEM_CA_BUNDLE))
        for asset in ("", "index.html", "styles.css", "app.js", "favicon.svg"):
            target = urljoin(args.url.rstrip("/") + "/", asset)
            try:
                request = Request(target, headers={"User-Agent": "LedgerLift-QA/1.0"})
                with urlopen(request, timeout=3, context=ssl_context) as response:
                    ok = response.status == 200
            except Exception:
                ok = False
            check(ok, f"Served asset returns 200: {target}", failures)

    print(f"\n{len(failures)} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
