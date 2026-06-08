import { academicFaculties } from "./academics-data.mjs";
import { admissionsSteps } from "./admissions-data.mjs";
import { commandCenterItems, universityNotices } from "./bulletin-data.mjs";
import { campusPlaces } from "./campus-data.mjs";
import { curriculumCourses } from "./curriculum-data.mjs";
import { institutionPages } from "./institution-data.mjs";
import { researchMapNodes } from "./research-map-data.mjs";

export const site = {
  name: "Pannonian University",
  shortName: "PU",
  domain: "pu.edu.rs",
  tagline: "A European university for resilient regions, intelligent systems, and civic leadership.",
  location: "Novi Sad, Serbia",
  address: "Bulevar Pannonica 12, 21000 Novi Sad, Serbia",
  emails: {
    general: "info@pu.edu.rs",
    admissions: "admissions@pu.edu.rs",
    registrar: "registrar@pu.edu.rs",
    research: "research@pu.edu.rs"
  },
  nav: [
    { label: "Academics", href: "/academics/" },
    { label: "Curriculum", href: "/curriculum/" },
    { label: "Admissions", href: "/admissions/" },
    { label: "Research", href: "/research/" },
    { label: "Campus", href: "/campus/" },
    { label: "Contact", href: "/contact/" }
  ],
  stats: [
    { value: "6", label: "faculties" },
    { value: "42", label: "degree pathways" },
    { value: "18:1", label: "student-faculty ratio" },
    { value: "31", label: "partner institutions" }
  ]
};

const economicsFaculty = academicFaculties.find((faculty) => faculty.id === "economics");

