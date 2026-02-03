
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import GalleryPage from './pages/GalleryPage';

// UI
import ScrollToTop from './components/ui/ScrollToTop';
import Loading from './components/ui/Loading';
import SEO from './components/seo/SEO';

// Wrapper to handle scroll to top on route change
const PageWrapper = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Add custom scrollbar styles and global animations
    const style = document.createElement('style');
    style.textContent = `
      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f5f9;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #2563eb, #7c3aed);
      }
      
      /* Smooth scroll behavior */
      html {
        scroll-behavior: smooth;
      }
      
      /* Animation keyframes */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      /* Apply animations to cards */
      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      .animate-slideInLeft {
        animation: slideInLeft 0.6s ease-out forwards;
      }
      
      .animate-slideInRight {
        animation: slideInRight 0.6s ease-out forwards;
      }
      
      /* Intersection Observer animations */
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
      }
      
      .animate-on-scroll.animated {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const checkForElements = setInterval(() => {
      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      if (animatedElements.length > 0) {
        animatedElements.forEach((el) => observer.observe(el));
        clearInterval(checkForElements);
      }
    }, 100);

    return () => {
      clearInterval(checkForElements);
      // Clean up observer if needed
    };
  }, [isLoading]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="bg-white font-sans text-gray-700 overflow-x-hidden">
      <SEO />
      <Header />
      <main>
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<GalleryPage />} />
          </Routes>
        </PageWrapper>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;