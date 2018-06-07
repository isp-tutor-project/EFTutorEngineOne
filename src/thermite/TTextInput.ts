//*********************************************************************************
//
//  Copyright(c) 2008,2018 Kevin Willows. All Rights Reserved
//
//	License: Proprietary
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//
//*********************************************************************************

//**Imports

import { TObject } 			    from "./TObject";
import { TRoot } 			    from "./TRoot";

import { ITextCursor, 
         ITextElement,
         ITextLine,
         ITextFont,
         ITextTag,
         ITextAttributes,
         ITextSegmentFormat}    from "./TTextInterfaces";

import { TTextManager }         from "./TTextManager";

import { CEFEvent }             from "../events/CEFEvent";
import { TMouseEvent } 		    from "../events/CEFMouseEvent";

import { CONST }                from "../util/CONST";
import { CUtil } 			    from "../util/CUtil";

import MovieClip     	  = createjs.MovieClip;
import Timeline     		  = createjs.Timeline;
import DisplayObject 		  = createjs.DisplayObject;
import DisplayObjectContainer = createjs.Container;

    // let canvasElement = document.querySelector( '#editorCanvas' );
    // canvasElement.onfocus = () => this.setFocus( true );
    // canvasElement.onblur = () => this.setFocus( false );

interface CSSstyles {

    // This is a special signature to avoid typescript error "because <type> has no index signature."
	// on this[<element name>]
	// 
	[key: string]: any;
    
    resize:string,
    border:string,
  
    position:string,
    left:string, 
    top:string,
    width:string,
    height:string,
  
    color:string,
  
    pointerEvents:string,
    boxSizing:string,

    fontFamily:string,  
    fontSize:string,
    fontStyle:string,
    fontWeight:string,  

    visibility:string

}


export class TTextInput extends TObject {


	//************ Stage Symbols
	
	public StxtField:TObject;
    public SfocusBox:TObject;
    
    public STextArea: HTMLTextAreaElement;
	
	//************ Stage Symbols				
    

    private fAdded:boolean;
    private createOptions:CSSstyles;
    private _updateVisibilityCbk:any;
    private _updateComponentCbk:any;




    constructor() {

        super();

    }


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

    public TTextInputInitialize() {

        this.TObjectInitialize.call(this);
        this.init3();
    }

    public initialize() {

        this.TObjectInitialize.call(this);		
        this.init3();
    }

    private init3() {
        
        this.traceMode = true;
        if(this.traceMode) CUtil.trace("TTextInput:Constructor");

        this.on(CEFEvent.ADDED_TO_STAGE, this.onAddedToStage);
        
        this.fAdded = false;

        this.createOptions = {

            resize:"none",
            border:"1px solid #CCC",
          
            position:"absolute",
            left:"15px", 
            top:"45px",
            width:"303px",
            height:"350px",
          
            color:"red",
          
            pointerEvents: "all",
            boxSizing:"border-box",
    
            fontFamily:"verdana",  
            fontSize:"21px",
            fontStyle:"normal",
            fontWeight:"normal",  
    
            visibility:"show"
        };
    
        // this.setOnKeyPress();

        // this.setFont( this.createFont( 20 ) );
        // this.textInput( "Welcome to RichTextJS\n" );
    }

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


    public Destructor() : void
    {
        this.removeEventListener(TMouseEvent.WOZCLICKED, this.doMouseClicked);
        this.removeEventListener(TMouseEvent.WOZOVER   , this.doMouseOver);
        this.removeEventListener(TMouseEvent.WOZOUT    , this.doMouseOut);
        this.removeEventListener(TMouseEvent.WOZDOWN   , this.doMouseDown);
        this.removeEventListener(TMouseEvent.WOZUP     , this.doMouseUp);			
        
        if(this.fAdded) {
            dom_overlay_container.removeChild(this.STextArea); 
            this.fAdded = false;
        }

        super.Destructor();
    }

    public onAddedToStage(evt:CEFEvent) {

        console.log("TextInput On Stage");

        // We are added to the scene on each frame of an animation
        //
		this._lastFrame = (this.parent as MovieClip).currentFrame;       

        if(!this.fAdded) {
            this.STextArea     = document.createElement("textarea"); 
            this.STextArea.id  = "StextInput";

            this.StxtField.visible = false;        
            let value:string       = this.StxtField.text;

            let attr:string;
            let CSSstyle:CSSstyles = this.STextArea.style as CSSstyles;

            for(attr in this.createOptions) {

                CSSstyle[attr] = this.createOptions[attr];
            }

            dom_overlay_container.appendChild(this.STextArea); 

            this.STextArea.focus();
            this.fAdded = true;


            let stage = this.getStage();

            if(stage) {
                this._updateVisibilityCbk = stage.on('drawstart', this._handleDrawStart, this, false);
                this._updateComponentCbk  = stage.on('drawend', this._handleDrawEnd, this, true);
            }
        }
    }


    // --- Insert Text - No HTML import yet so we have todo it by hand, we could load() JSON but that would uglify the source.

