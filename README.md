# StudentHub
![Status](https://img.shields.io/badge/Status-Technical_Freeze-orange)



## Project Overview
StudentHub solves one painful problem: **students in tier-2/3 colleges miss out on scholarships, internships, and hackathons** because information is scattered across slow, unverified portals and buried inside lengthy PDFs. 

The platform centralizes verified opportunities, uses AI to filter them by a student’s profile, and lets anyone upload a PDF to instantly check eligibility all secured through Google Firebase.



## Technical Status & Blocker
During final integration, the project encountered a model migration issue (Gemini v1beta → stable), resulting in `404` errors on the PDF-parsing endpoint. 

Instead of shipping a fragile pipeline, I have decided to **freeze the prototype** at this stage. This allows for a proper refactor of the AI tier later—ensuring a stable model with professional-grade fallbacks and error handling.


## Development & Methodology
This repository represents a **Rapid Prototyping Phase** where the codebase was generated and iterated using generative AI as the primary development engine. My role involved directing the architecture, managing the logic flow between AI and the IDE, and performing high-level debugging to align the output with the project vision.

### Future Roadmap: Custom Implementation
This prototype serves as the "Proof of Concept." To ensure deep technical mastery and complete control over the system's performance, the next iteration of StudentHub will be a **Custom Implementation**. 

I am moving toward a new repository where the **Own Contribution** of logic, manual code authorship, and architecture will be built from scratch. This transition marks the shift from AI-driven discovery to a self-authored, production-ready solution.


*Developed by Sangapu Hasini· Built for the Google Solution Challenge 2026*
