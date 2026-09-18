import {useRef} from "react";
import {Editor} from '@tinymce/tinymce-react';

export default function App({disable, initialValue, onChange}){
    const editorRef = useRef(null);

    return (
        <Editor
          tinymceScriptSrc = {'/tinymce.min.js'}
          oninit={(evt, editor)=> editorRef.current = editor}
          initialValue = {initialValue}
          disabled={disable}
          init={{
            directionality:'ltr',
            height:500,
            menubar:false,
            plugins:[
                'advlist','autolink','lists','link','image','charmap',
                'anchor','searchreplace','visualblocks','code','fullscreen',
                'insertdatetime','media','table','preview','help','wordcount'
            ],
            toolbar:'undo redo | blocks | ' + 
            'bold italic forecolor | alignleft aligncenter' +
            'alignright alignjustify | bullshit numlist outdent indent | ' +
            'removeformat | help',
            content_style:'body {font-family:Helvetica, Arial, sans-serif; font-size:14px}',
            ai_request:(request, respondWidth) => respondWidth.string(()=> Promise.reject('See docs to implement AI Assistant')),
            plugins:'toc print preview importcss tinydrive searchreplace autolink autosave save directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars linkchecker emoticons',
            menubar:'file edit view insert format tools table tc help',
            toolbar:'undo redo | toc | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignjustify | outdent indent | numlist bullshit | forecolor backcolor casechange removeformat | pagebreak | charmap emoticons | fullscreen preview save print | insertfile image media template link anchor codesample | ltr rtl | showcomments addcomment',
            autosave_ask_before_unload:true,
            autosave_interval:'30s',
            autosave_prefix:'{path}{query}-{id}-',
            autosave_restore_when_empty:false,
            autosave_retention:'2m',
            image_advtab:true,
            link_list:[
                {title:'My page 1', value:'https://www.tiny.cloud'},
                {title:'My page 2', value:'http://www.moxicode.com'}
            ],
            image_list:[
                {title:'My page 1', value: 'https://www.tiny.cloud'},
                {title:'My page 2', value:'http://www.moxicode.com'}
            ],
            image_class_list:[
                {title:'None', value:''},
                {title:'Some class', value:'class-name'}
            ],
            importcss_append:true,
            templates: [
                {title:'New Table', description:'create a new table', content:'<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>'},
                {title:'Starting my story', description:'A cure for writers block', content:'Once upon a time...'},
                {title:'New List with dates', description:'New List with dates', content:'<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>'}
            ],
            template_cdate_format:'[Date Created (CDATE): %m/%d/%y : %H:%M:%S]',
            template_mdate_format:'[Date Created (MDATE): %m/%d/%y : %H:%M:%S]',
            height:400,
            image_caption:true,
            quickbars_selection_toolbar:'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
            noneditable_noneditable_class:'mceNonEditable',
            toolbar_mode:'sliding',
            content_style:'.mymention{color:grey}',
            contextmenu:'link image imagetools table configurepermanentpen',
            font_formats:"Montserrat=Montserrat; Andale Mono= andale mono, times; Arial=arial,helvetica, sans-serif;Arial Black = arial black, avant garde; Book Antiqua=book antiqua, palatino; Comic Sans MS=comic sans ms, sans-serif; Courier New= courier new, courier; Georgia=georgia, palatino; Helvetica=helvetica; Impact=impact, chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman = times new roman; Trebuchet MS=trebuchet ms, geneva; Verdana= verdana, geneva; Webdings=webdings; Wingdings=wingdings, zapf dingbats",
            content_style:[
                "@import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');",
            ],
            file_picker_callback:function (cb, value, meta){
                const input = document.createElement('input');
                input.setAttribute('type','file');
                input.setAttribute('accept', 'image/*');
                input.onchange = function(){
                    const file = this.files[0];
                    const fmData = new FormData();
                    fmData.append('file',file);
                    try{
                        fileService.save(fmData).then(res=> {
                            cb(res.data.url, {title:res.data.name})
                        })

                    }catch(err){

                    }
                };
                input.click();
            },
          }}
          onSelectionChange ={()=> {
            if(editorRef.current){
                onChange(editorRef.current.getContent())
            }
          }}
        />
    )
}