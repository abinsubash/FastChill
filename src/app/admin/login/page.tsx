"use client"
import { useState } from 'react';
import { Eye, EyeOff, ShoppingBag, Snowflake } from 'lucide-react';

export default function FastChillLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = () => {
    console.log('Login attempt:', { email, password, rememberMe });
    // Add your login logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-10 text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="relative">
                <ShoppingBag className="w-12 h-12 text-white" strokeWidth={2} />
                <Snowflake className="w-6 h-6 text-blue-200 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Fast-Chill</h1>
            <p className="text-blue-100 text-sm">Welcome back! Please login to your account</p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-10">
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-900 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-900 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-900 hover:text-blue-700 font-semibold transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3.5 rounded-xl font-semibold text-base hover:shadow-lg hover:shadow-blue-900/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </button>


            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-white text-xs mt-6 opacity-75">
          © 2025 Fast-Chill. All rights reserved.
        </p>
      </div>
    </div>
  );
}