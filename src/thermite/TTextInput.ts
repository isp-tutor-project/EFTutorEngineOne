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

import { CEFEvent }             from "../events/CEFEvent";
import { TMouseEvent } 		    from "../events/CEFMouseEvent";

import { CUtil } 			    from "../util/CUtil";

import MovieClip     	      = createjs.MovieClip;
import Text     	          = createjs.Text;

    // let canvasElement = document.querySelector( '#editorCanvas' );
    // canvasElement.onfocus = () => this.setFocus( true );
    // canvasElement.onblur = () => this.setFocus( false );




export class TTextInput extends TObject {


	//************ Stage Symbols
	
	public StxtField:Text;
    public SfocusBox:TObject;
    
    public STextInput: HTMLTextAreaElement;
	
	//************ Stage Symbols				
    

    private fAdded:boolean;

    private isHTMLControl:boolean;
    private HTMLmute:boolean;
    private startText:string;

    private cssOptions:any;
    private cssDirty:any;

    private fontSize:number;
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
        
        this.fAdded   = false;
        
        this.isHTMLControl = true;
        this.HTMLmute      = true;

        this.fontSize   = 17;
        this.cssDirty   = {};
        this.cssOptions = {

            resize:"none",
            border:"1px solid #CCC",
            // background:"#CCC",
          
            position:"absolute",
            // left:"15px", 
            // top:"45px",
            // width:"303px",
            // height:"350px",
          
            // color:"red",
          
            pointerEvents: "all",
            boxSizing:"border-box",            
    
            fontFamily:"verdana",  
            fontSize:"10px",
            fontStyle:"normal",
            fontWeight:"normal",  
    
            visibility:"hidden"
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
            dom_overlay_container.removeChild(this.STextInput); 
            this.fAdded = false;
        }