function html(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function imageStem(fileName) {
  return fileName.replace(/\.(jpg|jpeg|png)$/i, "");
}

function responsiveImage(fileName, {
  alt,
  className = "",
  width = 1672,
  height = 941,
  sizes = "(min-width: 980px) 50vw, 100vw",
  loading = "lazy",
  fetchpriority = "",
  widths = [640, 1120, width]
} = {}) {
  const stem = imageStem(fileName);
  const srcset = (format) => widths
    .map((item) => `/assets/img/${stem}-${item}.${format} ${item}w`)
    .join(", ");
  const classAttr = className ? ` class="${html(className)}"` : "";
  const loadingAttr = loading ? ` loading="${html(loading)}"` : "";
  const fetchPriorityAttr = fetchpriority ? ` fetchpriority="${html(fetchpriority)}"` : "";

  return `<picture${classAttr}>
          <source type="image/avif" srcset="${srcset("avif")}" sizes="${html(sizes)}">
          <source type="image/webp" srcset="${srcset("webp")}" sizes="${html(sizes)}">
          <img src="/assets/img/${html(fileName)}" width="${html(width)}" height="${html(height)}" alt="${html(alt)}"${loadingAttr}${fetchPriorityAttr} decoding="async">
        </picture>`;
}

function facultyHref(faculty) {
  return `/academics/${faculty.id}/`;
}

function courseHref(course) {
  return `/curriculum/${course.id}/`;
}

function noticeHref(notice) {
  return notice.href || `/notices/${notice.id}/`;
}

function stripTags(value) {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function renderCourseCards() {
  return curriculumCourses.map((course) => {
    const searchText = [
      course.code,
      course.title,
      course.summary,
      course.domainLabel,
      course.levelLabel,
      course.faculty,
      course.lab,
      course.researchTie,
      ...course.outcomes
    ].join(" ");

    return `
              <article class="course-card" data-course-card data-syllabus-card="${html(course.id)}" data-domain="${html(course.domain)}" data-level="${html(course.level)}" data-search="${html(searchText)}">
                <div class="course-meta"><span>${html(course.code)}</span><em>${html(course.levelLabel)}</em></div>
                <h2><a href="${html(courseHref(course))}">${html(course.title)}</a></h2>
                <p>${html(course.summary)}</p>
                <div class="course-footer">
                  <span>${html(course.domainLabel)}</span>
                  <div class="course-actions">
                    <a class="course-detail-link" href="${html(courseHref(course))}">View course</a>
                    <button class="syllabus-link" type="button" data-syllabus-open="${html(course.id)}" aria-haspopup="dialog" aria-controls="course-syllabus-drawer">
                      Explore Syllabus
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"></path></svg>
                    </button>
                  </div>
                </div>
              </article>`;
  }).join("");
}

function renderSyllabusDrawer() {
  return `
        <div class="syllabus-shell" data-syllabus-shell hidden>
          <div class="syllabus-scrim" data-syllabus-close aria-hidden="true"></div>
          <aside id="course-syllabus-drawer" class="syllabus-drawer" role="dialog" aria-modal="true" aria-labelledby="syllabus-drawer-title" tabindex="-1" data-syllabus-drawer>
            <div class="syllabus-toolbar">
              <div>
                <span id="syllabus-drawer-title">Course Detail Inspector</span>
                <small>Pannonian University module syllabus</small>
              </div>
              <button class="syllabus-close" type="button" data-syllabus-close aria-label="Close syllabus inspector">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>
              </button>
            </div>
            <div class="syllabus-scroll">
              ${curriculumCourses.map((course, index) => renderSyllabusPanel(course, index)).join("")}
            </div>
          </aside>
        </div>`;
}

function getCourseIntensity(course) {
  const intensity = {
    foundation: 42,
    "core-exploration": 66,
    "lab-crucible": 84,
    "partner-studio": 76
  };

  return intensity[course.level] || 58;
}

function getCoursePrerequisites(course) {
  if (course.level === "foundation") return ["No prior PU module required", "Regional reading pack"];
  if (course.level === "core-exploration") return ["PU-101 or equivalent", "Methods readiness"];
  if (course.level === "lab-crucible") return ["Foundation studio", "Safety or data protocol clearance"];
  return ["Faculty advisor approval", "Partner brief orientation"];
}

function renderSyllabusPanel(course, index) {
  const mailSubject = encodeURIComponent(`Syllabus enquiry: ${course.code} ${course.title}`);
  const previous = curriculumCourses[(index - 1 + curriculumCourses.length) % curriculumCourses.length];
  const next = curriculumCourses[(index + 1) % curriculumCourses.length];
  const intensity = getCourseIntensity(course);
  const prerequisites = getCoursePrerequisites(course);
  const syllabusText = encodeURIComponent([
    `${course.code} ${course.title}`,
    `Credits: ${course.credits}`,
    `Level: ${course.levelLabel}`,
    `Lab: ${course.lab}`,
    "",
    course.summary,
    "",
    "Research Connection:",
    course.researchTie,
    "",
    "Weekly Syllabus:",
    ...course.weeks.map(([title, detail], weekIndex) => `${weekIndex + 1}. ${title} - ${detail}`),
    "",
    `Assessment: ${course.assessment}`
  ].join("\n"));

  return `
              <article class="syllabus-panel" data-syllabus-panel="${html(course.id)}" hidden>
                <header class="syllabus-header">
                  <div class="syllabus-inspector-row">
                    <span class="syllabus-code">${html(course.code)}</span>
                    <span>Detail Inspector</span>
                  </div>
                  <p class="eyebrow">${html(course.domainLabel)}</p>
                  <h2 id="syllabus-title-${html(course.id)}">${html(course.title)}</h2>
                </header>

                <div class="syllabus-jumpbar" aria-label="Browse adjacent modules">
                  <button type="button" data-syllabus-jump="${html(previous.id)}">
                    <span>Previous</span>
                    <strong>${html(previous.code)}</strong>
                  </button>
                  <a href="data:text/plain;charset=utf-8,${syllabusText}" download="${html(course.code.toLowerCase())}-syllabus.txt">Download Syllabus</a>
                  <button type="button" data-syllabus-jump="${html(next.id)}">
                    <span>Next</span>
                    <strong>${html(next.code)}</strong>
                  </button>
                </div>

                <dl class="syllabus-facts">
                  <div>
                    <dt>Credits</dt>
                    <dd>${html(course.credits)}</dd>
                  </div>
                  <div>
                    <dt>Academic Level</dt>
                    <dd>${html(course.levelLabel)}</dd>
                  </div>
                  <div>
                    <dt>${html(course.performanceLabel)}</dt>
                    <dd>${html(course.performanceValue)}</dd>
                  </div>
                  <div>
                    <dt>Academic Lab Affiliate</dt>
                    <dd>${html(course.lab)}</dd>
                  </div>
                </dl>

                <section class="syllabus-block syllabus-readiness">
                  <div>
                    <h3>Studio Intensity</h3>
                    <strong>${intensity}/100</strong>
                    <i style="--level: ${intensity}%"></i>
                  </div>
                  <div>
                    <h3>Prerequisites</h3>
                    <p>${prerequisites.map((item) => `<span>${html(item)}</span>`).join("")}</p>
                  </div>
                </section>

                <section class="syllabus-block">
                  <h3>Research Connection</h3>
                  <p>${html(course.researchTie)}</p>
                </section>

                <section class="syllabus-block">
                  <h3>Learning Outcomes</h3>
                  <ul class="syllabus-outcomes">
                    ${course.outcomes.map((outcome) => `<li>${html(outcome)}</li>`).join("")}
                  </ul>
                </section>

                <section class="syllabus-block">
                  <h3>Chronological Syllabus (4-week intensive modules)</h3>
                  <ol class="syllabus-weeks">
                    ${course.weeks.map(([title, detail], index) => `
                    <li>
                      <span>${String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>${html(title)}</strong>
                        <p>${html(detail)}</p>
                      </div>
                    </li>`).join("")}
                  </ol>
                </section>

                <section class="syllabus-block syllabus-assessment">
                  <h3>Assessment Pattern</h3>
                  <p>${html(course.assessment)}</p>
                </section>

                <section class="syllabus-block syllabus-related">
                  <h3>Related PU Evidence</h3>
                  <div>
                    <a href="/research/">Research map</a>
                    <a href="/academics/">Faculty inspector</a>
                    <a href="mailto:${site.emails.research}?subject=${mailSubject}">Ask research office</a>
                  </div>
                </section>

                <div class="syllabus-actionbar">
                  <div>
                    <span>${html(course.term)} Register</span>
                    <p>${html(course.registerNote)}</p>
                  </div>
                  <a class="syllabus-enroll" href="mailto:${site.emails.registrar}?subject=${mailSubject}">Enroll in Module</a>
                </div>
              </article>`;
}

function renderAcademicExplorer() {
  const first = academicFaculties[0]?.id || "";

  return `
      <section class="section faculty-explorer-section" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Faculty inspector</p>
            <h2>Choose a faculty home, then inspect its studios, programs, and advising route.</h2>
          </div>
          <div class="faculty-explorer" data-faculty-explorer>
            <div class="faculty-rail" role="tablist" aria-label="Academic faculties">
              ${academicFaculties.map((faculty) => `
              <button class="faculty-tab${faculty.id === first ? " is-active" : ""}" type="button" role="tab" aria-selected="${faculty.id === first}" aria-controls="faculty-${html(faculty.id)}" data-faculty-trigger="${html(faculty.id)}" data-ripple>
                <span>${html(faculty.label)}</span>
                <strong>${html(faculty.name)}</strong>
                <small>${html(faculty.metric)}</small>
              </button>`).join("")}
            </div>
            <div class="faculty-detail-frame">
              ${academicFaculties.map((faculty) => `
              <article id="faculty-${html(faculty.id)}" class="faculty-detail${faculty.id === first ? " is-active" : ""}" role="tabpanel" data-faculty-panel="${html(faculty.id)}"${faculty.id === first ? "" : " hidden"}>
                <div class="faculty-detail-top">
                  <span>${html(faculty.label)}</span>
                  <strong>${html(faculty.metric)}</strong>
                </div>
                <h3>${html(faculty.name)}</h3>
                <p>${html(faculty.short)}</p>
                <div class="faculty-inspector-grid">
                  <div>
                    <span>Dean</span>
                    <strong>${html(faculty.dean)}</strong>
                    <p>${html(faculty.office)}</p>
                  </div>
                  <div>
                    <span>Featured Course</span>
                    <strong>${html(faculty.featuredCourse)}</strong>
                    <p>${html(faculty.studio)}</p>
                  </div>
                </div>
                <div class="faculty-tags" aria-label="${html(faculty.name)} programs">
                  ${faculty.programs.map((program) => `<span>${html(program)}</span>`).join("")}
                </div>
                <div class="faculty-lab-list">
                  ${faculty.labs.map((lab) => `<div><span>Lab</span><strong>${html(lab)}</strong></div>`).join("")}
                </div>
                <div class="faculty-detail-footer">
                  <p><span>Career Signals</span>${html(faculty.careers)}</p>
                  <div class="faculty-detail-actions">
                    <a href="${html(facultyHref(faculty))}">View faculty profile</a>
                    <a href="mailto:${html(faculty.email)}">Contact faculty office</a>
                  </div>
                </div>
              </article>`).join("")}
            </div>
          </div>
        </div>
      </section>`;
}

function renderAdmissionsStepper() {
  const first = admissionsSteps[0]?.id || "";

  return `
      <section class="section admissions-stepper-section" data-reveal>
        <div class="container admissions-stepper" data-admissions-stepper>
          <div class="section-copy">
            <p class="eyebrow">Application desk</p>
            <h2>A clearer route from first inquiry to activated PU email.</h2>
            <p>Each step below shows the owner, the work required, and the exact next signal applicants should prepare.</p>
          </div>
          <div class="admissions-flow" role="tablist" aria-label="Admissions application steps">
            ${admissionsSteps.map((step) => `
            <button class="admissions-flow-step${step.id === first ? " is-active" : ""}" type="button" role="tab" aria-selected="${step.id === first}" aria-controls="admission-${html(step.id)}" data-admissions-trigger="${html(step.id)}" data-ripple>
              <span>${html(step.number)}</span>
              <strong>${html(step.title)}</strong>
              <small>${html(step.short)}</small>
            </button>`).join("")}
          </div>
          <div class="admissions-step-detail">
            ${admissionsSteps.map((step) => `
            <article id="admission-${html(step.id)}" class="admissions-detail-panel${step.id === first ? " is-active" : ""}" role="tabpanel" data-admissions-panel="${html(step.id)}"${step.id === first ? "" : " hidden"}>
              <span>${html(step.number)} / Application Stage</span>
              <h3>${html(step.title)}</h3>
              <p>${html(step.detail)}</p>
              <ul>
                ${step.checklist.map((item) => `<li>${html(item)}</li>`).join("")}
              </ul>
              <div class="admissions-owner">
                <div><span>Owner</span><strong>${html(step.owner)}</strong></div>
                <a href="mailto:${html(step.email)}">${html(step.email)}</a>
              </div>
            </article>`).join("")}
          </div>
        </div>
      </section>`;
}

function renderResearchSignalBoard(first) {
  return `
              <div class="signal-board-header">
                <span>Evidence flow</span>
                <strong>2026 field cycle</strong>
              </div>
              <div class="signal-pipeline" aria-hidden="true">
                <span>Intake</span>
                <i></i>
                <span>Verify</span>
                <i></i>
                <span>Brief</span>
              </div>
              <div class="research-signal-stack">
                ${researchMapNodes.map((node, index) => `
                <button class="research-signal-card${node.id === first ? " is-active" : ""}" type="button" role="tab" aria-selected="${node.id === first}" aria-controls="research-node-${html(node.id)}" data-research-trigger="${html(node.id)}" data-ripple>
                  <span>${String(index + 1).padStart(2, "0")} / ${html(node.status)}</span>
                  <strong>${html(node.label)}</strong>
                  <small>${html(node.metric)}</small>
                </button>`).join("")}
              </div>
              <div class="signal-board-footer">
                <div><span>Active nodes</span><strong>${researchMapNodes.length}</strong></div>
                <div><span>Public outputs</span><strong>${researchMapNodes.reduce((total, node) => total + node.outputs.length, 0)}</strong></div>
              </div>`;
}

function renderResearchMap() {
  const first = researchMapNodes[0]?.id || "";

  return `
      <section class="section research-map-section" data-reveal>
        <div class="container research-map-console" data-research-map>
          <div class="section-heading">
            <p class="eyebrow">Research evidence console</p>
            <h2>Live research signals across the Pannonian evidence network.</h2>
            <p>Select a node to see the lead lab, current evidence signal, and the outputs students and faculty are building.</p>
          </div>
          <div class="research-map-layout">
            <div class="research-map-board research-signal-board" role="tablist" aria-label="Pannonian research evidence signals">
${renderResearchSignalBoard(first)}
            </div>
            <div class="research-node-detail">
              ${researchMapNodes.map((node) => `
              <article id="research-node-${html(node.id)}" class="research-node-panel${node.id === first ? " is-active" : ""}" role="tabpanel" data-research-panel="${html(node.id)}"${node.id === first ? "" : " hidden"}>
                <div class="research-node-kicker">
                  <span>${html(node.status)}</span>
                  <strong>${html(node.metric)}</strong>
                </div>
                <h3>${html(node.label)}</h3>
                <p>${html(node.summary)}</p>
                <div class="research-node-meta">
                  <div><span>Region</span><strong>${html(node.region)}</strong></div>
                  <div><span>Lead Lab</span><strong>${html(node.lead)}</strong></div>
                </div>
                <ul>
                  ${node.outputs.map((output) => `<li>${html(output)}</li>`).join("")}
                </ul>
              </article>`).join("")}
            </div>
          </div>
        </div>
      </section>`;
}

function renderCampusServiceBoard(first) {
  return `
              <div class="service-board-header">
                <span>Today on campus</span>
                <strong>Student services desk</strong>
              </div>
              <div class="service-clock-card">
                <span>Core window</span>
                <strong>09:00-17:00</strong>
                <p>Visits, advising, wellbeing routing, and partner meetings are handled through the active desks below.</p>
              </div>
              <div class="campus-desk-stack">
                ${campusPlaces.map((place) => `
                <button class="campus-desk-card${place.id === first ? " is-active" : ""}" type="button" role="tab" aria-selected="${place.id === first}" aria-controls="campus-place-${html(place.id)}" data-campus-trigger="${html(place.id)}" data-ripple>
                  <span>${html(place.hours)}</span>
                  <strong>${html(place.label)}</strong>
                  <small>${html(place.services[0])}</small>
                </button>`).join("")}
              </div>
              <div class="service-board-footer">
                <div><span>Open desks</span><strong>${campusPlaces.length}</strong></div>
                <div><span>Primary inbox</span><strong>${html(site.emails.general)}</strong></div>
              </div>`;
}

function renderCommandCenter() {
  const first = commandCenterItems[0]?.id || "";

  return `
      <section class="section command-center-section" data-reveal>
        <div class="container command-center" data-command-center>
          <div class="command-center-copy">
            <p class="eyebrow">Academic command center</p>
            <h2>Live university signals in one operating view.</h2>
            <p>Admissions, fieldwork, research weeks, and campus notices are presented as the same operational rhythm students actually experience.</p>
            <div class="command-metrics">
              <div><span>Next review</span><strong>15 Mar</strong></div>
              <div><span>Active studios</span><strong>14</strong></div>
              <div><span>Open labs</span><strong>07</strong></div>
            </div>
          </div>
          <div class="command-switch" role="tablist" aria-label="University command center items">
            ${commandCenterItems.map((item) => `
            <button class="command-button${item.id === first ? " is-active" : ""}" type="button" role="tab" aria-selected="${item.id === first}" aria-controls="command-${html(item.id)}" data-command-trigger="${html(item.id)}" data-ripple>
              <span>${html(item.label)}</span>
              <strong>${html(item.date)}</strong>
            </button>`).join("")}
          </div>
          <div class="command-panel-frame">
            ${commandCenterItems.map((item) => `
            <article id="command-${html(item.id)}" class="command-panel${item.id === first ? " is-active" : ""}" role="tabpanel" data-command-panel="${html(item.id)}"${item.id === first ? "" : " hidden"}>
              <span>${html(item.metric)}</span>
              <h3>${html(item.title)}</h3>
              <p>${html(item.summary)}</p>
              <a href="${html(item.href)}">${html(item.action)}</a>
            </article>`).join("")}
          </div>
        </div>
      </section>`;
}

function renderUniversityNotices() {
  return `
      <section class="section bulletin-section" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">University notices</p>
            <h2>Current events, deadlines, and public academic signals.</h2>
          </div>
          <div class="bulletin-grid">
            ${universityNotices.map((notice) => `
            <article class="bulletin-card">
              <span>${html(notice.type)} / ${html(notice.date)}</span>
              <h3>${html(notice.title)}</h3>
              <p>${html(notice.summary)}</p>
              <a href="${html(noticeHref(notice))}">Read notice</a>
            </article>`).join("")}
          </div>
        </div>
      </section>`;
}

function renderCampusGuide() {
  const first = campusPlaces[0]?.id || "";

  return `
      <section class="section campus-guide-section" data-reveal>
        <div class="container campus-guide" data-campus-guide>
          <div class="section-heading">
            <p class="eyebrow">Campus service console</p>
            <h2>Check the desks students use every week.</h2>
            <p>Tap a location to see hours, services, and the office that can help before you arrive.</p>
          </div>
          <div class="campus-guide-layout">
            <div class="campus-map-board campus-service-board" role="tablist" aria-label="Campus service desks">
${renderCampusServiceBoard(first)}
            </div>
            <div class="campus-place-detail">
              ${campusPlaces.map((place) => `
              <article id="campus-place-${html(place.id)}" class="campus-place-panel${place.id === first ? " is-active" : ""}" role="tabpanel" data-campus-panel="${html(place.id)}"${place.id === first ? "" : " hidden"}>
                <span>${html(place.hours)}</span>
                <h3>${html(place.title)}</h3>
                <p>${html(place.summary)}</p>
                <ul>
                  ${place.services.map((service) => `<li>${html(service)}</li>`).join("")}
                </ul>
                <a href="mailto:${html(place.contact)}">${html(place.contact)}</a>
              </article>`).join("")}
            </div>
          </div>
        </div>
      </section>`;
}

function renderFacultyProfilePage(faculty) {
  return {
    id: `faculty-${faculty.id}`,
    href: facultyHref(faculty),
    output: `academics/${faculty.id}/index.html`,
    title: `${faculty.name} | Pannonian University`,
    description: `${faculty.name} at Pannonian University: programs, labs, advising, dean, and career signals.`,
    searchSection: "Faculty",
    searchKeywords: [faculty.label, faculty.dean, faculty.programs.join(" "), faculty.labs.join(" "), faculty.featuredCourse].join(" "),
    body: `
      <section class="page-masthead detail-masthead">
        <div class="container">
          <p class="eyebrow">${html(faculty.label)}</p>
          <h1>${html(faculty.name)}</h1>
          <p>${html(faculty.short)}</p>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container detail-layout">
          <aside class="detail-sidebar">
            ${faculty.portrait ? responsiveImage(faculty.portrait.fileName, { ...faculty.portrait, className: "detail-dean-photo" }) : ""}
            <span>Dean</span>
            <strong>${html(faculty.dean)}</strong>
            <p>${html(faculty.office)}</p>
            <a href="mailto:${html(faculty.email)}">${html(faculty.email)}</a>
          </aside>
          <article class="detail-main">
            <p class="eyebrow">Faculty profile</p>
            <h2>Programs, studios, and labs are organized around evidence students can defend.</h2>
            <p>${html(faculty.studio)}</p>
            <div class="detail-stat-grid">
              <div><span>Pathways</span><strong>${html(faculty.metric)}</strong></div>
              <div><span>Featured course</span><strong>${html(faculty.featuredCourse)}</strong></div>
              <div><span>Career signals</span><strong>${html(faculty.careers)}</strong></div>
            </div>
          </article>
        </div>
      </section>

      <section class="section split-band" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Programs and labs</p>
            <h2>Academic routes inside ${html(faculty.label)}.</h2>
          </div>
          <div class="feature-grid two">
            ${faculty.programs.map((program) => `<article class="feature-card"><span class="card-kicker">Program</span><h3>${html(program)}</h3><p>Students combine faculty coursework with methods training, advising, and a partner-facing studio brief.</p></article>`).join("")}
            ${faculty.labs.map((lab) => `<article class="feature-card"><span class="card-kicker">Lab</span><h3>${html(lab)}</h3><p>Faculty and students use this lab for applied research, public evidence, prototypes, or field-facing methods work.</p></article>`).join("")}
          </div>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container split-grid">
          <div>
            <p class="eyebrow">Advising</p>
            <h2>Start with a faculty home, then choose a problem to study deeply.</h2>
            <p>Faculty advisors help students connect core coursework, methods, research ethics, fieldwork, and career preparation without losing disciplinary depth.</p>
          </div>
          <ul class="check-list">
            <li>Faculty advising from the first semester</li>
            <li>Studio or lab work tied to regional evidence</li>
            <li>Capstone planning with a named supervisor</li>
            <li>Portfolio-ready outputs for graduate study or employment</li>
          </ul>
        </div>
      </section>
    `
  };
}

function renderCourseDetailPage(course, index) {
  const previous = curriculumCourses[(index - 1 + curriculumCourses.length) % curriculumCourses.length];
  const next = curriculumCourses[(index + 1) % curriculumCourses.length];
  const intensity = getCourseIntensity(course);
  const prerequisites = getCoursePrerequisites(course);

  return {
    id: `course-${course.id}`,
    href: courseHref(course),
    output: `curriculum/${course.id}/index.html`,
    title: `${course.code} ${course.title} | Pannonian University`,
    description: `${course.code} ${course.title}: credits, outcomes, weekly syllabus, assessment, and research connection at Pannonian University.`,
    searchSection: "Course",
    searchKeywords: [course.code, course.domainLabel, course.levelLabel, course.faculty, course.lab, course.outcomes.join(" ")].join(" "),
    body: `
      <section class="page-masthead detail-masthead">
        <div class="container">
          <p class="eyebrow">${html(course.domainLabel)} / ${html(course.code)}</p>
          <h1>${html(course.title)}</h1>
          <p>${html(course.summary)}</p>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container detail-layout">
          <aside class="detail-sidebar">
            <span>Module facts</span>
            <strong>${html(course.credits)}</strong>
            <p>${html(course.levelLabel)} / ${html(course.term)}</p>
            <a href="mailto:${site.emails.registrar}?subject=${encodeURIComponent(`Course enquiry: ${course.code}`)}">Ask registrar</a>
          </aside>
          <article class="detail-main">
            <p class="eyebrow">Course detail</p>
            <h2>Research connection</h2>
            <p>${html(course.researchTie)}</p>
            <div class="detail-stat-grid">
              <div><span>${html(course.performanceLabel)}</span><strong>${html(course.performanceValue)}</strong></div>
              <div><span>Lab affiliate</span><strong>${html(course.lab)}</strong></div>
              <div><span>Studio intensity</span><strong>${intensity}/100</strong></div>
            </div>
          </article>
        </div>
      </section>

      <section class="section split-band" data-reveal>
        <div class="container detail-two-column">
          <article>
            <p class="eyebrow">Learning outcomes</p>
            <h2>What students should be able to do.</h2>
            <ul class="check-list">
              ${course.outcomes.map((outcome) => `<li>${html(outcome)}</li>`).join("")}
            </ul>
          </article>
          <article>
            <p class="eyebrow">Readiness</p>
            <h2>Prerequisites and assessment.</h2>
            <div class="detail-chip-list">
              ${prerequisites.map((item) => `<span>${html(item)}</span>`).join("")}
            </div>
            <p>${html(course.assessment)}</p>
          </article>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Weekly syllabus</p>
            <h2>Four-week intensive module structure.</h2>
          </div>
          <ol class="detail-week-list">
            ${course.weeks.map(([title, detail], weekIndex) => `<li><span>${String(weekIndex + 1).padStart(2, "0")}</span><div><strong>${html(title)}</strong><p>${html(detail)}</p></div></li>`).join("")}
          </ol>
          <div class="detail-neighbors">
            <a href="${html(courseHref(previous))}">Previous: ${html(previous.code)}</a>
            <a href="/curriculum/">All courses</a>
            <a href="${html(courseHref(next))}">Next: ${html(next.code)}</a>
          </div>
        </div>
      </section>
    `
  };
}

function renderNoticeDetailPage(notice) {
  return {
    id: `notice-${notice.id}`,
    href: noticeHref(notice),
    output: `notices/${notice.id}/index.html`,
    title: `${notice.title} | Pannonian University`,
    description: `${notice.type} notice from Pannonian University: ${notice.summary}`,
    searchSection: "Notice",
    searchKeywords: [notice.type, notice.date, notice.office, notice.contact].join(" "),
    body: `
      <section class="page-masthead detail-masthead">
        <div class="container">
          <p class="eyebrow">${html(notice.type)} / ${html(notice.date)}</p>
          <h1>${html(notice.title)}</h1>
          <p>${html(notice.summary)}</p>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container detail-layout">
          <aside class="detail-sidebar">
            <span>Responsible office</span>
            <strong>${html(notice.office)}</strong>
            <p>${html(notice.date)}</p>
            <a href="mailto:${html(notice.contact)}">${html(notice.contact)}</a>
          </aside>
          <article class="detail-main">
            <p class="eyebrow">Notice detail</p>
            <h2>What this means for students, applicants, and partners.</h2>
            ${notice.details.map((paragraph) => `<p>${html(paragraph)}</p>`).join("")}
          </article>
        </div>
      </section>

      <section class="section split-band" data-reveal>
        <div class="container split-grid">
          <div>
            <p class="eyebrow">Next step</p>
            <h2>Contact the responsible office if this notice affects your timetable.</h2>
            <p>Use your PU email address when writing from an enrolled account so staff can connect the request to your student record.</p>
          </div>
          <div class="hours-panel">
            <div><span>Office</span><strong>${html(notice.office)}</strong></div>
            <div><span>Email</span><strong>${html(notice.contact)}</strong></div>
            <div><span>Notice type</span><strong>${html(notice.type)}</strong></div>
          </div>
        </div>
      </section>
    `
  };
}

function renderInstitutionPage(page) {
  return {
    id: page.id,
    href: page.href,
    output: page.output,
    title: page.title,
    description: page.description,
    searchSection: "University",
    searchKeywords: [page.eyebrow, page.facts.flat().join(" "), page.contact].join(" "),
    body: `
      <section class="page-masthead detail-masthead">
        <div class="container">
          <p class="eyebrow">${html(page.eyebrow)}</p>
          <h1>${html(page.headline)}</h1>
          <p>${html(page.summary)}</p>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container detail-layout">
          <aside class="detail-sidebar">
            <span>Office contact</span>
            <strong>${html(page.eyebrow)}</strong>
            <p>${html(page.contact)}</p>
            <a href="mailto:${html(page.contact)}">${html(page.contact)}</a>
          </aside>
          <article class="detail-main">
            <p class="eyebrow">University information</p>
            <h2>${html(page.summary)}</h2>
            <div class="detail-stat-grid">
              ${page.facts.map(([label, value]) => `<div><span>${html(label)}</span><strong>${html(value)}</strong></div>`).join("")}
            </div>
          </article>
        </div>
      </section>

      <section class="section split-band" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Details</p>
            <h2>How this works at PU.</h2>
          </div>
          <div class="feature-grid three">
            ${page.sections.map((section) => `<article class="feature-card"><span class="card-kicker">${html(page.eyebrow)}</span><h3>${html(section.title)}</h3><p>${html(section.text)}</p></article>`).join("")}
          </div>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Operational signals</p>
            <h2>Useful reference points.</h2>
          </div>
          <div class="module-grid">
            ${page.cards.map(([title, text]) => `<article class="module-card"><span>${html(page.eyebrow)}</span><h3>${html(title)}</h3><p>${html(text)}</p></article>`).join("")}
          </div>
        </div>
      </section>
    `
  };
}

const generatedPages = [
  ...academicFaculties.map(renderFacultyProfilePage),
  ...curriculumCourses.map(renderCourseDetailPage),
  ...universityNotices.map(renderNoticeDetailPage),
  ...institutionPages.map(renderInstitutionPage)
];

const corePages = [
  {
    id: "home",
    href: "/",
    output: "index.html",
    title: "Pannonian University",
    description: "Pannonian University is a modern European university in Serbia focused on regional resilience, intelligent systems, civic leadership, and applied research.",
    body: `
      <section class="hero hero-home" aria-label="Pannonian University campus">
        ${responsiveImage("pannonian-campus-hero.jpg", {
          className: "hero-media",
          alt: "Modern university campus in the Pannonian plain near Novi Sad",
          sizes: "100vw",
          loading: "eager",
          fetchpriority: "high"
        })}
        <div class="hero-shade" aria-hidden="true"></div>
        <div class="container hero-content">
          <p class="eyebrow">Novi Sad, Serbia</p>
          <h1>Pannonian University</h1>
          <p class="hero-lead">A European university for resilient regions, intelligent systems, and civic leadership across the Pannonian plain.</p>
          <div class="hero-actions" aria-label="Primary actions">
            <a class="button button-primary" href="/admissions/" data-ripple>Apply to PU</a>
            <a class="button button-ghost" href="/academics/" data-ripple>Explore programs</a>
          </div>
        </div>
      </section>

      <section class="section section-overview" data-reveal>
        <div class="container overview-grid">
          <div class="section-copy">
            <p class="eyebrow">A university built for the region</p>
            <h2>Academic depth with a practical European outlook.</h2>
            <p>Pannonian University connects rigorous teaching with field-based research in agriculture, engineering, public policy, culture, climate adaptation, and digital systems.</p>
          </div>
          <div class="stat-grid" aria-label="University highlights">
            ${site.stats.map((stat) => `
              <div class="stat-card">
                <strong>${stat.value}</strong>
                <span>${stat.label}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </section>

      ${renderCommandCenter()}

      <section class="section section-programs" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Study areas</p>
            <h2>Programs shaped around problems that matter.</h2>
          </div>
          <div class="feature-grid three">
            <article class="feature-card">
              <span class="card-kicker">Faculty of Engineering</span>
              <h3>Intelligent Infrastructure</h3>
              <p>Energy systems, robotics, transport, civil technology, and human-centered computing.</p>
            </article>
            <article class="feature-card">
              <span class="card-kicker">Faculty of Life Sciences</span>
              <h3>Food, Land, and Climate</h3>
              <p>Agricultural sciences, ecology, biotechnology, and adaptive water management.</p>
            </article>
            <article class="feature-card">
              <span class="card-kicker">Faculty of Society</span>
              <h3>Policy and Culture</h3>
              <p>Law, economics, languages, media, regional studies, and public leadership.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section systems-console-section" data-reveal>
        <div class="container systems-console" data-systems-console>
          <div class="section-copy">
            <p class="eyebrow">Regional systems console</p>
            <h2>One university, three working lenses on the region.</h2>
            <p>PU students learn to read the Pannonian plain as a connected system: water, land, data, communities, and public decisions moving together.</p>
            <div class="console-tabs" role="tablist" aria-label="Regional systems lenses">
              <button class="is-active" type="button" role="tab" aria-selected="true" aria-controls="console-water" data-console-trigger="water" data-ripple>Water</button>
              <button type="button" role="tab" aria-selected="false" aria-controls="console-land" data-console-trigger="land" data-ripple>Land</button>
              <button type="button" role="tab" aria-selected="false" aria-controls="console-society" data-console-trigger="society" data-ripple>Society</button>
            </div>
          </div>
          <div class="console-screen" aria-live="polite">
            <article id="console-water" class="console-panel is-active" role="tabpanel" data-console-panel="water">
              <div class="console-header">
                <span>Danube water intelligence</span>
                <strong>07 field stations</strong>
              </div>
              <p>Hydrology students combine channel observations, groundwater quality, precipitation anomalies, and irrigation risk notes into weekly basin briefs.</p>
              <div class="console-metrics">
                <div><span>Sampling rhythm</span><strong>Weekly</strong></div>
                <div><span>Decision users</span><strong>Municipal + farm</strong></div>
              </div>
              <div class="console-bars" aria-label="Water program emphasis">
                <i style="--level: 86%"><span>Groundwater</span></i>
                <i style="--level: 68%"><span>Irrigation</span></i>
                <i style="--level: 74%"><span>Wetlands</span></i>
              </div>
            </article>
            <article id="console-land" class="console-panel" role="tabpanel" data-console-panel="land" hidden>
              <div class="console-header">
                <span>Climate-smart land studio</span>
                <strong>12 partner plots</strong>
              </div>
              <p>Field teams compare soil moisture, crop vigor, drone imagery, and farm interviews so land-use recommendations stay evidence-led.</p>
              <div class="console-metrics">
                <div><span>Remote sensing</span><strong>UAV + satellite</strong></div>
                <div><span>Studio output</span><strong>Farm briefs</strong></div>
              </div>
              <div class="console-bars" aria-label="Land program emphasis">
                <i style="--level: 78%"><span>Crop stress</span></i>
                <i style="--level: 82%"><span>Soil data</span></i>
                <i style="--level: 64%"><span>Bioeconomy</span></i>
              </div>
            </article>
            <article id="console-society" class="console-panel" role="tabpanel" data-console-panel="society" hidden>
              <div class="console-header">
                <span>Society and public memory</span>
                <strong>18 oral histories</strong>
              </div>
              <p>The Faculty of Society connects borderlands ethnography, economics, public service design, and cultural memory into applied civic studios.</p>
              <div class="console-metrics">
                <div><span>Lead faculty</span><strong>Chen + Huang</strong></div>
                <div><span>Public output</span><strong>Archives + briefs</strong></div>
              </div>
              <div class="console-bars" aria-label="Society program emphasis">
                <i style="--level: 72%"><span>Heritage</span></i>
                <i style="--level: 70%"><span>Economics</span></i>
                <i style="--level: 80%"><span>Civic data</span></i>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="section evidence-band" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Research grounded in place</p>
            <h2>PU studies the real pressures shaping the Serbian Danube region.</h2>
            <p>Our research agenda is built around current evidence on agricultural water stress, irrigation quality, digital farming, forest resilience, and internationally protected wetlands.</p>
          </div>
          <div class="fact-grid">
            <article class="fact-card">
              <span>Water</span>
              <strong>Serbian Danube Basin</strong>
              <p>Recent hydrological research projects warmer, drier peak growing seasons for rainfed crops by mid-century.</p>
            </article>
            <article class="fact-card">
              <span>Agriculture</span>
              <strong>Digital biosystems</strong>
              <p>Novi Sad is already home to advanced work in sensors, remote sensing, IoT, AI, and sustainable agriculture.</p>
            </article>
            <article class="fact-card">
              <span>Soil</span>
              <strong>Vojvodina aquifers</strong>
              <p>Groundwater monitoring shows why irrigation quality, salinity, and crop yield protection need continuous study.</p>
            </article>
            <article class="fact-card">
              <span>Nature</span>
              <strong>Wetland systems</strong>
              <p>Serbia has 11 Ramsar sites, making wetland restoration and biodiversity monitoring a natural regional priority.</p>
            </article>
          </div>
          <div class="research-image-row">
            <figure class="image-card">
              ${responsiveImage("research-fieldwork.jpg", { alt: "Researchers collecting soil samples in a Pannonian crop field" })}
              <figcaption>Field teams combine soil sampling, drone imagery, and irrigation-channel observations.</figcaption>
            </figure>
            <figure class="image-card">
              ${responsiveImage("research-data-studio.jpg", { alt: "Researchers reviewing geospatial maps and river basin models in a data studio" })}
              <figcaption>The Open Data Studio turns field evidence into maps, models, and public briefs.</figcaption>
            </figure>
          </div>
          <a class="text-link" href="/research/">Explore PU research themes</a>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container media-split">
          <figure class="image-card">
            ${responsiveImage("academic-studio.jpg", { alt: "Students and faculty working in an interdisciplinary project studio" })}
            <figcaption>Project studios bring students from engineering, life sciences, policy, and media into the same room.</figcaption>
          </figure>
          <div class="media-copy">
            <p class="eyebrow">How PU feels</p>
            <h2>Small enough to know your project, broad enough to change its scale.</h2>
            <p>Students move between seminars, labs, field visits, public briefs, and partner studios. The university is designed around repeated contact with faculty, not anonymous lecture halls.</p>
            <div class="info-list">
              <div><span>Advising</span><strong>Every student has a faculty advisor from semester one.</strong></div>
              <div><span>Language</span><strong>Serbian and English-taught modules support regional and international study.</strong></div>
              <div><span>Output</span><strong>Capstones become portfolios, datasets, policy notes, prototypes, or field reports.</strong></div>
            </div>
          </div>
        </div>
      </section>

      ${renderUniversityNotices()}

      <section class="section split-band" data-reveal>
        <div class="container split-grid">
          <div>
            <p class="eyebrow">Admissions</p>
            <h2>Your university email starts with the domain.</h2>
            <p>Students, faculty, and staff use official PU email identities at <strong>${site.domain}</strong>. Admissions support is available at <a href="mailto:${site.emails.admissions}">${site.emails.admissions}</a>.</p>
          </div>
          <div class="timeline" aria-label="Admissions timeline">
            <div><span>01</span><p>Choose a program and prepare transcripts.</p></div>
            <div><span>02</span><p>Submit application materials online.</p></div>
            <div><span>03</span><p>Receive faculty review and enrollment guidance.</p></div>
          </div>
        </div>
      </section>
    `
  },
  {
    id: "academics",
    href: "/academics/",
    output: "academics/index.html",
    title: "Academics | Pannonian University",
    description: "Explore faculties, degree pathways, academic advising, and interdisciplinary learning at Pannonian University.",
    body: `
      <section class="page-masthead">
        <div class="container">
          <p class="eyebrow">Academics</p>
          <h1>Faculties that connect theory, fieldwork, and regional purpose.</h1>
          <p>PU programs are designed around strong disciplinary foundations and project studios where students work with civic, scientific, and industry partners.</p>
        </div>
      </section>

      ${renderAcademicExplorer()}

      <section class="section" data-reveal>
        <div class="container feature-grid three">
          <article class="feature-card">
            <span class="card-kicker">Faculty</span>
            <h2>Engineering and Computing</h2>
            <p>Software systems, AI, robotics, energy, transport, civil engineering, and product design.</p>
          </article>
          <article class="feature-card">
            <span class="card-kicker">Faculty</span>
            <h2>Life and Environmental Sciences</h2>
            <p>Agronomy, ecology, biotechnology, food systems, climate adaptation, and water resilience.</p>
          </article>
          <article class="feature-card">
            <span class="card-kicker">Faculty</span>
            <h2>Business and Public Policy</h2>
            <p>Economics, management, law, public administration, urban policy, and European affairs.</p>
          </article>
          <article class="feature-card">
            <span class="card-kicker">Faculty</span>
            <h2>Arts, Media, and Humanities</h2>
            <p>Design, digital media, languages, heritage studies, communication, and contemporary culture.</p>
          </article>
          <article class="feature-card">
            <span class="card-kicker">Faculty</span>
            <h2>Health and Human Performance</h2>
            <p>Public health, sports science, nutrition, psychology, and community wellbeing.</p>
          </article>
          <article class="feature-card">
            <span class="card-kicker">Faculty</span>
            <h2>Graduate School</h2>
            <p>Master's and doctoral training with research methods, mobility, and publication support.</p>
          </article>
        </div>
      </section>

      <section class="section split-band" data-reveal>
        <div class="container split-grid">
          <div>
            <p class="eyebrow">Academic model</p>
            <h2>Studio learning every semester.</h2>
            <p>Each degree pathway includes a studio, clinic, lab, or field module so students graduate with evidence of practical work, not only exam results.</p>
          </div>
          <ul class="check-list">
            <li>Undergraduate, master's, and doctoral pathways</li>
            <li>English and Serbian-taught modules</li>
            <li>Mobility windows with European partner universities</li>
            <li>Faculty advising from the first semester</li>
          </ul>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container media-split">
          <div class="media-copy">
            <p class="eyebrow">Academic advising</p>
            <h2>Choose a faculty, then build a concentration around a real problem.</h2>
            <p>Each student combines a faculty home with a concentration, a methods sequence, and a partner-facing project. Advisors help keep the path coherent while leaving room for discovery.</p>
            <div class="info-list">
              <div><span>Core</span><strong>Writing, quantitative reasoning, regional studies, and ethics.</strong></div>
              <div><span>Methods</span><strong>Field sampling, design research, data analysis, policy evaluation, or lab protocols.</strong></div>
              <div><span>Studio</span><strong>Team-based briefs with municipalities, institutes, farms, clinics, or cultural organizations.</strong></div>
            </div>
          </div>
          <figure class="image-card">
            ${responsiveImage("academic-studio.jpg", { alt: "Pannonian University students reviewing prototypes and regional datasets in a project studio" })}
            <figcaption>Academic studios connect coursework to public questions, technical prototypes, and field evidence.</figcaption>
          </figure>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Research-linked learning</p>
            <h2>Students work with datasets, field protocols, and policy questions from the region.</h2>
          </div>
          <div class="module-grid">
            <article class="module-card">
              <span>Year 1</span>
              <h3>Regional Evidence Lab</h3>
              <p>Students learn to read open hydrological, soil, biodiversity, and demographic datasets before choosing a faculty track.</p>
            </article>
            <article class="module-card">
              <span>Year 2</span>
              <h3>Methods Studio</h3>
              <p>Coursework introduces remote sensing, survey design, environmental sampling, legal analysis, and reproducible notebooks.</p>
            </article>
            <article class="module-card">
              <span>Year 3</span>
              <h3>Partner Challenge</h3>
              <p>Student teams respond to a brief from a municipality, research institute, farm cooperative, NGO, or public utility.</p>
            </article>
            <article class="module-card">
              <span>Final year</span>
              <h3>Capstone Evidence Dossier</h3>
              <p>Each graduate produces a public-facing research or design dossier with methods, limitations, and recommendations.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section split-band" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Pathways</p>
            <h2>Sample concentrations students can build across faculties.</h2>
          </div>
          <div class="pathway-grid">
            <article class="pathway-card">
              <span>Engineering + Life Sciences</span>
              <h3>AgTech and Water Systems</h3>
              <p>Remote sensing, irrigation quality, farm decision support, and lowland infrastructure.</p>
            </article>
            <article class="pathway-card">
              <span>Policy + Computing</span>
              <h3>Public Data and Civic AI</h3>
              <p>Auditable algorithms, public dashboards, service design, and data governance.</p>
            </article>
            <article class="pathway-card">
              <span>Humanities + Media</span>
              <h3>Borderlands Culture</h3>
              <p>Language, archives, migration, cultural memory, and public storytelling.</p>
            </article>
            <article class="pathway-card">
              <span>Health + Society</span>
              <h3>Community Wellbeing</h3>
              <p>Public health, nutrition, sports science, mental health, and local service access.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section cohort-section" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Faculty leadership and public scholars</p>
            <h2>Academic leaders students meet through studios, fieldwork, and public lectures.</h2>
          </div>
          <div class="cohort-showcase" data-cohort-showcase>
            <div class="cohort-list" role="tablist" aria-label="Faculty leadership profiles">
              <button class="cohort-item is-active" type="button" role="tab" aria-selected="true" aria-controls="profile-chen" data-cohort-trigger="chen" data-ripple>
                <strong>Chen Wei Hong</strong>
                <span>Dean, Faculty of Society</span>
                <small>Office: Borderlands Memory</small>
              </button>
              <button class="cohort-item" type="button" role="tab" aria-selected="false" aria-controls="profile-huang" data-cohort-trigger="huang" data-ripple>
                <strong>Huang Yu Fei</strong>
                <span>Dean, School of Economics</span>
                <small>Office: Regional Growth</small>
              </button>
              <button class="cohort-item" type="button" role="tab" aria-selected="false" aria-controls="profile-liu" data-cohort-trigger="liu" data-ripple>
                <strong>Liu Jun Ye</strong>
                <span>Professor of Physics</span>
                <small>Lab: Quantum Materials</small>
              </button>
              <button class="cohort-item" type="button" role="tab" aria-selected="false" aria-controls="profile-milena" data-cohort-trigger="milena" data-ripple>
                <strong>Milena Kovac</strong>
                <span>Director, Water Futures Lab</span>
                <small>Office: Danube Basin</small>
              </button>
              <button class="cohort-item" type="button" role="tab" aria-selected="false" aria-controls="profile-luka" data-cohort-trigger="luka" data-ripple>
                <strong>Luka Petrovic</strong>
                <span>Chair, Open Data Studio</span>
                <small>Office: Public Dashboards</small>
              </button>
            </div>
            <div class="cohort-detail-shell">
              <article id="profile-chen" class="cohort-detail is-active" role="tabpanel" data-cohort-detail="chen">
                <p class="cohort-quote">"Society is not a soft backdrop to technical work. It is where water policy, cultural memory, language, and public trust become visible."</p>
                <div class="cohort-person">
                  ${responsiveImage("chen-wei-hong-portrait.jpg", {
                    alt: "Chen Wei Hong, Dean of the Faculty of Society",
                    className: "person-photo",
                    width: 960,
                    height: 1200,
                    widths: [360, 720, 960],
                    sizes: "(max-width: 680px) 112px, 168px"
                  })}
                  <div>
                    <h3>Chen Wei Hong</h3>
                    <p>Dean, Faculty of Society</p>
                  </div>
                </div>
                <div class="profile-inspector-grid">
                  <div><span>Office Hours</span><strong>Wed 14:00-16:00</strong></div>
                  <div><span>Course</span><strong>ANT-240 Borderlands Ethnography</strong></div>
                  <div><span>Research Output</span><strong>Public history exhibit scripts</strong></div>
                </div>
                <div class="cohort-project">
                  <span>Active project profile</span>
                  <strong>Borderlands Memory Project</strong>
                  <p>Oral histories, public archives, field ethics, and heritage exhibitions with communities across the Pannonian borderlands.</p>
                  <a href="mailto:chen.weihong@${site.domain}">chen.weihong@${site.domain}</a>
                </div>
              </article>
              <article id="profile-huang" class="cohort-detail" role="tabpanel" data-cohort-detail="huang" hidden>
                <p class="cohort-quote">"Regional economics works best when students can read a balance sheet, a logistics route, and a municipal budget in the same week."</p>
                <div class="cohort-person">
                  ${responsiveImage(economicsFaculty.portrait.fileName, {
                    ...economicsFaculty.portrait,
                    className: "person-photo",
                    sizes: "(max-width: 680px) 112px, 168px"
                  })}
                  <div>
                    <h3>Huang Yu Fei</h3>
                    <p>Dean, School of Economics</p>
                  </div>
                </div>
                <div class="profile-inspector-grid">
                  <div><span>Office Hours</span><strong>Tue 10:00-12:00</strong></div>
                  <div><span>Course</span><strong>ECO-220 Responsible Growth</strong></div>
                  <div><span>Research Output</span><strong>Policy scenario memos</strong></div>
                </div>
                <div class="cohort-project">
                  <span>Active project profile</span>
                  <strong>Responsible Growth Studio</strong>
                  <p>Applied finance, circular bioeconomy, logistics evidence, and industry partnerships across the Danube corridor.</p>
                  <a href="mailto:huang.yufei@${site.domain}">huang.yufei@${site.domain}</a>
                </div>
              </article>
              <article id="profile-liu" class="cohort-detail" role="tabpanel" data-cohort-detail="liu" hidden>
                <p class="cohort-quote">"Physics is clearest when equations, instruments, and student notebooks agree on the same phenomenon."</p>
                <div class="cohort-person">
                  ${responsiveImage("liu-jun-ye-portrait.jpg", {
                    alt: "Liu Jun Ye, Professor of Physics",
                    className: "person-photo",
                    width: 960,
                    height: 1200,
                    widths: [360, 720, 960],
                    sizes: "(max-width: 680px) 112px, 168px"
                  })}
                  <div>
                    <h3>Liu Jun Ye</h3>
                    <p>Professor of Physics</p>
                  </div>
                </div>
                <div class="profile-inspector-grid">
                  <div><span>Office Hours</span><strong>Mon 15:00-17:00</strong></div>
                  <div><span>Course</span><strong>PHY-210 Experimental Physics</strong></div>
                  <div><span>Research Output</span><strong>Spectroscopy lab notebooks</strong></div>
                </div>
                <div class="cohort-project">
                  <span>Active project profile</span>
                  <strong>Quantum Materials and Measurement Lab</strong>
                  <p>Condensed matter physics, optics, environmental sensing instrumentation, and rigorous lab methods for engineering and life-science students.</p>
                  <a href="mailto:liu.junye@${site.domain}">liu.junye@${site.domain}</a>
                </div>
              </article>
              <article id="profile-milena" class="cohort-detail" role="tabpanel" data-cohort-detail="milena" hidden>
                <p class="cohort-quote">"A useful water model must leave the screen and meet a field notebook, a pump schedule, and a public question."</p>
                <div class="cohort-person">
                  <div class="person-avatar" aria-hidden="true">MK</div>
                  <div>
                    <h3>Milena Kovac</h3>
                    <p>Director, Water Futures Lab</p>
                  </div>
                </div>
                <div class="profile-inspector-grid">
                  <div><span>Office Hours</span><strong>Thu 13:00-15:00</strong></div>
                  <div><span>Course</span><strong>WAT-310 Groundwater Risk</strong></div>
                  <div><span>Research Output</span><strong>Sample-chain dashboards</strong></div>
                </div>
                <div class="cohort-project">
                  <span>Active project profile</span>
                  <strong>Danube Water Futures</strong>
                  <p>Groundwater sampling, irrigation risk interpretation, wetland monitoring, and basin dashboards for local decision makers.</p>
                  <a href="mailto:milena.kovac@${site.domain}">milena.kovac@${site.domain}</a>
                </div>
              </article>
              <article id="profile-luka" class="cohort-detail" role="tabpanel" data-cohort-detail="luka" hidden>
                <p class="cohort-quote">"Public dashboards need methods notes, uncertainty labels, and interfaces ordinary residents can actually read."</p>
                <div class="cohort-person">
                  <div class="person-avatar" aria-hidden="true">LP</div>
                  <div>
                    <h3>Luka Petrovic</h3>
                    <p>Chair, Open Data Studio</p>
                  </div>
                </div>
                <div class="profile-inspector-grid">
                  <div><span>Office Hours</span><strong>Fri 11:00-13:00</strong></div>
                  <div><span>Course</span><strong>DAT-330 Open Data Studio</strong></div>
                  <div><span>Research Output</span><strong>Accessible public dashboards</strong></div>
                </div>
                <div class="cohort-project">
                  <span>Active project profile</span>
                  <strong>Civic Data Interface Lab</strong>
                  <p>Accessible visual explanation, public service prototypes, data trusts, and reproducible notebooks for partner municipalities.</p>
                  <a href="mailto:luka.petrovic@${site.domain}">luka.petrovic@${site.domain}</a>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    `
  },
  {
    id: "curriculum",
    href: "/curriculum/",
    output: "curriculum/index.html",
    title: "Curriculum | Pannonian University",
    description: "Explore Pannonian University course modules by domain, level, and syllabus focus.",
    body: `
      <section class="page-masthead">
        <div class="container">
          <p class="eyebrow">Curriculum</p>
          <h1>Course modules organized by domain, level, and applied syllabus.</h1>
          <p>PU's curriculum is built as a searchable module catalog. Students combine foundation courses, core explorations, lab crucibles, and partner studios into a coherent faculty pathway.</p>
        </div>
      </section>

      <section class="section curriculum-section" data-reveal>
        <div class="container curriculum-layout">
          <aside class="curriculum-sidebar" aria-label="Curriculum filters">
            <label class="curriculum-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"></path></svg>
              <span class="sr-only">Filter course modules</span>
              <input data-course-search type="search" placeholder="Filter by keyword or code..." aria-label="Filter by keyword or code">
            </label>
            <div class="filter-panel">
              <h2>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v16M18 4v16M3 8h6M15 8h6M3 16h6M15 16h6"></path></svg>
                Refine Modules
              </h2>
              <div class="filter-group">
                <h3>Direction Domain</h3>
                <button class="is-active" type="button" data-filter-type="domain" data-filter-value="all">All Domains</button>
                <button type="button" data-filter-type="domain" data-filter-value="danube-systems">Danube Systems</button>
                <button type="button" data-filter-type="domain" data-filter-value="climate-land">Climate &amp; Land</button>
                <button type="button" data-filter-type="domain" data-filter-value="public-data">Public Data</button>
                <button type="button" data-filter-type="domain" data-filter-value="culture-society">Culture &amp; Society</button>
                <button type="button" data-filter-type="domain" data-filter-value="economics">Economics</button>
              </div>
              <div class="filter-group">
                <h3>Academic Stage</h3>
                <button class="is-active" type="button" data-filter-type="level" data-filter-value="all">All Stages</button>
                <button type="button" data-filter-type="level" data-filter-value="foundation">Foundation</button>
                <button type="button" data-filter-type="level" data-filter-value="core-exploration">Core Exploration</button>
                <button type="button" data-filter-type="level" data-filter-value="lab-crucible">Lab Crucible</button>
                <button type="button" data-filter-type="level" data-filter-value="partner-studio">Partner Studio</button>
              </div>
            </div>
          </aside>
          <div class="curriculum-results">
            <p class="result-count">Filtered Result Count: <strong data-result-count>${curriculumCourses.length}</strong> Course Modules</p>
            <div class="course-grid">
              ${renderCourseCards()}
            </div>
            <p class="course-empty" data-course-empty hidden>No modules match those filters yet.</p>
          </div>
        </div>
      </section>
      ${renderSyllabusDrawer()}
    `
  },
  {
    id: "admissions",
    href: "/admissions/",
    output: "admissions/index.html",
    title: "Admissions | Pannonian University",
    description: "Admissions information for undergraduate, graduate, and international applicants to Pannonian University.",
    body: `
      <section class="page-masthead admissions-masthead">
        <div class="container">
          <p class="eyebrow">Admissions</p>
          <h1>Start your application to Pannonian University.</h1>
          <p>Our admissions team helps applicants choose programs, prepare documents, and understand study options in Serbia.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="mailto:${site.emails.admissions}" data-ripple>Email admissions</a>
            <a class="button button-light" href="/academics/" data-ripple>Compare faculties</a>
          </div>
        </div>
      </section>

      ${renderAdmissionsStepper()}

      <section class="section deadline-band" data-reveal>
        <div class="container split-grid">
          <div>
            <p class="eyebrow">Applicant support</p>
            <h2>Questions are handled by real admissions staff.</h2>
            <p>Use <a href="mailto:${site.emails.admissions}">${site.emails.admissions}</a> for applications and <a href="mailto:${site.emails.registrar}">${site.emails.registrar}</a> for enrollment records.</p>
          </div>
          <div class="date-panel">
            <span>Priority review</span>
            <strong>15 March</strong>
            <p>Recommended date for international applicants seeking early faculty review.</p>
          </div>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container media-split">
          <figure class="image-card">
            ${responsiveImage("library-commons.jpg", { alt: "Students studying and meeting advisors in the Pannonian University library commons", height: 940 })}
            <figcaption>Applicants can meet advisors online or on campus before selecting a faculty pathway.</figcaption>
          </figure>
          <div class="media-copy">
            <p class="eyebrow">Applicant tracks</p>
            <h2>Different entry routes, one clear review process.</h2>
            <p>PU admissions looks for readiness, curiosity, and evidence of sustained work. Every applicant receives a checklist and a named contact after inquiry.</p>
            <div class="info-list">
              <div><span>Undergraduate</span><strong>Transcript review, language readiness, statement, and faculty fit.</strong></div>
              <div><span>Graduate</span><strong>Prior degree record, research or professional proposal, and faculty consultation.</strong></div>
              <div><span>International</span><strong>Document verification, arrival support, housing guidance, and visa coordination.</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section split-band" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">What to prepare</p>
            <h2>A practical checklist before you apply.</h2>
          </div>
          <div class="checklist-grid">
            <article><span>Documents</span><p>Academic transcripts, identity document, translations when required, and program-specific evidence.</p></article>
            <article><span>Statement</span><p>A short statement explaining your academic interests, project experience, and why PU fits your goals.</p></article>
            <article><span>Language</span><p>Evidence of Serbian or English readiness depending on module language and degree pathway.</p></article>
            <article><span>Funding</span><p>Scholarship interest, sponsor letter if relevant, and estimated living-cost plan for Novi Sad.</p></article>
          </div>
        </div>
      </section>
    `
  },
  {
    id: "research",
    href: "/research/",
    output: "research/index.html",
    title: "Research | Pannonian University",
    description: "Research centers, institutes, and applied projects at Pannonian University.",
    body: `
      <section class="page-masthead">
        <div class="container">
          <p class="eyebrow">Research</p>
          <h1>Applied research for resilient regions, productive landscapes, and intelligent public systems.</h1>
          <p>PU researchers work across faculties to address climate adaptation, digital infrastructure, soil and water protection, forest resilience, cultural memory, and responsible innovation.</p>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container research-layout">
          <article class="research-lead">
            <p class="eyebrow">Research office</p>
            <h2>From field evidence to publishable work.</h2>
            <p>The Office for Research and Partnerships supports grant development, ethics review, data stewardship, field logistics, and international collaboration. The research agenda below is tied to documented challenges in the Serbian Danube Basin and Pannonian lowlands.</p>
            <a class="text-link" href="mailto:${site.emails.research}">Contact ${site.emails.research}</a>
          </article>
          <div class="feature-grid two">
            <article class="feature-card">
              <span class="card-kicker">Institute</span>
              <h3>Danube Systems Lab</h3>
              <p>Hydrological risk, river logistics, water quality, irrigation demand, and cross-border infrastructure modeling.</p>
            </article>
            <article class="feature-card">
              <span class="card-kicker">Center</span>
              <h3>Pannonian Climate Studio</h3>
              <p>Drought adaptation, soil health, crop-water balance, urban heat, and regional food security.</p>
            </article>
            <article class="feature-card">
              <span class="card-kicker">Lab</span>
              <h3>Human-Centered AI Group</h3>
              <p>Auditable AI, language technologies, public service design, education tools, and data governance.</p>
            </article>
            <article class="feature-card">
              <span class="card-kicker">Archive</span>
              <h3>Borderlands Memory Project</h3>
              <p>Digital humanities work on identity, language, media, and regional heritage.</p>
            </article>
          </div>
        </div>
      </section>

      ${renderResearchMap()}

      <section class="section visual-research-section" data-reveal>
        <div class="container visual-research-grid">
          <figure class="research-photo large">
            ${responsiveImage("research-fieldwork.jpg", { alt: "Pannonian University researchers collecting soil and crop data in a Vojvodina field", sizes: "(min-width: 980px) 58vw, 100vw" })}
            <figcaption>Climate-smart agriculture fieldwork near irrigation channels in the Pannonian lowlands.</figcaption>
          </figure>
          <div class="observatory-panel" aria-label="Pannonian Observatory research dashboard">
            <div class="observatory-header">
              <p class="eyebrow">Pannonian Observatory</p>
              <h2>One regional evidence system, four live research lenses.</h2>
              <p>Designed for public dashboards, faculty studios, and partner briefs across the Danube corridor.</p>
            </div>
            <div class="signal-grid">
              <div class="signal-card">
                <span>Water stress</span>
                <strong>High watch</strong>
                <i style="--level: 78%"></i>
              </div>
              <div class="signal-card">
                <span>Soil salinity</span>
                <strong>Sampling</strong>
                <i style="--level: 54%"></i>
              </div>
              <div class="signal-card">
                <span>Crop vigor</span>
                <strong>Remote sensing</strong>
                <i style="--level: 66%"></i>
              </div>
              <div class="signal-card">
                <span>Wetland habitat</span>
                <strong>Seasonal</strong>
                <i style="--level: 43%"></i>
              </div>
            </div>
            <div class="basin-map" aria-hidden="true">
              <span class="basin-line main"></span>
              <span class="basin-line branch-a"></span>
              <span class="basin-line branch-b"></span>
              <span class="basin-node node-a"></span>
              <span class="basin-node node-b"></span>
              <span class="basin-node node-c"></span>
            </div>
          </div>
          <figure class="research-photo">
            ${responsiveImage("research-data-studio.jpg", { alt: "Pannonian University research team reviewing river basin and climate dashboards" })}
            <figcaption>Data studio reviews connect field samples, satellite imagery, and municipal planning questions.</figcaption>
          </figure>
        </div>
      </section>

      <section class="section evidence-band" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Evidence base</p>
            <h2>Research themes aligned with published regional evidence.</h2>
            <p>PU does not treat the Pannonian plain as a generic backdrop. It is the subject: a lowland agricultural, riverine, multilingual, and climate-sensitive region with measurable research needs.</p>
          </div>
          <div class="evidence-grid">
            <article class="evidence-card">
              <span>2025 open-access study</span>
              <h3>Crop-water stress in the Serbian Danube River Basin</h3>
              <p>A Journal of Hydrology: Regional Studies paper models 2041-2070 scenarios and finds intensifying peak-season water scarcity for spring-planted rainfed crops.</p>
              <a class="source-link" href="https://doaj.org/article/d91a76df5c94482aad970d9ffb62d307">Read study record</a>
            </article>
            <article class="evidence-card">
              <span>Regional institute</span>
              <h3>Digital agriculture in Novi Sad</h3>
              <p>BioSense Institute describes work across sensor design, remote sensing, IoT, AI, biosystems, and sustainable agriculture, including the AgroSense platform.</p>
              <a class="source-link" href="https://biosens.rs/en/about-us">Read institute profile</a>
            </article>
            <article class="evidence-card">
              <span>Open-access article</span>
              <h3>Irrigation water quality and salinization risk</h3>
              <p>Research on first-aquifer groundwater in Vojvodina reports mineralization concerns and the potential for soil degradation and yield reduction if irrigation water is unmanaged.</p>
              <a class="source-link" href="https://doaj.org/article/c120467fdc7e4190819f242a4ff1e517">Read article record</a>
            </article>
            <article class="evidence-card">
              <span>International convention</span>
              <h3>Wetland protection and restoration</h3>
              <p>The Ramsar Convention country profile lists 11 Serbian Ramsar sites covering 130,411 hectares, including sites relevant to Danube and Sava floodplain ecology.</p>
              <a class="source-link" href="https://www.ramsar.org/country-profile/serbia">Read Ramsar profile</a>
            </article>
          </div>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Research clusters</p>
            <h2>Six clusters organize faculty labs, doctoral work, and partner projects.</h2>
          </div>
          <div class="cluster-grid">
            <article class="cluster-card">
              <span>01</span>
              <h3>Danube Water Futures</h3>
              <p>River basin planning, flood risk, drought signals, irrigation demand, water quality, and public infrastructure decisions.</p>
              <ul>
                <li>SWAT+ and basin-scale hydrological models</li>
                <li>Groundwater monitoring and irrigation quality</li>
                <li>Municipal flood and heat preparedness</li>
              </ul>
            </article>
            <article class="cluster-card">
              <span>02</span>
              <h3>Climate-Smart Agriculture</h3>
              <p>Field-crop resilience, soil fertility, crop stress monitoring, pest risk, and farm decision support.</p>
              <ul>
                <li>Remote sensing and UAV-derived vegetation indices</li>
                <li>Soil organic matter and nutrient management</li>
                <li>Adaptation briefs for cooperatives</li>
              </ul>
            </article>
            <article class="cluster-card">
              <span>03</span>
              <h3>Wetlands, Forests, and Biodiversity</h3>
              <p>Lowland forestry, wetland restoration, carbon storage, protected area planning, and biodiversity observation.</p>
              <ul>
                <li>Floodplain habitat monitoring</li>
                <li>Forest genetic resources and restoration</li>
                <li>Citizen science species observations</li>
              </ul>
            </article>
            <article class="cluster-card">
              <span>04</span>
              <h3>Human-Centered AI and Public Data</h3>
              <p>AI systems that can be explained, audited, and used responsibly in education, agriculture, health, and public services.</p>
              <ul>
                <li>Serbian and multilingual language technologies</li>
                <li>Data trusts and public-interest analytics</li>
                <li>Accessible civic service prototypes</li>
              </ul>
            </article>
            <article class="cluster-card">
              <span>05</span>
              <h3>Borderlands Society and Heritage</h3>
              <p>Regional identity, minority languages, cultural memory, migration, media systems, and shared civic narratives.</p>
              <ul>
                <li>Lead faculty: Chen Wei Hong, Dean of the Faculty of Society</li>
                <li>Digital archives and oral histories</li>
                <li>Cross-border education and media studies</li>
                <li>Public history exhibitions</li>
              </ul>
            </article>
            <article class="cluster-card">
              <span>06</span>
              <h3>Regional Industry and Responsible Growth</h3>
              <p>Applied economics, logistics, clean energy, entrepreneurship, procurement, and regulatory design for resilient growth.</p>
              <ul>
                <li>Lead faculty: Huang Yu Fei, Dean of Economics</li>
                <li>Danube corridor logistics</li>
                <li>AgTech and circular bioeconomy startups</li>
                <li>Evidence-based public finance</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section class="section split-band" data-reveal>
        <div class="container split-grid">
          <div>
            <p class="eyebrow">Featured project briefs</p>
            <h2>Projects are written as evidence dossiers, not promotional claims.</h2>
            <p>Each PU project brief records the question, field methods, datasets, limitations, partner use case, and expected public output.</p>
          </div>
          <div class="project-list">
            <article>
              <span>2026-2028</span>
              <h3>Green Water Atlas for Rainfed Crops</h3>
              <p>Maps rainfall-derived soil moisture stress for maize, sunflower, soybean, and wheat systems across selected Serbian Danube sub-basins.</p>
            </article>
            <article>
              <span>2026-2027</span>
              <h3>First-Aquifer Irrigation Quality Watch</h3>
              <p>Combines seasonal sampling, farmer interviews, and open maps to identify where groundwater use needs salinity safeguards.</p>
            </article>
            <article>
              <span>2027 pilot</span>
              <h3>Floodplain Biodiversity Observatory</h3>
              <p>Links protected wetland records, drone imagery, and citizen science observations for floodplain habitat management.</p>
            </article>
            <article>
              <span>Rolling</span>
              <h3>Public AI Audit Studio</h3>
              <p>Tests AI tools for accessibility, explainability, bias, and civic usefulness before they are recommended for university or municipal use.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Research infrastructure</p>
            <h2>Shared platforms for fieldwork, computation, and public communication.</h2>
          </div>
          <div class="infrastructure-grid">
            <article>
              <h3>Field stations</h3>
              <p>Seasonal sampling points for soil moisture, irrigation water, wetland habitat condition, and urban heat observations.</p>
            </article>
            <article>
              <h3>Open data studio</h3>
              <p>Reproducible notebooks, geospatial dashboards, multilingual explainers, and public dataset documentation.</p>
            </article>
            <article>
              <h3>Applied methods clinic</h3>
              <p>Support for ethics review, survey design, remote sensing workflows, model validation, and uncertainty communication.</p>
            </article>
          </div>
        </div>
      </section>
    `
  },
  {
    id: "campus",
    href: "/campus/",
    output: "campus/index.html",
    title: "Campus | Pannonian University",
    description: "Campus life, student services, housing, and the Novi Sad setting of Pannonian University.",
    body: `
      <section class="page-masthead campus-masthead">
        <div class="container">
          <p class="eyebrow">Campus</p>
          <h1>A compact campus connected to Novi Sad and the Pannonian plain.</h1>
          <p>PU is planned around walkable courtyards, labs, studios, library spaces, sports facilities, and public events.</p>
        </div>
      </section>

      ${renderCampusGuide()}

      <section class="section" data-reveal>
        <div class="container campus-grid">
          <article>
            <p class="eyebrow">Student life</p>
            <h2>Places to study, gather, move, and build.</h2>
            <p>The campus balances quiet academic work with open social spaces, cultural programming, and easy access to city life.</p>
          </article>
          <div class="feature-grid two">
            <article class="feature-card">
              <h3>Library commons</h3>
              <p>Reading rooms, media suites, research consultations, and late-evening study access.</p>
            </article>
            <article class="feature-card">
              <h3>Residence support</h3>
              <p>Housing guidance, arrival support, and student wellbeing services for local and international students.</p>
            </article>
            <article class="feature-card">
              <h3>Sports and wellness</h3>
              <p>Training courts, cycling routes, counseling, nutrition guidance, and health promotion.</p>
            </article>
            <article class="feature-card">
              <h3>City partnerships</h3>
              <p>Internships, public lectures, cultural venues, and civic projects across Novi Sad.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section split-band" data-reveal>
        <div class="container media-split">
          <div class="media-copy">
            <p class="eyebrow">Library commons</p>
            <h2>The campus is organized around shared work, not just buildings.</h2>
            <p>The library commons anchors advising, research consultations, media production, quiet study, and public events. It is the place students return to between fieldwork, seminars, and city placements.</p>
            <div class="info-list">
              <div><span>Study</span><strong>Quiet rooms, group tables, data workstations, and extended evening access.</strong></div>
              <div><span>Support</span><strong>Writing center, peer tutoring, research help, counseling referral, and accessibility services.</strong></div>
              <div><span>Public life</span><strong>Lectures, exhibitions, partner briefings, and student society meetings.</strong></div>
            </div>
          </div>
          <figure class="image-card">
            ${responsiveImage("library-commons.jpg", { alt: "Pannonian University library commons with students studying and meeting", height: 940 })}
            <figcaption>The library commons supports advising, research help, and student collaboration throughout the week.</figcaption>
          </figure>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Campus services</p>
            <h2>Everyday services students actually use.</h2>
          </div>
          <div class="service-grid">
            <article><span>Housing desk</span><h3>Arrival and residence support</h3><p>Guidance for dormitory options, private rentals, roommate matching, and first-week arrival logistics.</p></article>
            <article><span>Wellbeing</span><h3>Health and counseling access</h3><p>Referral pathways, peer wellbeing workshops, sports programs, and nutrition support.</p></article>
            <article><span>Careers</span><h3>Internships and city partners</h3><p>CV clinics, partner briefings, municipal placements, and employer project studios.</p></article>
            <article><span>International</span><h3>Language and orientation</h3><p>Serbian language support, documentation help, and student mentors for international arrivals.</p></article>
          </div>
        </div>
      </section>
    `
  },
  {
    id: "contact",
    href: "/contact/",
    output: "contact/index.html",
    title: "Contact | Pannonian University",
    description: "Contact information, official email addresses, and visitor details for Pannonian University.",
    body: `
      <section class="page-masthead contact-masthead">
        <div class="container">
          <p class="eyebrow">Contact</p>
          <h1>Reach the right office at Pannonian University.</h1>
          <p>Official email addresses use the university domain <strong>${site.domain}</strong>.</p>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container contact-grid">
          <div class="contact-list" aria-label="University contact addresses">
            <a class="contact-row" href="mailto:${site.emails.general}">
              <span>General inquiries</span>
              <strong>${site.emails.general}</strong>
            </a>
            <a class="contact-row" href="mailto:${site.emails.admissions}">
              <span>Admissions</span>
              <strong>${site.emails.admissions}</strong>
            </a>
            <a class="contact-row" href="mailto:${site.emails.registrar}">
              <span>Registrar</span>
              <strong>${site.emails.registrar}</strong>
            </a>
            <a class="contact-row" href="mailto:${site.emails.research}">
              <span>Research partnerships</span>
              <strong>${site.emails.research}</strong>
            </a>
          </div>
          <form class="contact-form" action="mailto:${site.emails.general}" method="post" enctype="text/plain">
            <label>
              <span>Name</span>
              <input name="name" autocomplete="name" required>
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" autocomplete="email" required>
            </label>
            <label>
              <span>Message</span>
              <textarea name="message" rows="5" required></textarea>
            </label>
            <button class="button button-primary" type="submit" data-ripple>Send message</button>
          </form>
        </div>
      </section>

      <section class="section map-band" data-reveal>
        <div class="container split-grid">
          <div>
            <p class="eyebrow">Visit</p>
            <h2>${site.location}</h2>
            <p>${site.address}</p>
          </div>
          <div class="map-placeholder" aria-label="Stylized map of Pannonian University campus">
            <span class="map-line line-a"></span>
            <span class="map-line line-b"></span>
            <span class="map-block block-a"></span>
            <span class="map-block block-b"></span>
            <span class="map-dot"></span>
          </div>
        </div>
      </section>

      <section class="section" data-reveal>
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Directory</p>
            <h2>Common offices and expected response windows.</h2>
          </div>
          <div class="directory-grid">
            <article><span>Admissions Office</span><strong><a href="mailto:${site.emails.admissions}">${site.emails.admissions}</a></strong><p>Application status, entry requirements, scholarships, and visit scheduling. Usually replies within two working days.</p></article>
            <article><span>Registrar</span><strong><a href="mailto:${site.emails.registrar}">${site.emails.registrar}</a></strong><p>Enrollment records, transcripts, certificates, student status letters, and timetable questions.</p></article>
            <article><span>Research Partnerships</span><strong><a href="mailto:${site.emails.research}">${site.emails.research}</a></strong><p>Project briefs, field station access, data-sharing questions, and partner proposals.</p></article>
            <article><span>Visitor Desk</span><strong><a href="mailto:${site.emails.general}">${site.emails.general}</a></strong><p>Campus visits, public events, media routing, delivery information, and accessibility needs.</p></article>
            <article><span>Faculty of Society</span><strong><a href="mailto:chen.weihong@${site.domain}">chen.weihong@${site.domain}</a></strong><p>Dean Chen Wei Hong's office supports society faculty advising, ethnographic methods, and heritage-fieldwork inquiries.</p></article>
            <article><span>School of Economics</span><strong><a href="mailto:huang.yufei@${site.domain}">huang.yufei@${site.domain}</a></strong><p>Dean Huang Yu Fei's office supports economics advising, applied finance studios, and industry partnership questions.</p></article>
          </div>
        </div>
      </section>

      <section class="section split-band" data-reveal>
        <div class="container split-grid">
          <div>
            <p class="eyebrow">Visit planning</p>
            <h2>Plan a campus visit with the right office before you arrive.</h2>
            <p>Most visitor meetings are scheduled Monday to Friday. Admissions tours, research meetings, and partner visits use separate appointment windows so staff can prepare relevant materials.</p>
          </div>
          <div class="hours-panel">
            <div><span>Admissions tours</span><strong>Tue and Thu, 10:00-15:00</strong></div>
            <div><span>Registrar desk</span><strong>Mon-Fri, 09:00-13:00</strong></div>
            <div><span>Research visits</span><strong>By appointment</strong></div>
          </div>
        </div>
      </section>
    `
  }
];

export const pages = [...corePages, ...generatedPages];

export const searchIndex = pages.map((page) => {
  return {
    title: page.title.replace(" | Pannonian University", ""),
    href: page.href,
    section: page.searchSection || page.id,
    description: page.description,
    text: [page.title, page.description, page.searchKeywords || "", stripTags(page.body)].join(" ")
  };
});
