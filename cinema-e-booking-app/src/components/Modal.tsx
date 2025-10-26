'use client';

import { useEffect } from "react";
import AuthLayout from "@/components/AuthLayout";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function Modal({open, onClose, title, children}: ModalProps) {
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
      }, [open]);
    
      if (!open) return null;

      return (
        
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-black rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
            ✕
            </button>
            {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
            {children}
            </div>
        </div>
        
        
        );
}