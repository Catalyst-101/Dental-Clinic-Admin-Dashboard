import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center min-h-[70vh]">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-9xl font-black text-primary drop-shadow-sm select-none">
          404
        </h1>
        
        <h2 className="text-headline-sm font-bold text-on-surface">
          Page Not Found
        </h2>
        
        <p className="text-body-lg text-on-surface-variant leading-relaxed">
          The admin page you're looking for doesn't exist, has been moved, or you don't have permission to view it.
        </p>
        
        <div className="pt-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mx-auto shadow-sm"
          >
            <span className="material-symbols-outlined">dashboard</span>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
