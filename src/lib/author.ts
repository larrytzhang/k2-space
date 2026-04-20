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
  email: "larryzhang225@gmail.com",
  linkedin: "https://www.linkedin.com/in/larryzhang225/",
  github: "https://github.com/larryzhang225/k2-procedure-ai",
  projectName: "AI Procedure Generator",
  projectTagline:
    "Turn paper aerospace procedures into structured JSON in seconds.",
} as const;
