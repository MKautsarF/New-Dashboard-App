import FullPageLoading from '@/components/FullPageLoading';
import { loginInstructor } from '@/services/auth.services';
import { getProfile } from '@/services/profile.services';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';

// Define the shape of your context
interface Instructor {
  id: string;
  name: string;
  username: string;
  email: string;
}

/* interface Submission {
  id: string;
  trainType: string;
  owner: string;
  setting: string;
} */

interface AuthContextType {
  instructor: Instructor;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => string;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component that will wrap your application
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  const [instructor, setInstructor] = useState<Instructor>({
    id: '',
    name: '',
    username: '',
    email: '',
  });
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchSession(sessionToken: string) {
      try {
        const res = await getProfile(sessionToken);

        setInstructor({
          id: res.id,
          username: res.username,
          name: res.name,
          email: res.email,
        });
        setToken(token);
      } catch (e) {
        console.error(e);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    }

    setIsLoading(true);

    const sessionToken = sessionStorage.getItem('jwt');

    if (sessionToken) {
      fetchSession(sessionToken);
    } else {
      setIsLoading(false);
      navigate('/');
    }
  }, []);

  const login = async (username: string, password: string) => {
    // Local testing purposes
    // setInstructor({
    //   username: "instructor",
    //   name: "Dummy Instructor",
    // });

    const token = await loginInstructor(username, password);
    sessionStorage.setItem('jwt', token);
    const res = await getProfile(token);

    setInstructor({
      id: res.id,
      username: res.username,
      name: res.name,
      email: res.email,
    });
    setToken(token);
  };

  const logout = () => {
    setInstructor({
      id: '',
      name: '',
      username: '',
      email: '',
    });
    setToken('');
    sessionStorage.clear();
    navigate('/');
  };

  const getToken = () => token;

  const contextValue: AuthContextType = {
    instructor,
    login,
    logout,
    getToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {isLoading ? <FullPageLoading loading={isLoading} /> : children}
    </AuthContext.Provider>
  );
};

export const currentPeserta = {
  id: '',
  name: '',
  nip: '',
};

export const currentSubmission = {
  id: -1,
};

export const currentInstructor = {
  isAdmin: false,
  isInstructor: false,
};
