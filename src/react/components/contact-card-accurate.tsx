import React from 'react';

const ContactCard = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Ready to start? Contact us today!
      </h2>
      
      {/* Dawn's Contact Card with accurately represented licensing */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Header with logo */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mr-4">
              Photo
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Dawn Zurick</h3>
            </div>
          </div>
          <img src="/api/placeholder/100/40" alt="Vylla Logo" />
        </div>
        
        {/* Professional Title Group */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-xl font-semibold text-gray-700 tracking-wide mb-1">Managing Broker (IL) / Broker (WI)</p>
          <p className="text-lg font-medium text-gray-600 tracking-wide">Team Lead / Regional Administrator</p>
        </div>
        
        {/* Credentials Group */}
        <div className="bg-purple-50 p-3 rounded-lg mb-4">
          <p className="text-sm font-medium mb-1">
            <span className="font-semibold">Certifications:</span> 
            <span className="text-purple-700 font-semibold"> e-PRO, GRI, SFR, SRS, CNE, BPO & CRB</span>
          </p>
          <p className="text-sm">
            <span className="font-semibold">Licensed in:</span> IL/WI
          </p>
        </div>
        
        {/* Contact Methods Group */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Phone Numbers */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Phone</h4>
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-xs font-bold text-gray-500 w-6">C</span>
                <span className="text-gray-800">847-287-1148</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-bold text-gray-500 w-6">O</span>
                <span className="text-gray-800">773-550-2729</span>
              </div>
            </div>
          </div>
          
          {/* Digital Contact */}
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Online</h4>
            <div className="space-y-1">
              <a href="mailto:dawn.zurick@vylla.com" className="block text-blue-600 hover:underline">
                dawn.zurick@vylla.com
              </a>
              <a href="https://vylla.com" className="block text-blue-600 hover:underline">
                Vylla Home
              </a>
            </div>
          </div>
        </div>
        
        {/* Address Group */}
        <div className="bg-yellow-50 p-3 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Office Location</h4>
          <p className="text-gray-700">1827 Walden Office Square, Suite 325</p>
          <p className="text-gray-700">Schaumburg, IL 60173</p>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;