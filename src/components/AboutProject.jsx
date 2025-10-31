import projectAreaImg from '../assets/images/parea.jpg';

const AboutProject = () => (
  <section className="my-10 max-w-6xl mx-auto px-4">
    <h2 className="text-3xl font-extrabold text-red-900 text-center mb-12">About Project</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-10 md:p-14 rounded-3xl shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-extrabold text-red-900 mb-4">Project Title</h3>
          <p className="text-gray-800 leading-relaxed mb-4">
            Science Technology and Innovation Hub for Development of Scheduled Tribe Community in tribal areas of Kowdipally Block, Medak District, Telangana State
          </p>
          <p className="text-gray-600 font-mono mb-6 tracking-wide text-sm">
            [DST/SEED/TSP/STI/2023/956 (G)]
          </p>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-red-900 mb-4">Project Cost &amp; Duration</h3>
          <p className="text-gray-800 mb-2"><strong>Cost:</strong> Rs. 86.80954 Lakhs</p>
          <p className="text-gray-800"><strong>Duration:</strong> 3 Years</p>
        </div>
      </div>
      <div className="bg-white p-10 md:p-14 rounded-3xl shadow-xl flex flex-col items-center justify-center">
        <h3 className="text-2xl font-extrabold text-red-900 mb-6">Project Area</h3>
        <img src={projectAreaImg} alt="Image of the project area" className="w-full h-auto object-cover rounded-2xl shadow-md" loading="lazy" />
      </div>
    </div>
  </section>
);

export default AboutProject;