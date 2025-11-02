import { EditorContent, useEditor } from "@tiptap/react";
import Textalign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "./MenuBar";
import { ControllerRenderProps } from "react-hook-form";

interface iAppProps {
  field: ControllerRenderProps;
}


export function JobDescriptionEditor({ field }: iAppProps) {
  const editor = useEditor({
    extensions: [StarterKit, Textalign.configure({
        types: ['heading', 'paragraph']
    }), Typography],
    immediatelyRender: false,
    editorProps: {
        attributes: {
            class: 'min-h-[300px] p-4 max-w-none focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-2xl dark:prose-invert'
        }
    },
    onUpdate: ({editor}) => {
      field.onChange(JSON.stringify(editor.getJSON()));
    },

    content: field.value ? JSON.parse(field.value) : '',
  });

  return (
    <div className="w-full border rounded-lg overflow-hidden bg-card">
        <MenuBar editor={editor} />
        <EditorContent editor={editor}/> 
    </div>
  )
}
