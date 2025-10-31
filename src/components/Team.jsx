const Team = () => (
  <section className="my-16">
    <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-blue-600 mb-4">Principal Investigator</h3>
      <p className="text-gray-700"><strong>Dr. Alapati Mallika</strong>, Professor, Dept. of Civil Engineering, VNRVJIET</p>
      <h3 className="text-xl font-bold text-blue-600 mt-6 mb-4">Co-Investigators</h3>
      <ul className="space-y-2 text-gray-700">
        <li><strong>Dr. Padmavathi Papolu</strong>, Assistant Professor, Chemistry, VNRVJIET</li>
        <li><strong>Dr. K Anuradha</strong>, Professor of EEE, VNRVJIET</li>
        <li><strong>Dr. Myneni Madhu Bala</strong>, Professor of CSE, VNRVJIET</li>
        {/* ... add all other team members here ... */}
         <li><strong>Mr. D. Mahesh</strong>, DRNVJIRD (Collaborative Institution)</li>
         <li><strong>Ms. P. Keerthi</strong>, DRNVJIRD (Collaborative Institution)</li>
      </ul>
    </div>
  </section>
);

export default Team;