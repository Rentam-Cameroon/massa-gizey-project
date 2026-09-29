import React from 'react';

export const Breadcrumbs = ({ items = [], onNavigate }) => {
  return (
    <div className="container">
      <nav className="breadcrumbs-bar" aria-label="Breadcrumb">
        <button 
          className="breadcrumbs-link" 
          onClick={() => onNavigate('home')}
        >
          Home
        </button>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <span className="breadcrumbs-separator">/</span>
              {isLast || !item.screen ? (
                <span className="breadcrumbs-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  className="breadcrumbs-link"
                  onClick={() => onNavigate(item.screen, item.params)}
                >
                  {item.label}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};
