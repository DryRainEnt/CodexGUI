import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useApiKeyStore from '../store/apiKeyStore';
import { getProject, getChatLogs, sendChatMessage, getFilesList } from '../api/endpoints';

// Avatar with animation states
const Avatar = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'waiting' | 'answering' | 'working' | 'error' | 'happy'>('waiting');
  
  // Simulate status changes for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('answering');
      
      setTimeout(() => {
        setStatus('working');
        
        setTimeout(() => {
          setStatus('happy');
          
          setTimeout(() => {
            setStatus('waiting');
          }, 3000);
        }, 3000);
      }, 3000);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex items-start p-2">
      <div className="h-36 w-36 bg-gray-200 dark:bg-gray-700 rounded-md mr-4 flex items-center justify-center relative">
        {/* This would be replaced with actual avatar animation frames */}
        <span className="text-4xl">🤖</span>
        
        {/* Status indicator */}
        <div className="absolute bottom-2 right-2 flex items-center bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs shadow">
          <span className={`w-2 h-2 rounded-full mr-1 ${
            status === 'waiting' ? 'bg-gray-500' :
            status === 'answering' ? 'bg-blue-500' :
            status === 'working' ? 'bg-yellow-500' :
            status === 'error' ? 'bg-red-500' :
            'bg-green-500'
          }`}></span>
          {status === 'waiting' && t('avatar.statusWaiting')}
          {status === 'answering' && t('avatar.statusAnswering')}
          {status === 'working' && t('avatar.statusWorking')}
          {status === 'error' && t('avatar.statusError')}
          {status === 'happy' && t('avatar.statusHappy')}
        </div>
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-2">Codex Assistant</h2>
        <div className="text-sm text-gray-600 dark:text-gray-300 h-20 overflow-y-auto">
          {/* System log messages would go here */}
          <p>Looking at project structure...</p>
          <p>Analyzing recent changes...</p>
        </div>
      </div>
    </div>
  );
};

// Recent file thumbnail component
interface FileThumbnailProps {
  name: string;
  path: string;
  onClick: () => void;
}

const FileThumbnail = ({ name, path, onClick }: FileThumbnailProps) => {
  return (
    <div 
      className="w-24 h-24 bg-white dark:bg-gray-800 rounded shadow m-1 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col"
      onClick={onClick}
    >
      <div className="flex-1 flex items-center justify-center">
        {/* File icon would be determined by file type */}
        <span className="text-2xl">📄</span>
      </div>
      <div className="text-xs text-center mt-1 truncate">
        {name}
      </div>
    </div>
  );
};

// Chat message component
interface ChatMessageProps {
  isUser: boolean;
  content: string;
  timestamp: string;
}

const ChatMessage = ({ isUser, content, timestamp }: ChatMessageProps) => {
  return (
    <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
      <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
        isUser 
          ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      }`}>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {new Date(timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

// Main Project component
const Project = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apiKey, isValidated } = useApiKeyStore();
  
  const [project, setProject] = useState<any>(null);
  const [chatLogs, setChatLogs] = useState<any[]>([]);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Check if API key is validated
  useEffect(() => {
    if (!isValidated || !apiKey) {
      navigate('/launch');
    }
  }, [isValidated, apiKey, navigate]);
  
  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Uncomment when API is ready
        // const projectData = await getProject(id);
        // setProject(projectData);
        
        // Mock project data
        setProject({
          id,
          name: 'Sample Project',
          path: '/path/to/project',
          description: 'A sample project',
          created_at: '2023-02-20T10:00:00Z',
          updated_at: '2023-02-21T15:30:00Z',
          is_favorite: true
        });
        
        // Mock chat logs
        setChatLogs([
          {
            id: 'msg1',
            role: 'user',
            content: 'Hello, I need help with my project.',
            timestamp: '2023-02-21T15:00:00Z'
          },
          {
            id: 'resp1',
            role: 'assistant',
            content: 'Hi there! I\'m here to help. What specifically do you need assistance with?',
            timestamp: '2023-02-21T15:01:00Z'
          },
          {
            id: 'msg2',
            role: 'user',
            content: 'I\'m trying to implement a new feature.',
            timestamp: '2023-02-21T15:05:00Z'
          },
          {
            id: 'resp2',
            role: 'assistant',
            content: 'Great! Can you tell me more about the feature you\'re working on? What are the requirements and what have you tried so far?',
            timestamp: '2023-02-21T15:06:00Z'
          }
        ]);
        
        // Mock recent files
        setRecentFiles([
          {
            name: 'index.js',
            path: '/path/to/project/index.js',
            type: 'file',
            size: 1024,
            modified: '2023-02-21T15:20:00Z'
          },
          {
            name: 'README.md',
            path: '/path/to/project/README.md',
            type: 'file',
            size: 512,
            modified: '2023-02-21T14:30:00Z'
          },
          {
            name: 'package.json',
            path: '/path/to/project/package.json',
            type: 'file',
            size: 2048,
            modified: '2023-02-21T13:45:00Z'
          },
          {
            name: 'src/App.js',
            path: '/path/to/project/src/App.js',
            type: 'file',
            size: 3072,
            modified: '2023-02-21T12:15:00Z'
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch project data:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id, t]);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatLogs]);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !id) return;
    
    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    // Add user message to chat
    setChatLogs([...chatLogs, userMessage]);
    setInputMessage('');
    
    try {
      // Uncomment when API is ready
      // const response = await sendChatMessage(id, inputMessage);
      // setChatLogs(prevLogs => [...prevLogs, response.response]);
      
      // Mock response for now
      setTimeout(() => {
        const assistantMessage = {
          id: `resp_${Date.now()}`,
          role: 'assistant',
          content: `I received your message: "${inputMessage}". This is a mock response.`,
          timestamp: new Date().toISOString()
        };
        
        setChatLogs(prevLogs => [...prevLogs, assistantMessage]);
      }, 1000);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(t('common.error'));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileClick = (path: string) => {
    // This would open the file in the system's default editor
    console.log('Opening file:', path);
  };
  
  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      {/* Header with token info */}
      <div className="h-8 flex justify-end items-center mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Tokens: 1,000,000
        </span>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span>{t('common.loading')}</span>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500">
          {error}
        </div>
      ) : (
        <>
          {/* Avatar section */}
          <Avatar />
          
          {/* Main content */}
          <div className="flex-1 flex mt-4 mb-4 overflow-hidden">
            {/* Recent files panel (left side) */}
            <div className="w-32 pr-2 flex flex-col items-center overflow-y-auto">
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('chat.contextFiles')}
              </h3>
              {recentFiles.map((file, index) => (
                <FileThumbnail
                  key={index}
                  name={file.name}
                  path={file.path}
                  onClick={() => handleFileClick(file.path)}
                />
              ))}
            </div>
            
            {/* Chat panel (right side) */}
            <div className="flex-1 pl-2 flex flex-col">
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
              >
                {chatLogs.map((message) => (
                  <ChatMessage
                    key={message.id}
                    isUser={message.role === 'user'}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Chat input */}
          <div className="h-16 flex">
            <textarea
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
              placeholder={t('chat.inputPlaceholder')}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="ml-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center"
              onClick={handleSendMessage}
            >
              <span className="sr-only">{t('chat.send')}</span>
              <span className="text-xl">▶</span>
            </button>
          </div>
          
          {/* Footer */}
          <div className="h-8 mt-2 flex justify-between items-center">
            <button className="btn btn-outline text-xs">
              + {t('chat.addReference')}
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {project?.name} - {project?.path}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Project;
