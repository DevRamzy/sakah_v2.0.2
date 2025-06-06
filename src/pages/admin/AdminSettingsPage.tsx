import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface SiteSetting {
  key: string;
  value: any;
  updated_by: string | null;
  updated_at: string;
}

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, any>>({
    general: {
      site_name: '',
      site_description: '',
      contact_email: ''
    },
    homepage: {
      featured_listings_count: 6,
      show_categories: true,
      show_recent_listings: true
    },
    seo: {
      meta_title: '',
      meta_description: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      // Convert array of settings to object
      const settingsObj: Record<string, any> = {};
      data?.forEach((setting: SiteSetting) => {
        settingsObj[setting.key] = setting.value;
      });

      // Merge with default settings
      setSettings(prev => ({
        general: {
          ...prev.general,
          ...settingsObj.general
        },
        homepage: {
          ...prev.homepage,
          ...settingsObj.homepage
        },
        seo: {
          ...prev.seo,
          ...settingsObj.seo
        }
      }));
    } catch (error) {
      console.error('Exception fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleToggleChange = (section: string, field: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }));
  };

  const handleNumberChange = (section: string, field: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      handleInputChange(section, field, numValue);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccessMessage('');
    
    try {
      // Update each section
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            key,
            value,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error(`Error saving ${key} settings:`, error);
          alert(`Failed to save ${key} settings: ${error.message}`);
          setSaving(false);
          return;
        }
      }

      // Log admin activity
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: user?.id,
          action: 'update_settings',
          entity_type: 'settings',
          entity_id: user?.id, // Using admin ID as entity ID for settings updates
          details: { sections: Object.keys(settings) }
        });

      setSuccessMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Exception saving settings:', error);
      alert('An unexpected error occurred while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  // Format date is not currently used but may be needed for future features
  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleString();
  // };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Site Settings</h1>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 text-green-800 px-4 py-2 rounded-md"
          >
            {successMessage}
          </motion.div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'general'
                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('homepage')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'homepage'
                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Homepage
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'seo'
                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                SEO
              </button>
            </nav>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="site_name"
                    value={settings.general.site_name}
                    onChange={(e) => handleInputChange('general', 'site_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="site_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Site Description
                  </label>
                  <textarea
                    id="site_description"
                    value={settings.general.site_description}
                    onChange={(e) => handleInputChange('general', 'site_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    value={settings.general.contact_email}
                    onChange={(e) => handleInputChange('general', 'contact_email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Homepage Settings */}
            {activeTab === 'homepage' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="featured_listings_count" className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Listings Count
                  </label>
                  <input
                    type="number"
                    id="featured_listings_count"
                    value={settings.homepage.featured_listings_count}
                    onChange={(e) => handleNumberChange('homepage', 'featured_listings_count', e.target.value)}
                    min={0}
                    max={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Number of featured listings to display on the homepage (0-12)
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_categories"
                    checked={settings.homepage.show_categories}
                    onChange={() => handleToggleChange('homepage', 'show_categories')}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show_categories" className="ml-2 block text-sm text-gray-700">
                    Show Categories Section
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_recent_listings"
                    checked={settings.homepage.show_recent_listings}
                    onChange={() => handleToggleChange('homepage', 'show_recent_listings')}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show_recent_listings" className="ml-2 block text-sm text-gray-700">
                    Show Recent Listings Section
                  </label>
                </div>
              </motion.div>
            )}

            {/* SEO Settings */}
            {activeTab === 'seo' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                    Default Meta Title
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    value={settings.seo.meta_title}
                    onChange={(e) => handleInputChange('seo', 'meta_title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Default Meta Description
                  </label>
                  <textarea
                    id="meta_description"
                    value={settings.seo.meta_description}
                    onChange={(e) => handleInputChange('seo', 'meta_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Recommended length: 150-160 characters
                  </p>
                </div>
              </motion.div>
            )}

            {/* Save button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">save</span>
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
