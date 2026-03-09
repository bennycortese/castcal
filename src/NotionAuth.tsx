import React, { useEffect } from 'react';
import { NavBar } from './Navbar';
import { Footer } from './Footer';

// TODO: Replace with your Notion OAuth client_id and update redirect_uri for production
const NOTION_CLIENT_ID = process.env.REACT_APP_NOTION_CLIENT_ID || 'REPLACE_WITH_NOTION_CLIENT_ID';
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000/redirect';

const NotionAuth: React.FC = () => {
  useEffect(() => {
    const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = notionAuthUrl;
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <section className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">Redirecting to Notion...</p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default NotionAuth;
