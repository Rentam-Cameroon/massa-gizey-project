'use client';

import React from 'react';
import Link from 'next/link';

export const Breadcrumbs = ({ items = [] }) => {
  return (
    <div className="container">
      <nav className="breadcrumbs-bar" aria-label="Breadcrumb">
        <Link href="/" className="breadcrumbs-link">
          Home
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <span className="breadcrumbs-separator">/</span>
              {isLast || !item.href ? (
                <span className="breadcrumbs-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="breadcrumbs-link">
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};
