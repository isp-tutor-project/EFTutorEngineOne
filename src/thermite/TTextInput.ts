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

import { TButton } 			    from "./TButton";
import { TObject } 			    from "./TObject";
import { TTextField }           from "./TTextField";
import { TRoot } 			    from "./TRoot";

import { ITextCursor, 
         ITextElement,
         ITextLine,
         ITextFont,
         ITextTag,
         ITextAttributes,
         ITextSectionFormat}    from "./TTextInterfaces";

import { TTextManager }         from "./TTextManager";

import { TMouseEvent } 		    from "../events/CEFMouseEvent";

import { CONST }                from "../util/CONST";
import { CUtil } 			    from "../util/CUtil";

import MovieClip     	  = createjs.MovieClip;

    // let canvasElement = document.querySelector( '#editorCanvas' );
    // canvasElement.onfocus = () => this.setFocus( true );
    // canvasElement.onblur = () => this.setFocus( false );


export class TTextInput extends TTextField {


    constructor(canvas:HTMLCanvasElement, defaultFont:ITextFont, tagList:ITextTag[], selectionStyle:string, linkStyle:string, readOnly:boolean = false) {

        super(canvas, defaultFont, tagList, selectionStyle, linkStyle, readOnly);

    }


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
                    this.update(); // Have to call manually after textInput()
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


}