'use client';

import { useState } from 'react';
import ThumbnailForm from '@/components/ThumbnailForm';
import BulkUploadForm from '@/components/BulkUploadForm';
import WaitlistForm from '@/components/WaitlistForm';

export default function Home() {
  const [activeTab, setActiveTab] = useState('single');

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Logo Section */}
          <div className="text-center mb-4">
            <div className="logo-container">
              <img 
                src="/images/podflare-logo.png"
                alt="Podflare Logo"
                className="img-fluid"
                style={{ maxWidth: '300px' }}
              />
            </div>
          </div>

          {/* Main Tool Card */}
          <div className="card mb-5">
            <div className="card-body p-4">
              {/* Header Section */}
              <div className="text-center mb-4">
                <div className="badge bg-purple-gradient text-white px-4 py-2 mb-3">
                  <i className="bi bi-youtube text-danger"></i>
                  YouTube Tools
                </div>
                <h1 className="h2 fw-bold mb-3">YouTube Thumbnail Downloader</h1>
                <p className="lead mb-4">Download high-quality thumbnails from YouTube videos</p>
              </div>

              {/* Tabs */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'single' ? 'active' : ''}`}
                    onClick={() => setActiveTab('single')}
                  >
                    Single URL
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'bulk' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bulk')}
                  >
                    Bulk Upload
                  </button>
                </li>
              </ul>

              {/* Forms */}
              <div className="tab-content">
                {activeTab === 'single' ? (
                  <ThumbnailForm />
                ) : (
                  <BulkUploadForm />
                )}
              </div>
            </div>
          </div>

          {/* Waitlist Section */}
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
} 