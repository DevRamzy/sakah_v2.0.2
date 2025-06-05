import React from 'react';
import { Link } from 'react-router-dom';

const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
  </svg>
);

const TwitterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.424.728-.666 1.581-.666 2.477 0 1.92.976 3.616 2.468 4.605-.9-.028-1.747-.276-2.486-.688v.065c0 2.68 1.907 4.913 4.436 5.424-.464.126-.95.194-1.448.194-.356 0-.702-.034-1.036-.097.703 2.198 2.736 3.799 5.146 3.844-1.893 1.482-4.272 2.364-6.869 2.364-.447 0-.888-.026-1.321-.077 2.447 1.569 5.358 2.484 8.501 2.484 10.2 0 15.776-8.455 15.776-15.776l-.008-.718c1.081-.779 2.019-1.753 2.758-2.86z"/>
  </svg>
);

const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.225-.148-4.771-1.664-4.919-4.919-.058-1.265-.069-1.645-.069-4.849 0-3.204.012-3.583.069-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.233.194-6.404 2.361-6.598 6.598-.058 1.281-.072 1.689-.072 4.948s.014 3.667.072 4.947c.194 4.233 2.361 6.404 6.598 6.598 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c4.233-.194 6.404-2.361 6.598-6.598.058-1.281.072-1.689.072-4.947s-.014-3.667-.072-4.947c-.194-4.233-2.361-6.404-6.598-6.598-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const Footer: React.FC = () => {
  const socialIconClasses = "h-6 w-6 text-neutral-400 hover:text-yellow-400 transition-colors";

  return (
    <footer className="bg-black text-neutral-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img 
                src="/Sakah logo new.png" 
                alt="Sakah Logo" 
                className="h-16 w-auto" 
              />
            </Link>
            <p className="text-sm text-neutral-400 mb-4">
              Discover and connect with local businesses. Your go-to platform for business discovery and growth.
            </p>
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon className={socialIconClasses} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><TwitterIcon className={socialIconClasses} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon className={socialIconClasses} /></a>
            </div>
          </div>

          {/* Link Sections */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-200 tracking-wider uppercase mb-4">For Businesses</h3>
            <ul className="space-y-3">
              <li><Link to="/list-your-business" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">List Your Business</Link></li>
              <li><Link to="/pricing" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">Pricing</Link></li>
              <li><Link to="/business-resources" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">Business Resources</Link></li>
              <li><Link to="/success-stories" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-200 tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/help-center" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">Help Center</Link></li>
              <li><Link to="/contact-us" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/faqs" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">FAQs</Link></li>
              <li><Link to="/report-issue" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">Report an Issue</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-200 tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/terms-of-service" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy-policy" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/business-guidelines" className="text-sm text-neutral-400 hover:text-yellow-400 transition-colors">Business Guidelines</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-neutral-800 pt-8 text-center">
          <p className="text-sm text-neutral-400">&copy; {new Date().getFullYear()} Sakah. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
