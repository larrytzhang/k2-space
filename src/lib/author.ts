/**
 * Author/contact metadata surfaced in the footer, About modal, and README.
 *
 * All values are stored in one place so that updating a link does not
 * require grepping through components. These are safe to expose publicly;
 * no secrets live here.
 */

export const AUTHOR = {
  name: "Larry Zhang",
  school: "Harvard",
  email: "larry_zhang@college.harvard.edu",
  linkedin: "https://www.linkedin.com/in/larry-zhang-697636370/",
  github: "https://github.com/larrytzhang/k2-space",
  projectName: "AI Procedure Generator",
  projectTagline:
    "Turn paper aerospace procedures into structured JSON in seconds.",
} as const;