    public createFont(size?:number, attributes?:Array<string>, formatting?:string, style?:string, link?:string ) {

        let font = Object.assign( {}, this.defaultFont );

        font.size = size;
        font.text = String( size ) + "pt " + font.name;
        font.attributes = attributes;
        font.formatting = formatting;
        font.link = link;
        font.style = style ? style : 'black';

        if ( font.attributes) {
            if ( font.attributes.bold ) font.text = "bold " + font.text;
            if ( font.attributes.italic ) font.text = "italic " + font.text;
        }

        return font;
    };


    public setOnKeyPress() {

        // --- Handle text input
        document.onkeypress = ( event:KeyboardEvent ) => {

            if ( this.hasFocus() ) {
                let code = event.keyCode;

                // --- No Backspace, enter or tab
                if ( code !== 8 && code !== 13 && code != 9 )
                {
                    let text = String.fromCharCode( code );
                    this.textInput( text );
                }
                event.preventDefault();
            }
        };
    }





    public setOnKeyDown() {

        // --- Handle key down
        document.onkeydown = ( event ) => {

            if ( this.hasFocus() ) {
                let keyCode = event.keyCode;

                let keyText = "";
                if ( keyCode === 13 ) keyText = "Enter";
                else if ( keyCode === 8 ) keyText = "Backspace";
                else if ( keyCode === 37 ) keyText = "ArrowLeft";
                else if ( keyCode === 38 ) keyText = "ArrowUp";
                else if ( keyCode === 39 ) keyText = "ArrowRight";
                else if ( keyCode === 40 ) keyText = "ArrowDown";

                if ( keyText ) {
                    this.keyDown( keyText );
                    event.preventDefault();
                }
            }
        };
    }


    public setOnCut() {
        
        // --- Clipboard Support
        window.addEventListener('cut', function ( event:ClipboardEvent ) {
            if ( event.clipboardData ) {
                let out = this.export( "text", true );
                if ( out ) {
                    this.deleteSelection();
                    event.clipboardData.setData('text/plain', out );
                    event.preventDefault();
                }
            }
        });
    }


    public setOnCopy() {
            
        window.addEventListener('copy', function ( event:ClipboardEvent ) {
            if ( event.clipboardData ) {
                let out = this.export( "text", true );
                if ( out ) {
                    event.clipboardData.setData('text/plain', out );
                    event.preventDefault();
                }
            }
        });
    }


    public setOnPaste() {
            
            window.addEventListener('paste', function ( event:ClipboardEvent ) {
            if ( event.clipboardData ) {
                let text = event.clipboardData.getData( 'text/plain' );
                if ( text ) {
                    this.deleteSelection();
                    this.textInput( text );
                    this.update();
                    event.preventDefault();
                }
            }
        });
    }


    public setProperty(k:string, v:string|number) {

        if(this._options[k] != v) {
            this._dirty[k] = true;
        }
        this._options[k] = v;
    }


    public _handleDrawStart(evt:CEFEvent) {

        if(this.fAdded) {

            if((this.getStage() == null || this._lastFrame != (this.parent as MovieClip).currentFrame)) {

                dom_overlay_container.removeChild(this.STextArea); 
                this.fAdded = false;

                this.stage.removeEventListener('drawstart', this._updateVisibilityCbk);
                this._updateVisibilityCbk = false;
            }
        }
    }

    public _handleDrawEnd(evt:CEFEvent) {


        if(this.fAdded) {
            let mat = this.StxtField.getConcatenatedDisplayProps(this.StxtField._props).matrix;

            let tx1 = mat.decompose(); 
            let sx = tx1.scaleX; 
            let sy = tx1.scaleY;

            let dp = window.devicePixelRatio || 1; 
            let w = this.StxtField.nominalBounds.width * sx; 
            let h = this.StxtField.nominalBounds.height * sy;

            mat.tx/=dp;
            mat.ty/=dp; 
            mat.a/=(dp*sx);
            mat.b/=(dp*sx);
            mat.c/=(dp*sy);
            mat.d/=(dp*sy);

            this._element.setProperty('transform-origin', this.regX + 'px ' + this.regY + 'px');

            let x = (mat.tx + this.regX*mat.a + this.regY*mat.c - this.regX);
            let y = (mat.ty + this.regX*mat.b + this.regY*mat.d - this.regY);

            let tx = 'matrix(' + mat.a + ',' + mat.b + ',' + mat.c + ',' + mat.d + ',' + x + ',' + y + ')';

            this._element.setProperty('transform', tx);
            this._element.setProperty('width', w + "px");
            this._element.setProperty('height', h + "px");
            this._element.update();
        }
    }
    
    // public _$tick() {
    //     let stage = this.getStage();
    //     stage&&stage.on('drawend', this._handleDrawEnd, this, true);
    //     if(!this._updateVisibilityCbk) {
    //         this._updateVisibilityCbk = stage.on('drawstart', this._updateVisibility, this, false);
    //     }
    // }
    




}