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
import { THtmlBase }            from "./THtmlBase";

import { CEFEvent }             from "../events/CEFEvent";

import { CUtil } 			    from "../util/CUtil";
import { CONST }                from "../util/CONST";

import MovieClip     	      = createjs.MovieClip;
import Text     	          = createjs.Text;




export class THtmlInput extends THtmlBase {


	//************ Stage Symbols
	
	public SControlContainer:TObject;
	
	//************ Stage Symbols				



    constructor() {

        super();

    }


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

    public THtmlInputInitialize() {

        this.THtmlBaseInitialize.call(this);
        this.init4();
    }

    public initialize() {

        this.THtmlBaseInitialize.call(this);		
        this.init4();
    }

    private init4() {
        
        this.traceMode = true;
        if(this.traceMode) CUtil.trace("THtmlInput:Constructor");

        this.cssSheet = {

            "[efinput].outerContainer" : {
                
                "position":"absolute",
                "box-sizing":"border-box",            
    
                "resize":"none",
                "border":"none",
              
                "left":"0px", 
                "top":"0px",
                "width":"0px",
                "height":"0px",

                "pointer-events":"all",
        
                "font-Family":"verdana",  
                "font-Size":"10px",
                "font-Style":"normal",
                "font-Weight":"normal",  
                
                "padding":"0px",
                "margin":"0px",

                "visibility":"hidden"
            },
    
            "[efinput] .input" : {
                "box-sizing":"border-box",              
    
                "resize":"inherit",
                "border":"inherit",
              
                "left":"inherit", 
                "top":"inherit",
                "width":"inherit",
                "height":"inherit",
    
                "pointer-events":"all",
        
                "font-Family":"verdana",  
                "font-Size":"inherit",
                "font-Style":"normal",
                "font-Weight":"normal",                  
            }
        };    
    }

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


    public onAddedToStage(evt:CEFEvent) {

        console.log("HTMLInput On Stage");

        if(!this.fAdded) {

            // TODO: make this equivalent to other HTML controls
            this.dimContainer = this.SControlContainer;
            this.SControlContainer.visible = false;        

            this.outerContainer = document.createElement("div"); 
            this.outerContainer.className = "outerContainer";
            this.outerContainer.setAttribute(CONST.EFINPUT_TYPE, "");
            this.outerContainer.setAttribute(this.name, "");

            this.controlContainer  = this.outerContainer;

            // TODO: to use the ANimateCC control to set the font - decompose font
            //       must be modified.
            // 
            // this.decomposeFont(this.cssSheet, this.StxtField.font);

            super.onAddedToStage(evt);
        }
    }


    public setFocus(focus:boolean) {
        
        
    }


    public setEnabled(enabled:boolean) {
        
        
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


    public _handleDrawEnd(evt:CEFEvent) {

        super._handleDrawEnd(evt);
    }
    

    /*
    * 
    */
    public deSerializeObj(objData:any) : void
    {
        this.fontSize= objData.fontSize || this.fontSize;        

        super.deSerializeObj(objData);				

        console.log("deserializing: Input Custom Control");
    }
}