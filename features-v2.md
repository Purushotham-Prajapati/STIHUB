# STIHUB Project Features (v2.0)

Based on the analysis of the updated project structure and source code, STIHUB v2.0 introduces a massive transformation from a static site to a dynamic, full-stack web application. The new architecture features a modern backend for data persistence, an authenticated admin portal, and seamless content management.

## 1. Full-Stack Architecture & Core Technologies
* **Frontend Framework:** Continues with **React 19** and **Vite** for optimized and fast web development.
* **Backend API:** Newly implemented **Node.js** with **Express.js** providing robust, RESTful endpoints.
* **Database:** Integration with **MongoDB** via **Mongoose** for reliable data modeling and persistence (replacing the static `data.js` approach).
* **Styling & Animations:** Uses **Tailwind CSS (v4)** combined with **Framer Motion** and custom scroll observer patterns for smooth entry animations.
* **Routing:** Enhanced **React Router DOM v7** setup that includes public routes, a secret admin portal (`/sti-secure-portal`), and route guarding for authenticated users.

## 2. Dynamic Content Management (Admin Portal)
* **Secure Authentication:** Implementation of a robust `AuthContext` coupled with JWT (JSON Web Tokens) stored in HttpOnly cookies to securely manage admin sessions. Includes Bcrypt for password hashing.
* **Admin Dashboard:** A dedicated, protected UI (`/sti-admin-dashboard`) where administrators can manage dynamic content without touching the code.
* **Drag and Drop Functionality:** Integration of `@dnd-kit/core` and `@dnd-kit/sortable` allowing intuitive drag-and-drop rearrangement of gallery images, sections, and slider items.
* **Modular Content APIs:** Specific backend avenues to manage:
  * **GalleryItems:** Dynamic photo uploads and metadata.
  * **Sections:** Configurable landing page sections.
  * **SliderItems:** Dynamic hero slider components.

## 3. Advanced Media & Upload Management
* **Cloud Storage Integration:** Utilizes **ImageKit (@imagekit/nodejs)** for cloud-based storage, optimized delivery, and automatic transformation of user-uploaded images.
* **Multipart Form Handling:** Employs **Multer** in the backend to manage fast, reliable local buffering of image uploads before cloud sync.
* **Image Optimization:** Persistent use of compressed formats (managed by ImageKit) for rapid frontend render speeds.

## 4. Security & API Protection
* **Helmet.js:** Secures Express applications by setting various HTTP headers.
* **CORS Management:** Strict Cross-Origin Resource Sharing rules differentiating local development and Vercel production environments.
* **Rate Limiting:** Protects the API endpoints against bruteforce and DDoS attacks using `express-rate-limit`.

## 5. UI/UX & Interactivity
* **Components:** A sophisticated set of custom components including:
  * **GalleryManager**, **SectionManager**, **SliderManager** for the admin pane.
  * Persistent global `<Loading />` screen, `<ScrollToTop />` FAB, and custom scrollbar styles.
* **Responsive Layout:** Adaptive header, footer, and modular page layouts specifically crafted for all device sizes.

## 6. Performance & SEO
* **Search Engine Optimization (SEO):** Detailed `<SEO />` management with **react-helmet-async** generating dynamic meta tags, descriptions, and advanced JSON-LD structured schema for the STIHUB organization context.
* **State Management:** Uses React Context, hooks (`useState`, `useEffect`), and Axios interceptors for centralized API communications and error handling.
