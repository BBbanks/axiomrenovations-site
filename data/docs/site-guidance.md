PROJECT CONTEXT

This website belongs to Axiom Renovations, a residential remodeling company based in Fort Myers, Florida.

The owner has approximately 20 years of hands-on trade experience and more than 10 years of self-employment experience. The company is transitioning from a highly capable solo remodeling operation into a structured contracting business.

The website should not feel like a generic contractor template. It should reflect craftsmanship, trust, professionalism, thoughtful design, and genuine care for the client experience.

CORE BUSINESS PHILOSOPHY

The purpose of the company is to create genuine value for homeowners and help realize their vision for their home.

Profit is viewed as the natural result of creating value, not the primary motivation.

The company culture values:

- Craftsmanship
- Continuous improvement
- Simplicity
- Honesty
- Respect
- Enjoyment of the work
- Positive jobsite culture
- Thoughtful design
- Long-term relationships

Every project is approached as an opportunity to refine the craft and deliver meaningful results.

WEBSITE GOALS

The website should:

- Build trust
- Demonstrate craftsmanship
- Show real projects
- Educate homeowners
- Reflect professionalism
- Generate quality leads
- Distinguish Axiom Renovations from production-oriented contractors

The website should feel:

- Clean
- Calm
- Thoughtful
- Professional
- Timeless
- High-end without feeling luxury-branded
- Personal without feeling amateur

DESIGN PRINCIPLES

Favor:

- White space
- Clear hierarchy
- Strong typography
- Thoughtful photography
- Simple navigation
- Fast loading
- Mobile-first usability

Avoid:

- Flashy effects
- Aggressive marketing language
- Countdown timers
- Popups
- Fake urgency
- Stock imagery
- Generic contractor clichés

CONTENT PRINCIPLES

The site should communicate expertise through:

- Process
- Design judgment
- Craftsmanship
- Real project examples
- Material knowledge
- Problem solving

Not through hype.

The writing should sound experienced, calm, confident, and professional.

Avoid exaggerated claims.

PROJECTS PAGE ARCHITECTURE

The projects page is driven by a JSON manifest.

Each project section contains:

- label
- title
- location
- description
- scope
- result
- images

Images are evolving from simple string paths into structured objects:

{
  "src": "images/example.jpg",
  "caption": "Explanation of the project, process, material selection, design decision, or construction detail shown in the image."
}

The long-term goal is:

- Project-level descriptions explain the overall category or project.
- Image-level captions explain the specific image currently selected.

Mobile experience is important.

Favor captions beneath the main image rather than hover-only interactions.

TECHNICAL CONTEXT

Hosting:
- GitHub Pages

Repository:
- axiomrenovations-site

Current stack:
- Static HTML
- CSS
- Vanilla JavaScript
- JSON-driven project content

No frameworks should be introduced unless there is a compelling reason.

Favor simplicity and maintainability.

SITE DEVELOPMENT PHILOSOPHY

Prefer incremental improvements.

Do not rewrite working systems unnecessarily.

Preserve existing functionality whenever possible.

When making recommendations:

1. Explain the reasoning.
2. Identify potential tradeoffs.
3. Prefer simple solutions.
4. Consider mobile behavior.
5. Consider maintainability for a small business owner.

The site is intended to become the company's primary web presence and eventually replace Carrd completely.