        super.Destructor();
    }

    public onAddedToStage(evt:CEFEvent) {

        let stage;

        console.log("TextInput On Stage");

        // We are added to the scene on each frame of an animation
        //
		this._lastFrame = (this.parent as MovieClip).currentFrame;       

        if(!this.fAdded) {
            this.STextInput     = document.createElement("textarea"); 
            this.STextInput.id  = "StextInput";

            this.StxtField.visible = false;        
            this.SfocusBox.visible = false;        

            this.decomposeFont(this.cssOptions, this.StxtField.font);

            this.STextInput.value = this.StxtField.text;

            this.cssOptions.opacity   = this.StxtField.alpha     || this.cssOptions.opacity;
            this.cssOptions.color     = this.StxtField.color     || this.cssOptions.color;
            this.cssOptions.initAlign = this.StxtField.textAlign || this.cssOptions.textAlign;

            // Set the default style
            //
            for(let attr in this.cssOptions) {

                this.setProperty(attr, this.cssOptions[attr], true);
            }
            this.updateStyle(true);

            dom_overlay_container.appendChild(this.STextInput); 

            // Set focus in the $onEnterScene override
            //
            // this.STextArea.focus();

            this.fAdded = true;

            if(stage = this.getStage()) {
                this._updateVisibilityCbk = stage.on('drawstart', this._handleDrawStart, this, false);
                this._updateComponentCbk  = stage.on('drawend'  , this._handleDrawEnd  , this, false);
            }
        }
    }


    public muteHTMLControl(mute:boolean) {

        this.HTMLmute = mute;
    }


    public setFocus(focus:boolean) {
        
        if(focus)
            this.STextInput.focus();
        else 
            this.STextInput.blur();
        
    }


    public setEnabled(enabled:boolean) {
        
        if(enabled)
            this.STextInput.disabled = false;
        else 
            this.STextInput.disabled = true;
        
    }
    
    public fontContainsElement(attr:string, candidates:Array<string>|Array<RegExp>) : any {

        let result:string = null;
        let match:Array<string> = null;

        for(let candidate of candidates) {
            if(match = attr.match(candidate)) {
                result = match[0];
                break;
            }
        }

        return result;
    }


    /**
     * Extract the font information from the STxtField control 
     * 
     * @param fontStr 
     */
    public decomposeFont(fontSpec:any, fontStr:string ) : any {

        let match:Array<string> = null;

        // fontStr = "italic bold 21px 'googleplex narrow'";
        
        // Note that in practice if the font is "normal" in any attribute - "normal" is excluded from the
        // spec to make it non-ambiguous
        // 
        let styles:Array<string>  = ["normal","italic","oblique","initial","inherit"];
        let weights:Array<string> = ["normal","bold","bolder","lighter","100","200","300","400","500","600","700","800","900","initial","inherit"];
        let sizes:Array<RegExp>   = [/\d*px/];

        // "test 'test rtst'"
        if(fontStr) {

            if(match = fontStr.match(/'[\w\s]*'/))
                    fontSpec.fontFamily = match[0];

            fontSpec.fontStyle   = this.fontContainsElement(fontStr, styles) || fontSpec.fontStyle;
            fontSpec.fontWeight  = this.fontContainsElement(fontStr, weights) || fontSpec.fontWeight;
            fontSpec.fontSize    = this.fontContainsElement(fontStr, sizes) || fontSpec.fontSize;
        }

        return fontSpec;
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


    public setProperty(key:string, value:string|number, force:boolean = false) {

        if(force || this.cssOptions[key] != value) {
            this.cssDirty[key] = true;
        }
        this.cssOptions[key] = value;
    }


    public updateStyle(force:boolean) {
            
        for(let attr in this.cssOptions) {

            if(force || this.cssDirty[attr]) {
                this.cssDirty[attr] = false;
                (this.STextInput.style as any)[attr] = this.cssOptions[attr];
            }
        }    
    }


    public _handleDrawStart(evt:CEFEvent) {

        if(this.fAdded) {

            if((this.getStage() == null || this._lastFrame != (this.parent as MovieClip).currentFrame)) {

                dom_overlay_container.removeChild(this.STextInput); 
                this.fAdded = false;

                this.stage.removeEventListener('drawstart', this._updateVisibilityCbk);
                this._updateVisibilityCbk = false;
            }
        }
    }


    public _handleDrawEnd(evt:CEFEvent) {

        if(this.fAdded && !this.HTMLmute) {
            let mat = this.SfocusBox.getConcatenatedDisplayProps(this.SfocusBox._props).matrix;

            let tx1 = mat.decompose(); 
            let sx = tx1.scaleX; 
            let sy = tx1.scaleY;

            // TODO: should this.prototype.nominalbounds be used instead?
            
            mat.tx += this.SfocusBox.nominalBounds.x  * sx; 
            mat.ty += this.SfocusBox.nominalBounds.y  * sy; 
            let w   = this.SfocusBox.nominalBounds.width  * sx; 
            let h   = this.SfocusBox.nominalBounds.height * sy;

            let dp = window.devicePixelRatio || 1; 
            mat.tx/=dp;
            mat.ty/=dp; 
            mat.a/=(dp*sx);
            mat.b/=(dp*sx);
            mat.c/=(dp*sy);
            mat.d/=(dp*sy);

            this.setProperty('transform-origin', this.regX + 'px ' + this.regY + 'px');

            let x = (mat.tx + this.regX*mat.a + this.regY*mat.c - this.regX);
            let y = (mat.ty + this.regX*mat.b + this.regY*mat.d - this.regY);

            let tx = 'matrix(' + mat.a + ',' + mat.b + ',' + mat.c + ',' + mat.d + ',' + x + ',' + y + ')';

            this.setProperty("visibility", this.visible? "visible":"hidden");
            this.setProperty("opacity", this.alpha);
            this.setProperty("fontSize", this.fontSize * sx + "px")
            this.setProperty('transform', tx);
            this.setProperty('width', w + "px");
            this.setProperty('height', h + "px");
            this.updateStyle(false);
        }
    }
    

    /*
    * 
    */
    public deSerializeObj(objData:any) : void
    {
        console.log("deserializing: Input Custom Control");

        this.STextInput.value = objData.startText || this.STextInput.value;

        super.deSerializeObj(objData);				
    }
}