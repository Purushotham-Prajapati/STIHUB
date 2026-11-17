
import React from 'react';

const Loading = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50">
        <div className="text-center text-white">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
            </div>
            <div className="flex items-center justify-center">
                <img src="favicon.png" alt=""className='h-20' />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">STI HUB</h2>
            <p className="text-blue-200">Loading...</p>
        </div>
    </div>
);

export default Loading;
