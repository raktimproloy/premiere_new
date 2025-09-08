// src/components/SuccessModal.tsx
import React from 'react';
import { FiPlus } from 'react-icons/fi';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
}

const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  title = "Your Property Edit Successfully",
  description = "The room you is already edited. You can add a new room or view your list if you want.",
  primaryButtonText = "Create new property",
  secondaryButtonText = "Back to Property list",
  onPrimaryButtonClick,
  onSecondaryButtonClick
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-32 w-32 rounded-full mb-4">
            <img src="/images/success.png" alt="done" className="w-full h-full" />
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
          
          {/* Description */}
          <p className="text-gray-600 mb-6">{description}</p>
          
          {/* Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={onPrimaryButtonClick}
              className="max-w-7xl flex justify-center items-center gap-2 mx-auto py-3 px-6 bg-[#586DF7] text-white font-medium rounded-full shadow-md  transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
            >
              {primaryButtonText}
              <FiPlus className="mr-2 border rounded-full ml-2 font-bol" />
            </button>
            
            <button
              onClick={onSecondaryButtonClick || onClose}
              className="py-3 px-6 bg-white text-gray-700 font-medium cursor-pointer hover:text-[#586DF7]"
            >
              {secondaryButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateModal;