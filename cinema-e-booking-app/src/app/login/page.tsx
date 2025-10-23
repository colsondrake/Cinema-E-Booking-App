'use client';
import AuthLayout from '@/components/AuthLayout';
import InputField from '@/components/InputField';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <AuthLayout title="Login">
        <form>
          <InputField 
            label="Email" 
            id="email" 
            name="email" 
            type="email" 
            required 
            placeholder="Enter your email"
          />

          <InputField 
            label="Password" 
            id="password" 
            name="password" 
            type="password" 
            required 
            placeholder="Enter your password"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg 
                     hover:bg-blue-600 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 font-medium transition-colors"
          >
            Login In
          </button>
          <p className="mt-6 text-center text-sm text-[#373572] dark:text-gray-300">
            Don&apos;t have an account? <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
          </p>
          <p className="mt-6 text-center text-sm text-[#373572] dark:text-gray-300">Forget 
            <a href="/forgot-password" className="text-blue-600 hover:underline"> Password?</a></p>
        </form>
      </AuthLayout>
    </>
  );
}
