'use client';

import { useEffect, useRef } from 'react';

// Define font sizes (not huge)
const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

export default function QuillCDNEditor({ onChange }: { onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);

  // Undo handler
  const handleUndo = () => {
    if (quillInstanceRef.current) {
      quillInstanceRef.current.history.undo();
    }
  };

  // Redo handler
  const handleRedo = () => {
    if (quillInstanceRef.current) {
      quillInstanceRef.current.history.redo();
    }
  };

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window as any).Quill &&
      editorRef.current &&
      !editorRef.current.classList.contains('ql-container')
    ) {
      // Register custom font sizes
      const Quill = (window as any).Quill;
      const Size = Quill.import('attributors/style/size');
      Size.whitelist = FONT_SIZES;
      Quill.register(Size, true);

      // Register custom headers (h1-h6) and paragraph (p)
      const Parchment = Quill.import('parchment');
      const Block = Quill.import('blots/block');
      Block.tagName = 'P';
      Quill.register(Block, true);

      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            // Undo/Redo will be handled by external buttons
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // h1-h6 and p
            [{ 'font': [] }, { 'size': FONT_SIZES }],
            ['bold', 'italic', 'underline'],
            [{ 'color': [] }, { 'background': [] }],
            ['link'],
            [{ 'align': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'lineheight': ['1', '1.5', '2', '2.5', '3'] }],
            ['clean']
          ]
        },
        placeholder: 'Enter your full name',
      });
      quillInstanceRef.current = quill;

      // Listen for content changes and call onChange with HTML
      quill.on('text-change', () => {
        if (onChange) {
          onChange(quill.root.innerHTML);
        }
      });

      // Set initial value
      if (onChange) {
        onChange(quill.root.innerHTML);
      }
    }
  }, [onChange]);

  return (
    <div className="shadow rounded-lg p-6">
      {/* Custom font size CSS for Quill */}
      <style>{`
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="10px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="10px"]::before { content: '10px'; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="12px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="12px"]::before { content: '12px'; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="14px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="14px"]::before { content: '14px'; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="16px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="16px"]::before { content: '16px'; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="18px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="18px"]::before { content: '18px'; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="20px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="20px"]::before { content: '20px'; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="24px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="24px"]::before { content: '24px'; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="28px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="28px"]::before { content: '28px'; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="32px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="32px"]::before { content: '32px'; }
        .ql-size-10px { font-size: 10px; }
        .ql-size-12px { font-size: 12px; }
        .ql-size-14px { font-size: 14px; }
        .ql-size-16px { font-size: 16px; }
        .ql-size-18px { font-size: 18px; }
        .ql-size-20px { font-size: 20px; }
        .ql-size-24px { font-size: 24px; }
        .ql-size-28px { font-size: 28px; }
        .ql-size-32px { font-size: 32px; }
        /* Responsive toolbar */
        .quill-toolbar-flex { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
        @media (max-width: 600px) {
          .quill-toolbar-flex { flex-direction: column; align-items: stretch; gap: 0.25rem; }
        }
        .quill-toolbar-flex .undo-redo-btn {
          display: flex;
          gap: 0.25rem;
          order: 0;
        }
        .quill-toolbar-flex .ql-toolbar {
          flex: 1 1 0%;
          order: 1;
        }
        .quill-toolbar-flex .undo-redo-btn button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem 0.5rem;
          background: #e5e7eb;
          border-radius: 0.25rem;
          border: none;
          transition: background 0.2s;
        }
        .quill-toolbar-flex .undo-redo-btn button:hover {
          background: #d1d5db;
        }
      `}</style>
      {/* Toolbar Row: Undo/Redo + Quill Toolbar */}
      <div className="quill-toolbar-flex mb-2">
        <div className="undo-redo-btn">
          <button type="button" onClick={handleUndo} title="Undo">
            {/* Undo SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 4L3 10L9 16" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 10H13C15.2091 10 17 11.7909 17 14C17 16.2091 15.2091 18 13 18H12" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button type="button" onClick={handleRedo} title="Redo">
            {/* Redo SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4L17 10L11 16" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 10H7C4.79086 10 3 11.7909 3 14C3 16.2091 4.79086 18 7 18H8" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        {/* Quill Toolbar will be rendered automatically by Quill */}
      </div>
      {/* Quill Editor */}
      <div ref={editorRef} style={{ minHeight: 200 }} />
    </div>
  );
}