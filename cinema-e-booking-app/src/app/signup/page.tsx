'use client';
import AuthLayout from '@/components/AuthLayout';
import InputField from '@/components/InputField';
import Navbar from '@/components/Navbar';

export default function SignupPage() {
  return (
    <>
      <Navbar />
      <AuthLayout title="Sign Up">
        <form>
          <InputField label="First Name" id="firstname" name="firstname" type="text" required />
          <InputField label="Last Name" id="lastname" name="lastname" type="text" required />
          <InputField label="Email" id="email" name="email" type="email" required />
          <InputField label="Phone Number" id="phonenumber" type="tel" required />
          <InputField label="Password" id="password" name="password" type="password" required />
          <InputField label="Confirm Password" id="confirmpassword" type="password" required />

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="promotions"
              name="promotions"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="promotions" className="text-white-700 text-sm">
              I want to receive promotions and updates.
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg 
                       hover:bg-blue-600 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 font-medium transition-colors"
          >
            Create Account
          </button>
        </form>
      </AuthLayout>
    </>
  );
}