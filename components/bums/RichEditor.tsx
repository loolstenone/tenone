"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3, List, ListOrdered,
    Quote, Code, Minus, Image as ImageIcon, Link as LinkIcon,
    Undo, Redo,
} from "lucide-react";
import { useCallback, useEffect } from "react";

interface RichEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder = "내용을 입력하세요..." }: RichEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Image.configure({ inline: false, allowBase64: true }),
            Link.configure({ openOnClick: false, autolink: true }),
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none",
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;
                for (const item of Array.from(items)) {
                    if (item.type.startsWith('image/')) {
                        event.preventDefault();
                        const file = item.getAsFile();
                        if (!file) return false;
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const src = e.target?.result as string;
                            if (src) {
                                view.dispatch(view.state.tr.replaceSelectionWith(
                                    view.state.schema.nodes.image.create({ src })
                                ));
                            }
                        };
                        reader.readAsDataURL(file);
                        return true;
                    }
                }
                return false;
            },
            handleDrop: (view, event) => {
                const files = event.dataTransfer?.files;
                if (!files?.length) return false;
                const file = files[0];
                if (!file.type.startsWith('image/')) return false;
                event.preventDefault();
                const reader = new FileReader();
                reader.onload = (e) => {
                    const src = e.target?.result as string;
                    if (src) {
                        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos || view.state.selection.from;
                        view.dispatch(view.state.tr.insert(pos,
                            view.state.schema.nodes.image.create({ src })
                        ));
                    }
                };
                reader.readAsDataURL(file);
                return true;
            },
        },
    });

    // 외부에서 value가 바뀌면 에디터 동기화 (수정 모드 진입 시)
    useEffect(() => {
        if (editor && value && editor.getHTML() !== value) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    const addImage = useCallback(() => {
        const url = window.prompt("이미지 URL을 입력하세요");
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const addLink = useCallback(() => {
        const url = window.prompt("링크 URL을 입력하세요");
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    const Btn = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded transition-colors ${active ? "bg-neutral-200 text-neutral-900" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"}`}
        >
            {children}
        </button>
    );

    return (
        <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
            {/* 툴바 */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-neutral-200 bg-neutral-50">
                <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="굵게">
                    <Bold className="h-4 w-4" />
                </Btn>
                <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="기울임">
                    <Italic className="h-4 w-4" />
                </Btn>
                <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="밑줄">
                    <UnderlineIcon className="h-4 w-4" />
                </Btn>
                <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="취소선">
                    <Strikethrough className="h-4 w-4" />
                </Btn>

                <div className="w-px h-5 bg-neutral-300 mx-1" />

                <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="제목 1">
                    <Heading1 className="h-4 w-4" />
                </Btn>
                <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="제목 2">
                    <Heading2 className="h-4 w-4" />
                </Btn>
                <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="제목 3">
                    <Heading3 className="h-4 w-4" />
                </Btn>

                <div className="w-px h-5 bg-neutral-300 mx-1" />

                <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="글머리 기호">
                    <List className="h-4 w-4" />
                </Btn>
                <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="번호 목록">
                    <ListOrdered className="h-4 w-4" />
                </Btn>
                <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="인용">
                    <Quote className="h-4 w-4" />
                </Btn>
                <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="코드">
                    <Code className="h-4 w-4" />
                </Btn>
                <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">
                    <Minus className="h-4 w-4" />
                </Btn>

                <div className="w-px h-5 bg-neutral-300 mx-1" />

                <Btn onClick={addImage} title="이미지">
                    <ImageIcon className="h-4 w-4" />
                </Btn>
                <Btn onClick={addLink} active={editor.isActive("link")} title="링크">
                    <LinkIcon className="h-4 w-4" />
                </Btn>

                <div className="w-px h-5 bg-neutral-300 mx-1" />

                <Btn onClick={() => editor.chain().focus().undo().run()} title="실행 취소">
                    <Undo className="h-4 w-4" />
                </Btn>
                <Btn onClick={() => editor.chain().focus().redo().run()} title="다시 실행">
                    <Redo className="h-4 w-4" />
                </Btn>
            </div>

            {/* 에디터 본문 */}
            <EditorContent editor={editor} />
        </div>
    );
}
