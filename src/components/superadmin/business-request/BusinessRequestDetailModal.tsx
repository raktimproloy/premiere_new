import React, { useEffect } from 'react';
import { FileIcon } from '../../../../public/images/svg';

export interface BusinessRequestDetail {
  id: string;
  personName: string;
  email: string;
  phone: string;
  requestDate: string;
  totalPropertyListing: string;
  revenueGenerated: string;
  documentation: Array<{ label: string; fileUrl?: string }>;
}

interface BusinessRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: BusinessRequestDetail | null;
}

const BusinessRequestDetailModal: React.FC<BusinessRequestDetailModalProps> = ({
  isOpen,
  onClose,
  request
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !request) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      {/* Slide-in Modal Panel (right side) */}
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className={`pointer-events-auto w-screen max-w-xl transform transition ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex h-full flex-col bg-white rounded-sm shadow-xl">
                {/* Header */}
                <div className="flex items-center px-6 py-5 border-b border-gray-200">
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer mr-2"
                  >
                    <img src="/images/icons/back.svg" alt="close" className="h-5 w-5" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">Business Request Details</h2>
                </div>
                {/* Content */}
                <div className="px-6 py-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-4">
                    <div className="text-sm text-gray-700 font-medium">Business User Name</div>
                    <div className="text-sm text-gray-500">{request.personName}</div>
                    <div className="text-sm text-gray-700 font-medium">Business User Email ID</div>
                    <div className="text-sm text-gray-500">{request.email}</div>
                    <div className="text-sm text-gray-700 font-medium">Business User Phone</div>
                    <div className="text-sm text-gray-500">{request.phone}</div>
                    <div className="text-sm text-gray-700 font-medium">Request Date</div>
                    <div className="text-sm text-gray-500">{request.requestDate}</div>
                    <div className="text-sm text-gray-700 font-medium">Total Property Listing</div>
                    <div className="text-sm text-gray-500">{request.totalPropertyListing}</div>
                    <div className="text-sm text-gray-700 font-medium">Revenue Generated</div>
                    <div className="text-sm text-gray-500">{request.revenueGenerated}</div>
                  </div>
                  <div className="border-t border-dashed border-gray-300 my-6"></div>
                  <div>
                    <div className="text-md font-semibold text-gray-900 mb-3">Documentation</div>
                    <div className="flex flex-wrap gap-4">
                      {request.documentation.map((doc, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center w-40 h-24 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                          {/* <img src="/images/icons/document.svg" alt="doc" className="h-8 w-8 mb-2" /> */}
                          <FileIcon />
                          <span className="text-sm text-gray-700 font-medium mt-2">{doc.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Footer with Action Buttons */}
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex justify-between space-x-3">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 rounded-full text-sm font-medium text-white bg-[#FF4545] hover:bg-[#FF4545]/80 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 rounded-full text-sm font-medium text-white bg-[#40C557] hover:bg-[#40C557]/80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors cursor-pointer"
                    >
                      Approved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BusinessRequestDetailModal; 