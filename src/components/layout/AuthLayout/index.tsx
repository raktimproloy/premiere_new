'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from 'next/link';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useAuth } from '@/components/common/AuthContext';
// import Logo from "/images/logo.png"
const Logo = "/images/logo.png"
const SideImage = "/images/signup.png"
const GoogleIcon = 'images/icons/google.svg'
const FacebookIcon = 'images/icons/facebook.svg'
const AppleIcon = 'images/icons/apple.svg'

interface AuthLayoutProps {
    headingName: string;
    title: string;
    description?: string;
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ headingName, title, description, children }) => {
  const { loginWithGoogle } = useAuth();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [processingAuth, setProcessingAuth] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  // Split full name into first and last name
  const splitName = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) {
      return { firstName: nameParts[0], lastName: '' };
    } else {
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      return { firstName, lastName };
    }
  };



  const handleGoogleAuthentication = async () => {
    if (processingAuth) return;
    
    try {
      setProcessingAuth(true);

      // Split the name into first and last name
      const fullName = session?.user?.name || 'Google User';
      const { firstName, lastName } = splitName(fullName);
      
      // Use the existing signup API with Google data
      const signupData = {
        fullName: fullName,
        email: session?.user?.email || '',
        phone: '555-000-0000', // Valid phone format for Google users
        dob: '1990-01-01', // Valid date format for Google users
        password: '', // No password for Google users
        profileImage: session?.user?.image || '',
        registerType: 'google' // Add register type
      };

      
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });

      const signupResult = await signupResponse.json();

      if (signupResult.success) {
        
        // Update auth context
        if (loginWithGoogle) {
          const result = await loginWithGoogle(signupResult.user, signupResult.token);
          
          // Clear NextAuth session to prevent conflicts
          if (result) {
            await signOut({ redirect: false });
          }
        }
      } else {
        // If signup fails because user already exists, we need to handle this differently
        if (signupResult.message?.includes('already exists') || signupResult.message?.includes('duplicate')) {
          
          try {
            // Call a special endpoint to get Google user data and create token
            const googleLoginResponse = await fetch('/api/auth/google-login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: session?.user?.email,
                name: session?.user?.name,
                image: session?.user?.image
              })
            });

            const googleLoginResult = await googleLoginResponse.json();
            
            if (googleLoginResult.success) {
              
              // Update auth context
              if (loginWithGoogle) {
                const result = await loginWithGoogle(googleLoginResult.user, googleLoginResult.token);
                
                // Clear NextAuth session to prevent conflicts
                if (result) {
                  await signOut({ redirect: false });
                }
              }
            } else {
              console.error('Failed to login existing Google user:', googleLoginResult.message);
            }
          } catch (error) {
            console.error('Error in Google login flow:', error);
          }
        } else {
          console.error('Google signup failed:', signupResult.message);
        }
      }
    } catch (error) {
      console.error('Error during Google authentication:', error);
    } finally {
      setProcessingAuth(false);
    }
  };

    const handleFacebookAuthentication = async () => {
    if (processingAuth) return;
    
    try {
      setProcessingAuth(true);

      // Split the name into first and last name
      const fullName = session?.user?.name || 'Facebook User';
      const { firstName, lastName } = splitName(fullName);
      
      // Use the existing signup API with Facebook data
      const signupData = {
        fullName: fullName,
        email: session?.user?.email || '',
        phone: '555-000-0000', // Valid phone format for Facebook users
        dob: '1990-01-01', // Valid date format for Facebook users
        password: '', // No password for Facebook users
        profileImage: session?.user?.image || '',
        registerType: 'facebook' // Add register type
      };

      
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });

      const signupResult = await signupResponse.json();

      if (signupResult.success) {
        
        // Update auth context
        if (loginWithGoogle) {
          const result = await loginWithGoogle(signupResult.user, signupResult.token);
          
          // Clear NextAuth session to prevent conflicts
          if (result) {
            await signOut({ redirect: false });
          }
        }
      } else {
        // If signup fails because user already exists, we need to handle this differently
        if (signupResult.message?.includes('already exists') || signupResult.message?.includes('duplicate')) {
          
          try {
            // Call a special endpoint to get Facebook user data and create token
            const facebookLoginResponse = await fetch('/api/auth/facebook-login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: session?.user?.email,
                name: session?.user?.name,
                image: session?.user?.image
              })
            });

            const facebookLoginResult = await facebookLoginResponse.json();
            
            if (facebookLoginResult.success) {
              
              // Update auth context
              if (loginWithGoogle) {
                const result = await loginWithGoogle(facebookLoginResult.user, facebookLoginResult.token);
                
                // Clear NextAuth session to prevent conflicts
                if (result) {
                  await signOut({ redirect: false });
              }
            }
          } else {
            console.error('Failed to login existing Facebook user:', facebookLoginResult.message);
          }
        } catch (error) {
          console.error('Error in Facebook login flow:', error);
        }
      } else {
        console.error('Facebook signup failed:', signupResult.message);
      }
    }
  } catch (error) {
    console.error('Error during Facebook authentication:', error);
  } finally {
    setProcessingAuth(false);
  }
};

  const handleAppleAuthentication = async () => {
    if (processingAuth) return;
    
    try {
      setProcessingAuth(true);

      // Split the name into first and last name
      const fullName = session?.user?.name || 'Apple User';
      const { firstName, lastName } = splitName(fullName);
      
      // Use the existing signup API with Apple data
      const signupData = {
        fullName: fullName,
        email: session?.user?.email || '',
        phone: '555-000-0000', // Valid phone format for Apple users
        dob: '1990-01-01', // Valid date format for Apple users
        password: '', // No password for Apple users
        profileImage: session?.user?.image || '',
        registerType: 'apple' // Add register type
      };

      
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });

      const signupResult = await signupResponse.json();

      if (signupResult.success) {
        
        // Update auth context
        if (loginWithGoogle) {
          const result = await loginWithGoogle(signupResult.user, signupResult.token);
          
          // Clear NextAuth session to prevent conflicts
          if (result) {
            await signOut({ redirect: false });
          }
        }
      } else {
        // If signup fails because user already exists, we need to handle this differently
        if (signupResult.message?.includes('already exists') || signupResult.message?.includes('duplicate')) {
          
          try {
            // Call a special endpoint to get Apple user data and create token
            const appleLoginResponse = await fetch('/api/auth/apple-login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: session?.user?.email,
                name: session?.user?.name,
                image: session?.user?.image
              })
            });

            const appleLoginResult = await appleLoginResponse.json();
            
            if (appleLoginResult.success) {
              
              // Update auth context
              if (loginWithGoogle) {
                const result = await loginWithGoogle(appleLoginResult.user, appleLoginResult.token);
                
                // Clear NextAuth session to prevent conflicts
                if (result) {
                  await signOut({ redirect: false });
              }
            }
          } else {
            console.error('Failed to login existing Apple user:', appleLoginResult.message);
          }
        } catch (error) {
          console.error('Error in Apple login flow:', error);
        }
      } else {
        console.error('Apple signup failed:', signupResult.message);
      }
    }
  } catch (error) {
    console.error('Error during Apple authentication:', error);
  } finally {
    setProcessingAuth(false);
  }
};

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      console.log('Starting Google login...');
      const result = await signIn('google');
      if (result?.ok) {
        console.log('Google login successful!');
        console.log('User data:', session?.user);
        
      } else {
        console.error('Google login failed:', result?.error);
      }
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setFacebookLoading(true);
      console.log('Starting Facebook login...');
      const result = await signIn('facebook');
      if (result?.ok) {
        console.log('Facebook login successful!');
        console.log('User data:', session?.user);
        
      } else {
        console.error('Facebook login failed:', result?.error);
      }
    } catch (error) {
      console.error('Facebook login error:', error);
    } finally {
      setFacebookLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setAppleLoading(true);
      console.log('Starting Apple login...');
      const result = await signIn('apple');
      if (result?.ok) {
        console.log('Apple login successful!');
        console.log('User data:', session?.user);
        
      } else {
        console.error('Apple login failed:', result?.error);
      }
    } catch (error) {
      console.error('Apple login error:', error);
    } finally {
      setAppleLoading(false);
    }
  };

  // Handle authentication when session changes
  useEffect(() => {
    if (session?.user && !processingAuth && session.user.email) {
      // Check if this is a Google, Facebook, or Apple session
      const provider = (session as any)?.provider || 'google'; // Default to google for backward compatibility
      
      if (provider === 'facebook') {
        handleFacebookAuthentication();
      } else if (provider === 'apple') {
        handleAppleAuthentication();
      } else {
        handleGoogleAuthentication();
      }
    }
  }, [session, status, processingAuth, loginWithGoogle, handleFacebookAuthentication, handleAppleAuthentication]);

  return (
    <div className="min-h-screen ">
    {/* Left Section - Hidden on mobile, visible on desktop */}
    <div className='flex flex-col md:flex-row bg-white md:m-20 m-0 rounded-xl'>
      <div className="hidden md:flex md:w-1/2">
        <div className="w-full h-full flex items-center justify-center py-12">
          <Image src={SideImage} alt='logo' width={700} height={200} objectFit="contain" className='xl:h-[50rem] md:h-[40rem] ml-5 rounded-[20px]'/>
        </div>
        
      </div>
      
      {/* Right Section - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center">
              {/* <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" /> */}
              <Image src={Logo} alt='logo' width={146} height={64} objectFit="contain"/>
            </div>
            <h1 className="mt-1 text-3xl font-semibold text-gray-900">{title}</h1>
            <p className="mt-2 text-gray-600">Welcome Back! Please Enter Your Details.</p>
          </div>
          
          {children}
          
          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or, Sign up with</span>
            </div>
          </div>
          
          {/* Social Sign Up */}
          <div className="mt-2 flex justify-center gap-3">
            {/* <button
              type="button"
              className="inline-flex py-2 text-sm font-medium"
            >
              
            <svg width="57" height="56" viewBox="0 0 57 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28.8965" cy="28" r="27.5" fill="#F9FAFB" stroke="#EDF1FC"/>
            <g clipPath="url(#clip0_33228_6671)">
            <path d="M34.8016 12.25C33.1223 12.3662 31.1594 13.4411 30.0156 14.8409C28.9722 16.1107 28.1138 17.9967 28.4485 19.8296C30.2833 19.8867 32.1792 18.7862 33.2778 17.3628C34.3055 16.0379 35.0831 14.1636 34.8016 12.25Z" fill="black"/>
            <path d="M41.4378 22.819C39.8254 20.7971 37.5594 19.6238 35.4194 19.6238C32.5943 19.6238 31.3992 20.9763 29.4364 20.9763C27.4126 20.9763 25.875 19.6277 23.4318 19.6277C21.0319 19.6277 18.4764 21.0944 16.8562 23.6026C14.5783 27.1345 14.9682 33.7751 18.6595 39.4313C19.9806 41.4551 21.7446 43.731 24.0519 43.7507C26.1053 43.7704 26.6841 42.4336 29.4659 42.4198C32.2478 42.4041 32.7754 43.7684 34.8249 43.7467C37.1342 43.729 38.9946 41.2071 40.3157 39.1832C41.2626 37.7322 41.615 37.0018 42.3494 35.3638C37.0082 33.3301 36.1518 25.7347 41.4378 22.819Z" fill="black"/>
            </g>
            <defs>
            <clipPath id="clip0_33228_6671">
            <rect width="31.5" height="31.5" fill="white" transform="translate(13.1465 12.25)"/>
            </clipPath>
            </defs>
            </svg>

            </button> */}
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || processingAuth}
              className={`inline-flex py-2 text-sm font-medium transition ${(loading || processingAuth) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center w-14 h-14">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              ) : processingAuth ? (
                <div className="flex items-center justify-center w-14 h-14">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <Image src={GoogleIcon} alt='google' width={56} height={56} />
              )}
            </button>
            
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={facebookLoading || processingAuth}
              className={`inline-flex py-2 text-sm font-medium transition ${(facebookLoading || processingAuth) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            >
              {facebookLoading ? (
                <div className="flex items-center justify-center w-14 h-14">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              ) : processingAuth ? (
                <div className="flex items-center justify-center w-14 h-14">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <Image src={FacebookIcon} alt='facebook' width={56} height={56} />
              )}
            </button>
            
            <button
              type="button"
              onClick={handleAppleLogin}
              disabled={appleLoading || processingAuth}
              className={`inline-flex py-2 text-sm font-medium transition ${(appleLoading || processingAuth) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            >
              {appleLoading ? (
                <div className="flex items-center justify-center w-14 h-14">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                </div>
              ) : processingAuth ? (
                <div className="flex items-center justify-center w-14 h-14">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <Image src={AppleIcon} alt='apple' width={56} height={56} />
              )}
            </button>
          </div>
          
          {/* Login Link */}
          <div className="mt-2 text-center">
              {
                  headingName === "signup" ?
                  <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                      Login
                      </Link>
                  </p>
                  :
                  <p className="text-sm text-gray-600">
                      Don't have account?{' '}
                      <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                      Signup
                      </Link>
                  </p>

              }
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}


export default AuthLayout