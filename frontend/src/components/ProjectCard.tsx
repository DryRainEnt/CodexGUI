import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Trash2, ChevronRight } from 'lucide-react';
import { FormattedDateTime, RelativeTime } from './ui';
import { Project } from '../types/project';

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const ProjectCard = ({
  project,
  onSelect,
  onDelete,
  onToggleFavorite
}: ProjectCardProps) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmActive, setDeleteConfirmActive] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'none' | 'left' | 'right'>('none');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchMoveX, setTouchMoveX] = useState<number | null>(null);
  
  // Delete confirmation timer
  const handleDeleteClick = () => {
    setIsDeleting(true);
    // 2초 후 확인 버튼 활성화
    setTimeout(() => {
      setDeleteConfirmActive(true);
    }, 2000);
  };
  
  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteConfirmActive(false);
    setSlideDirection('none');
  };
  
  const handleConfirmDelete = () => {
    if (deleteConfirmActive) {
      onDelete(project.id);
    }
  };
  
  // Touch and mouse events for slide actions
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setTouchMoveX(e.touches[0].clientX);
    
    const diff = touchStartX - e.touches[0].clientX;
    
    // 왼쪽으로 슬라이드 (즐겨찾기)
    if (diff < -50) {
      setSlideDirection('left');
    } 
    // 오른쪽으로 슬라이드 (삭제)
    else if (diff > 50) {
      setSlideDirection('right');
    } else {
      setSlideDirection('none');
    }
  };
  
  const handleTouchEnd = () => {
    if (slideDirection === 'left') {
      // 왼쪽으로 슬라이드: 즐겨찾기 토글
      onToggleFavorite(project.id);
    } else if (slideDirection === 'right') {
      // 오른쪽으로 슬라이드: 삭제 확인
      handleDeleteClick();
    }
    
    setTouchStartX(null);
    setTouchMoveX(null);
  };
  
  // 슬라이드 스타일 계산
  const getCardStyle = () => {
    if (touchStartX !== null && touchMoveX !== null) {
      const diff = touchMoveX - touchStartX;
      // 이동 범위 제한 (-100px ~ 100px)
      const clampedDiff = Math.max(-100, Math.min(100, diff));
      return {
        transform: `translateX(${clampedDiff}px)`,
        transition: 'none'
      };
    }
    
    return {
      transform: 'translateX(0)',
      transition: 'transform 0.3s ease'
    };
  };
  
  if (isDeleting) {
    return (
      <div className="p-3 bg-red-100 dark:bg-red-900 rounded-md mb-2 shadow animate-fadeIn">
        <p className="text-sm">{t('projects.deleteConfirm')}</p>
        <div className="flex justify-end mt-2 space-x-2">
          <button
            className="btn btn-outline text-xs"
            onClick={handleCancelDelete}
          >
            {t('common.cancel')}
          </button>
          <button
            className={`btn ${deleteConfirmActive ? 'bg-red-600 hover:bg-red-700' : 'bg-red-400'} text-white text-xs`}
            onClick={handleConfirmDelete}
            disabled={!deleteConfirmActive}
          >
            {deleteConfirmActive ? t('common.delete') : t('common.wait')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="relative overflow-hidden rounded-md shadow mb-2"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 슬라이드 액션 배경 */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-yellow-500 flex items-center justify-center text-white">
          <Star size={20} />
        </div>
        <div className="w-1/2 bg-red-500 flex items-center justify-center text-white">
          <Trash2 size={20} />
        </div>
      </div>
      
      {/* 카드 컨텐츠 */}
      <div 
        className="p-3 bg-white dark:bg-gray-800 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 relative z-10"
        style={getCardStyle()}
        onClick={() => onSelect(project.id)}
      >
        <div className="flex items-center">
          <h3 className="text-md font-medium flex-1 truncate">{project.name}</h3>
          <button
            className={`text-xl ${project.is_favorite ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'} hover:text-yellow-500`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(project.id);
            }}
            aria-label={project.is_favorite ? t('projects.removeFavorite') : t('projects.addFavorite')}
          >
            {project.is_favorite ? '★' : '☆'}
          </button>
          
          <button
            className="ml-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
            aria-label={t('projects.delete')}
          >
            <Trash2 size={18} />
          </button>
          
          <ChevronRight size={18} className="ml-2 text-gray-400" />
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
          <span>
            {t('projects.lastModified')}:{' '}
            <FormattedDateTime date={project.updated_at} dateFormat="short" />
          </span>
          <span className="text-gray-400 dark:text-gray-500">
            <RelativeTime date={project.updated_at} />
          </span>
        </div>
        
        {project.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
            {project.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
