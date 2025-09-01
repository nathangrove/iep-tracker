import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { googleLogout, useGoogleLogin, OverridableTokenClientConfig } from '@react-oauth/google';

interface GoogleDriveContextType {
  isLoggedIn: boolean;
  login: (overrideConfig?: OverridableTokenClientConfig | undefined) => void;
  logout: () => void;
  accessToken: string | null;
  tokenExpired: boolean;
}

export const GoogleDriveContext = createContext<GoogleDriveContextType | null>(null);

interface GoogleDriveProviderProps {
  children: ReactNode;
}

export const GoogleDriveProvider: React.FC<GoogleDriveProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);

  // Function to validate token
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + token);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token is valid, expires in:', data.expires_in, 'seconds');
        return true;
      } else {
        console.log('❌ Token validation failed:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Token validation error:', error);
      return false;
    }
  };

  // Check for stored token on component mount
  useEffect(() => {
    const checkStoredToken = async () => {
      const storedToken = localStorage.getItem('google_access_token');
      if (storedToken) {
        console.log('🔍 Checking stored Google token...');
        const isValid = await validateToken(storedToken);
        if (isValid) {
          setAccessToken(storedToken);
          setIsLoggedIn(true);
          setTokenExpired(false);
          console.log('✅ Restored valid Google token from storage');
        } else {
          console.log('⚠️ Stored Google token is expired or invalid');
          localStorage.removeItem('google_access_token');
          setTokenExpired(true);
        }
      }
    };
    
    checkStoredToken();
  }, []);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
        const token = codeResponse.access_token;
        setAccessToken(token);
        setIsLoggedIn(true);
        setTokenExpired(false);
        // Store token in localStorage
        localStorage.setItem('google_access_token', token);
        console.log('✅ Google login successful, token stored');
    },
    onError: (error) => console.log('❌ Login Failed:', error),
    scope: "https://www.googleapis.com/auth/drive.file",
  });

  const logout = () => {
    googleLogout();
    setIsLoggedIn(false);
    setAccessToken(null);
    setTokenExpired(false);
    // Remove token from localStorage
    localStorage.removeItem('google_access_token');
    console.log('✅ Google logout successful');
  };

  return (
    <GoogleDriveContext.Provider value={{ isLoggedIn, login, logout, accessToken, tokenExpired }}>
      {children}
    </GoogleDriveContext.Provider>
  );
};

