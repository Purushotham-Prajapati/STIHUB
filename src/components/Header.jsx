import dstLogo from '../assets/images/dst.jpg';
import vnrLogo from '../assets/images/vnr1.jpg';
import "tailwindcss";
const Header = () => {
  return (
    <header className="bg-white shadow-lg p-4 sticky top-0 z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
        
        {/* Logo & Title */}
        <div className="flex items-center space-x-4">
          <img src={dstLogo} alt="DST Logo" className="h-16 w-16 object-contain" />
          <div>
            <div className="text-2xl font-bold text-gray-900 leading-none">STI HUB</div>
            <div className="hidden md:block text-xs text-gray-600 mt-1 max-w-xs leading-snug">
              SEED, DST – VNR Vignana Jyothi Institute of Engineering and Technology
            </div>
          </div>
          <img src={vnrLogo} alt="VNRVJIET Logo" className="h-16 w-auto object-contain ml-4" />
        </div>

        {/* Navigation */}
        <nav aria-label="Primary navigation" className="flex space-x-6 text-gray-600 text-sm font-medium">
          <a href="#home" className="hover:text-blue-600 transition-colors">Home</a>
          <a href="#facilities" className="hover:text-blue-600 transition-colors">Facilities</a>
          <a href="#events" className="hover:text-blue-600 transition-colors">Events</a>
          <a href="#publications" className="hover:text-blue-600 transition-colors">Publications</a>
          <a href="#shgs" className="hover:text-blue-600 transition-colors">SHGs</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;