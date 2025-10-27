'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileNavigation from '@/components/ProfileNavigation';
import InputField from '@/components/InputField';
import Navbar from '@/components/Navbar';

export default function ChangePasswordPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    alert('Password changed successfully!');
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1727] px-4 py-8">
      
      <h1 className="text-3xl font-bold mb-6 text-center text-[#373572] dark:text-white">
        Change Password
      </h1>

      <div className="max-w-2xl mx-auto">
        <ProfileNavigation width='450px' />

        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 p-8 rounded-xl shadow-lg max-w-md mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <InputField
            label="Current Password"
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            onChange={handleChange}
            value={formData.currentPassword}
          />

          <InputField
            label="New Password"
            id="newPassword"
            name="newPassword"
            type="password"
            required
            onChange={handleChange}
            value={formData.newPassword}
          />

          <InputField
            label="Confirm New Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            onChange={handleChange}
            value={formData.confirmPassword}
          />

          <div className="flex items-center justify-center mt-6">
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}