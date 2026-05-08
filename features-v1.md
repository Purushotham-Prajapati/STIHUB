# STIHUB Project Features (v1.0)

Based on the analysis of the project structure and source code, the following features and technical capabilities have been implemented in the STIHUB web application.

## 1. Core Technologies & Architecture
* **Frontend Framework:** Built with **React 19** and **Vite** for fast, modern web development.
* **Styling & Animations:** Utilizes **Tailwind CSS (v4)** for atomic styling and responsive design, paired with **Framer Motion** for complex component animations.
* **Routing:** Client-side navigation powered by **React Router DOM** with distinct routes for the Home (`/`) and Gallery (`/gallery`) pages.
* **Data Management:** Centralized static data configuration (`src/constants/data.js`) making it easy to update text, team members, images, stats, and news without touching UI components.

## 2. UI/UX & Interactivity
* **Global Loading Screen:** A dedicated `<Loading />` component ensures a smooth initial experience while assets render.
* **Scroll Animations:** Custom programmatic scroll tracking using `IntersectionObserver` mixed with CSS keyframes (Fade-In-Up, Slide-In) for elements coming into the viewport.
* **Scroll Management:** 
  * Custom styled gradient scrollbar.
  * Auto-scroll-to-top handler upon route changes.
  * Dedicated `<ScrollToTop />` floating action button.
* **Responsive Layout:** A modular `<Header />` and `<Footer />` that adapt to mobile, tablet, and desktop viewports.

## 3. Performance & SEO
* **Search Engine Optimization (SEO):** Integrated `<SEO />` component using `react-helmet-async` for optimized meta tags, titles, descriptions, and JSON-LD schema markup for organizations.
* **Asset Optimization:** Extensive use of modern, highly-compressed `.webp` image formats for fast loading speeds.

## 4. Key Functional Sections
* **Hero Section:** A prominent landing area highlighting the DST "Vigyan Dhara" funding, location context (Kowdipally Block), and partnered institutions (VNRVJIET).
* **Project Statistics:** A visually appealing section outlining impact metrics (e.g., ₹86.8 Lakhs Cost, 3 Years Duration, 15+ Communities, 10+ Tech Interventions).
* **Community Engagement:** Dedicated cards highlighting specific community outcomes: 
  * Common Facility Centre
  * Awareness Programs
  * Skill Based Training
  * Technology Interventions
* **Livelihood Capitals:** Focuses on rural sustainability initiatives like Backyard Poultry, Feed and Fodder processing, Banjara Art empowerment, and Traditional Knowledge (TKS) Seed Banks.
* **Team Showcase:** Organized display of Co-Investigators and Collaborative Institution project staff.
* **News & Updates Board:** Dynamic linking to important PDF resources, recruitment notifications (Adv No. DST-STI H/01), and project outreach events.
* **Comprehensive Image Gallery:** A standalone page and home-page preview (`<Gallery />`) allowing visual exploration of field work, team activities, and events.
* **Contact Area:** Integrated contact information to reach out to the principal investigators via the official STIHUB email.
