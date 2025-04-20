import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Save, Edit, X, Check } from 'lucide-react';
import { Avatar } from '../types/avatar';

interface AvatarEditorProps {
  avatar: Avatar;
  onSave: (updatedAvatar: Avatar) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  showStatus?: boolean;
  status?: 'idle' | 'answering' | 'working' | 'error' | 'happy';
}

const AvatarEditor = ({
  avatar,
  onSave,
  onCancel,
  readOnly = false,
  showStatus = false,
  status = 'idle'
}: AvatarEditorProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(avatar.name);
  const [persona, setPersona] = useState(avatar.persona);
  const [avatarImage, setAvatarImage] = useState<string | null>(avatar.image);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reset values when avatar changes
  useEffect(() => {
    setName(avatar.name);
    setPersona(avatar.persona);
    setAvatarImage(avatar.image);
  }, [avatar]);
  
  // Status text and animation frame calculations
  const getStatusText = () => {
    switch(status) {
      case 'answering': return t('avatar.status.answering');
      case 'working': return t('avatar.status.working');
      case 'error': return t('avatar.status.error');
      case 'happy': return t('avatar.status.happy');
      default: return t('avatar.status.idle');
    }
  };
  
  const getStatusAnimation = () => {
    if (!avatarImage || !showStatus) return {};
    
    // Calculate sprite position based on status
    // Assuming sprite sheet with 5 columns (frames) and 5 rows (states)
    // Each state has 5 frames for animation
    const statusIndex = {
      idle: 0,
      answering: 1,
      working: 2,
      error: 3,
      happy: 4
    }[status] || 0;
    
    // Calculate current animation frame (0-4) based on time
    const frameCount = 5;
    const animationSpeed = 3; // frames per second
    const currentFrame = Math.floor((Date.now() / (1000 / animationSpeed)) % frameCount);
    
    // Calculate background position
    // Each frame is 144x144px in a 720x720px sprite sheet (5x5 grid)
    const xPos = currentFrame * 144; // column
    const yPos = statusIndex * 144;  // row
    
    return {
      backgroundImage: `url(${avatarImage})`,
      backgroundPosition: `-${xPos}px -${yPos}px`,
      backgroundSize: '720px 720px', // 5 frames x 5 states x 144px
      width: '144px',
      height: '144px'
    };
  };
  
  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSave = () => {
    onSave({
      ...avatar,
      name,
      persona,
      image: avatarImage
    });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setName(avatar.name);
    setPersona(avatar.persona);
    setAvatarImage(avatar.image);
    setIsEditing(false);
    if (onCancel) onCancel();
  };
  
  const startEditing = () => {
    if (!readOnly) {
      setIsEditing(true);
    }
  };
  
  // Default placeholder image when no avatar is set
  const getDefaultAvatar = () => {
    return (
      <div className="flex items-center justify-center w-36 h-36 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-400 dark:text-gray-500">
        <span className="text-4xl">🤖</span>
      </div>
    );
  };

  return (
    <div className="flex items-start p-2">
      {/* Avatar image */}
      <div 
        className={`w-36 h-36 rounded-md overflow-hidden flex items-center justify-center cursor-${isEditing ? 'pointer' : 'default'} border-2 ${
          isEditing ? 'border-primary-500 dark:border-primary-400' : 'border-transparent'
        }`}
        onClick={handleImageClick}
        role={isEditing ? 'button' : 'img'}
        aria-label={isEditing ? t('avatar.changeImage') : t('avatar.image')}
        tabIndex={isEditing ? 0 : -1}
      >
        {avatarImage ? (
          <div 
            className="w-full h-full"
            style={showStatus ? getStatusAnimation() : { backgroundImage: `url(${avatarImage})`, backgroundSize: 'cover' }}
          />
        ) : (
          getDefaultAvatar()
        )}
        
        {isEditing && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <Upload className="text-white" size={32} />
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          aria-hidden="true"
        />
      </div>
      
      {/* Avatar details */}
      <div className="flex-1 ml-4">
        <div className="flex items-center mb-2">
          {isEditing ? (
            <input
              type="text"
              className="flex-1 px-2 py-1 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('avatar.namePlaceholder')}
              aria-label={t('avatar.name')}
            />
          ) : (
            <h2 className="text-xl font-semibold flex-1 dark:text-white">
              {name || t('avatar.defaultName')}
            </h2>
          )}
          
          {/* Action buttons */}
          {!readOnly && (
            <div className="space-x-2">
              {isEditing ? (
                <>
                  <button
                    className="btn btn-primary text-sm"
                    onClick={handleSave}
                    aria-label={t('common.save')}
                  >
                    <Check size={16} className="mr-1" />
                    {t('common.save')}
                  </button>
                  <button
                    className="btn btn-outline text-sm"
                    onClick={handleCancel}
                    aria-label={t('common.cancel')}
                  >
                    <X size={16} className="mr-1" />
                    {t('common.cancel')}
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-outline text-sm"
                  onClick={startEditing}
                  aria-label={t('common.edit')}
                >
                  <Edit size={16} className="mr-1" />
                  {t('common.edit')}
                </button>
              )}
            </div>
          )}
          
          {/* Status indicator (only shown when not editing and status is enabled) */}
          {showStatus && !isEditing && (
            <div className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700">
              {getStatusText()}
            </div>
          )}
        </div>
        
        {/* Persona text/editor */}
        {isEditing ? (
          <textarea
            className="w-full h-20 px-2 py-1 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none text-sm"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder={t('avatar.personaPlaceholder')}
            aria-label={t('avatar.persona')}
          />
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {persona || t('avatar.defaultPersona')}
          </p>
        )}
      </div>
    </div>
  );
};

export default AvatarEditor;
