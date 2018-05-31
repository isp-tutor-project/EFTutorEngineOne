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



export class TTextField extends TObject {

    public canvas:HTMLCanvasElement;
    public ctx:CanvasRenderingContext2D;

    public defaultFont:ITextFont;
    public tagList:ITextTag[];
    public selectionStyle: string | CanvasGradient | CanvasPattern;
    public linkStyle: string | CanvasGradient | CanvasPattern;
    public readOnly:boolean;

    public wordWrap:boolean;

    public blinkStateChanged:number;

    public cursorLocation: ITextCursor;

    public scrollBarWidth:number;
    public needsScrollBar:boolean;

    public elementMgr:TTextManager;

    public handleOffset:number;
    public handleDragOffset:number;

    public _redraw:Function;
    public _fontChanged:Function;
    public _contentChanged:Function;
    public _gotoUrl:Function;
    public _scrollBarFunc:Function;

    public vOffset:number;
    public focus:boolean;
    public clearBackground:boolean;

    public defaultFontHeight:number;



    constructor(canvas:HTMLCanvasElement, defaultFont:ITextFont, tagList:ITextTag[], selectionStyle:string, linkStyle:string, readOnly:boolean = false) {

        super();

        this.canvas         = canvas;
        this.ctx            = canvas.getContext('2d');
        this.defaultFont    = defaultFont;
        this.tagList        = tagList;
        this.selectionStyle = selectionStyle ? selectionStyle : '#b2d0ee';
        this.linkStyle      = linkStyle ? linkStyle : 'blue';
        this.readOnly       = readOnly;

        this.wordWrap          = true;
        this.blinkStateChanged = 0;

        this.cursorLocation = {
            x : 0,
            y : 0,
            offset : 0,
            element:null
        };

        this.scrollBarWidth = 0;
        this.needsScrollBar = false;

        this.elementMgr = new TTextManager(this.ctx, defaultFont );

        this.handleOffset     = 0;
        this.handleDragOffset = 0;

        this._redraw         = (ctx:CanvasRenderingContext2D) => this.draw(ctx);
        this._fontChanged    = () => {};
        this._contentChanged = () => {};
        this._gotoUrl        = () => {};
        this._scrollBarFunc  = () => {};

        this.vOffset         = 0;
        this.focus           = true;
        this.clearBackground = true;

        this.defaultFontHeight = this.ctx.measureText( "H", defaultFont.text ).height;
    }


    /**
     * Sets the focus state of the editor. When the editor does not have focus, the cursor will not be animated.
     * @param {boolean} focus
     */

    public setFocus( focus:boolean ) {

        this.focus = focus;
        this.mouseIsDown = false;
        if ( focus ) {
            this.resetBlinkState();
            this.updateBlinkState();
            this._redraw();
        } else {
            this.blinkState = false;
            this._redraw();
        }
    }


    /**
     * @returns {boolean} The focus state of the editor.
     */

    public hasFocus() :boolean {
        return this.focus;
    }

    /**
     * Sets the redraw callback function. When the editor needs to be redrawn, it calls this function. The callback mostly just calls the draw() function.
     * @param {function} func
     */

    public needsRedraw( func:Function ) {
        this._redraw = func;
    }

    /**
     * Sets the callback for the content changed event.
     * @param {function} func - Called when the editor content changes.
     */

    public contentChanged( func:Function ) {
        this._contentChanged = func;
    }

    /**
     * Sets the callback for the link clicked event.
     * @param {function} func - Called when a link is clicked in the editor.
     */

    public gotoUrl( func:Function ) {
        this._gotoUrl = func;
    }

    /**
     * Sets the callback for the font changed event.
     * @param {function} func - Called when the font under the cursor changes.
     */

    public fontChanged( func:Function ) {
        this._fontChanged = func;
    }

    /**
     * Deletes the current selection (if any).
     */

    public deleteSelection() {
         if ( this.selection )
             this.keyDown( "Backspace" );
     }

    /**
     * Set the scrollbar code for the vertical scrollbar.
     * @param {object} width - Width of the scrollbar
     * @param {function} func - Called when the scrollbar needs to be drawn
     */

    public setScrollBar( width:number , func:Function )
     {
        this.scrollBarWidth = width;
        this._scrollBarFunc = func;
     }

    /**
     * Sets the cursor at the specified text offset.
     * @param {*} offset
     */

    public setCursor( offset:number )
    {
        if ( this.elementMgr.length() ) {
            let loc:ITextCursor = {};
            loc.offset = offset;

            this.elementMgr.setCurrentElement(null);
            this.cursorLocation = loc;
        }
    }

    /**
     * Sets the given font.
     * @param {object} font - The font to apply to the editor.
     */

    public setFont( font:ITextFont )
    {
        if ( this.selection ) {
            this.cursorLocation = this.elementMgr.applyFontToRange( font, this.selectionStart, this.selectionEnd );
            this.linalyze();
            this.elementMgr.setCurrentElement(this.cursorLocation.element);

            this.getPositionForElementOffset( this.selectionEnd.element, this.selectionEnd.offset, this.selectionEnd );
            this.getPositionForElementOffset( this.cursorLocation.element, this.cursorLocation.offset, this.cursorLocation );
            this.resetBlinkState();
            this._contentChanged( this, "Edit" );
        } else {
            if ( this.elementMgr.getCurrentElement() && !this.elementMgr.getCurrentElement().words ) {
                this.elementMgr.getCurrentElement().font = Object.assign( {}, font );
            } else {
                let el = this.elementMgr.createElement( font );

                if ( !this.cursorLocation.element )
                    this.cursorLocation.element = el;

                this.elementMgr.insertElementAt( el, this.cursorLocation );
                this.elementMgr.setCurrentElement(el);

                this.cursorLocation.offset = 0;
            }
        }
    }

    /**
     * Marks the cursor as visible, called after mouse or text events.
     */

    public resetBlinkState()
    {
        this.blinkState = true;
        this.blinkStateChanged = Date.now();
    }

    /**
     * Updates the blink state. Calls setTimeout() for blink state animation.
     */

    public updateBlinkState()
    {
        if ( this.readOnly ) return;
        this.redrawAt = Date.now();
        setTimeout( function() {
            let time = Date.now();
            if ( this.focus && time - this.blinkStateChanged >= 600 ) {
                this.blinkState = !this.blinkState;
                this.blinkStateChanged = time;
                this._redraw();
            }
        }.bind( this ), 600 );
    }

    /**
     * Finds the x, y position for the text offset inside the given element and writes the position into the given object.
     * @param {object} el - The element.
     * @param {number} offset - The text offset inside the element.
     * @param {object} object - The object to write the x, y coordinates into.
     */

    public getPositionForElementOffset( el:any, offset:any, object:any )
    {
        let x, y = 0;
        let off = 0;
        let lastOffset;

        object.x = 0;

        for( let l = 0; l < this.lines.length; ++l )
        {
            let line = this.lines[l];
            x = line.offset;

            for ( let w = 0; w < line.words.length; ++w )
            {
                let lWord = line.words[w];

                if ( lWord.element === el )
                {
                    let text = lWord.text;

                    if ( lWord.wrapped ) x -= lWord.prefixMetrics.width;

                    if ( lWord.offset <= offset && lWord.offset + text.length >= offset )
                    {
                        // --- Offset is in this word

                        this.ctx.font = lWord.element.font.text;

                        // --- Find the character
                        for ( let i = 0; i < text.length; ++i )
                        {
                            let c = text.charAt( i );
                            x += this.ctx.measureText( c ).width;

                            if ( lWord.offset + i + 1 === offset ) {
                                object.x = x;
                                object.y = y;
                                object.line = line;
                                return;
                            }
                        }
                    }
                    lastOffset = lWord.endOffset;
                }

                // if ( lWord.wrapped ) x += lWord.wordMetrics.width;
                // else x += lWord.width;
                x += lWord.width;
            }

            y += line.maxHeight;

            // --- As linefeeds are not part of the words but new lines, need to check for them separately
            if ( lastOffset ) ++lastOffset;
            if ( lastOffset === offset ) {
                object.x = line.offset;
                object.y = y;
                object.line = line;
            }

            // --- When no word at all is present, make sure object is initialized correctly
            if ( lastOffset === undefined ) {
                object.x = line.offset;
                object.y = y - line.maxHeight;
                object.line = line;
            }
        }
    }

    /**
     * Finds the text location for the given x, y coordinate.
     * @param {object} pos
     * @returns {object} The location for the given coordinates
     */

    public getLocationForMousePos( pos:any ): ITextCursor
    {
        let x = 0, y = 0;

        for( let l = 0; l < this.lines.length; ++l )
        {
            let line = this.lines[l];
            x = line.offset;

            if ( pos.y >= y && pos.y <= ( y + line.maxHeight ) || ( l === this.lines.length - 1 ) )
            {
                // --- Mouse click was on this line
                let rc:any = {};
                rc.line = line;
                rc.y = y;

                for ( let w = 0; w < line.words.length; ++w )
                {
                    let lWord = line.words[w];
                    let d;

                    if ( lWord.wrapped ) {
                        // --- First word per line, only print word
                        d = lWord.wordMetrics.width;
                    } else {
                        d = lWord.width;
                    }

                    if ( pos.x >= x && pos.x <= ( x + d ) )
                    {
                        // --- Hit inside this word
                        rc.element = lWord.element;
                        rc.offset = lWord.offset;

                        let text = lWord.text;
                        if ( lWord.wrapped ) x -= lWord.prefixMetrics.width;

                        this.ctx.font = lWord.element.font.text;

                        // --- Find the character
                        for ( let i = 0; i < text.length; ++i )
                        {
                            let c = text.charAt( i );
                            let cw = this.ctx.measureText( c ).width;

                            if ( pos.x <= x + cw / 2 ) {
                                rc.x = x;
                                break;
                            } else {
                                x += cw;
                                rc.offset++;
                                if ( i === text.length - 1 )
                                    rc.x = x;
                            }
                        }
                    }

                    x += d;
                }

                if ( !rc.element ) {
                    // --- Not found, put the cursor at the end of the line

                    if ( !line.words.length )
                    {
                        // --- This line is empty, go backward to search for the last word to get element and offset

                        let prev = l - 1;
                        let lastWord;
                        let lineOffset = 1;

                        while( prev >= 0 )
                        {
                            let prevLine = this.lines[prev];
                            if ( prevLine.words.length ) {
                                lastWord = prevLine.words[prevLine.words.length-1];
                                break;
                            }
                            lineOffset += 1; --prev;
                        }

                        if ( lastWord ) {
                            rc.element = lastWord.element;
                            rc.offset = lastWord.endOffset + lineOffset;
                        } else {
                            rc.element = undefined;
                            rc.offset = 0;
                        }
                    } else
                    if ( line.words.length ) {
                        let lastWord = line.words[line.words.length-1];
                        rc.element = lastWord.element;
                        rc.offset = lastWord.endOffset;
                    }

                    rc.x = line.offset + line.maxWidth;
                }

                return rc;
            }

            if ( l < this.lines.length - 1 ) {
                x = 0;
                y += line.maxHeight;
            }
        }
    }

    /**
     * Breaks the elements into lines.
     */

    public linalyze() {

        this.lines = [];
        this.maxHeight = 0;
        let width = this.needsScrollBar ? this.width - this.scrollBarWidth : this.width;

        function createLine() {
            let line:ITextLine = {
                words : [],
                maxHeight : 0,
                maxAscent : 0,
                maxDescent : 0,
                maxWidth : 0, // For non word-wrap cases
                offset : 0,
                symbol : "",
            };
            return line;
        }

        let pushLine = ( el:any, line:any ) => {
            if ( !line.maxAscent ) line.maxAscent = el.maxAscent;
            if ( !line.maxDescent ) line.maxDescent = el.maxDescent;

            if ( !line.maxHeight )
                line.maxHeight =  el.maxWordHeight ? el.maxWordHeight : el.maxAscent;

            if ( !line.maxAscent ) line.maxAscent = this.defaultFontHeight;
            if ( !line.maxHeight ) line.maxHeight = this.defaultFontHeight;

            this.maxHeight += line.maxHeight;
            this.lines.push( line );
        };

        let remaining = width;
        let line = createLine();
        let lastEL;

        let formatTag;

        this.elementMgr.clean();

        for( let i = 0; i < this.elementMgr.length(); ++i ) {

            let el:ITextElement = this.elementMgr.at( i );
            lastEL = el;

            // --- Formatting
            if ( el.font.formatting && formatTag !== el.font.formatting.tag ) {
                let formatting = el.font.formatting;
                formatTag =  formatting.tag;

                pushLine( el, line );
                line = createLine();

                remaining = width - formatting.margin[0] - formatting.margin[2];

                line.offset = formatting.margin[0];
                line.symbol = "circle";
            }

            // --- Close formatting
            if ( !el.font.formatting && formatTag ) {
                formatTag = undefined;

                pushLine( el, line );
                line = createLine();
                pushLine( el, line );
                line = createLine();

                remaining = width;
            }

            // --- Parse the words
            for ( let w = 0; w < el.words.length; ++w ) {
                let word = el.words[w];
                word.wrapped = false;

                // --- line break
                if ( word.lineBreak ) {
                    pushLine( el, line );
                    line = createLine();
                    remaining = width;

                    if ( el.font.formatting ) {
                        line.offset = el.font.formatting.margin[0];
                        remaining -= line.offset + el.font.formatting.margin[2];
                        line.symbol = "circle";
                    }
                    continue;
                }

                // --- Word wrap
                if ( this.wordWrap && word.width > remaining  ) {
                    this.lines.push( line );
                    this.maxHeight += line.maxHeight;
                    line = createLine();
                    remaining = width;
                    word.wrapped = true;
                    if ( el.font.formatting ) {
                        line.offset = el.font.formatting.margin[0];
                        remaining -= line.offset + el.font.formatting.margin[2];
                    }
                }

                // --- Insert word
                if ( word.width <= remaining ) {

                    // --- Insert the original element for reference
                    word.element = el;

                    // ---
                    line.words.push( word );

                    line.maxHeight = Math.max( line.maxHeight, word.height );
                    line.maxAscent = Math.max( line.maxAscent, el.maxAscent );
                    line.maxDescent = Math.max( line.maxDescent, el.maxDescent );

                    if ( word.wrapped ) {
                        // --- Word was wrapped, no prefix
                        remaining -= word.wordMetrics.width;
                        line.maxWidth += word.wordMetrics.width;
                    } else {
                        remaining -= word.width;
                        line.maxWidth += word.width;
                    }
                }
            }
        }

        if ( lastEL ) {
            if ( !line.maxAscent ) line.maxAscent = lastEL.maxAscent;
            if ( !line.maxDescent ) line.maxDescent = lastEL.maxDescent;

            if ( !line.maxHeight )
                line.maxHeight =  lastEL.maxWordHeight ? lastEL.maxWordHeight : lastEL.maxAscent;
        }

        // --- If no element with words, get the line height from the default font
        if ( !line.maxAscent ) line.maxAscent = this.defaultFontHeight;
        if ( !line.maxHeight ) line.maxHeight = this.defaultFontHeight;

        this.maxHeight += line.maxHeight;
        this.lines.push( line );

        // --- ScrollBar
        this.needsScrollBar = this.maxHeight > this.height;

        if ( this.needsScrollBar ) {
            if ( this.scrollBarWidth )
                if ( width === this.width )
                    this.linalyze();
        }
    }

    /**
     * Receives plain text input.
     * @param {string} text
     */

    public textInput( text:string, sendNotification:boolean = true )
    {
        if ( this.readOnly ) return;

        if ( this.selection ) {
            this.cursorLocation = this.elementMgr.deleteRange( this.selectionStart, this.selectionEnd );
            this.linalyze();
            this.selection = false;
            this.elementMgr.setCurrentElement(this.cursorLocation.element);
        }
        let el = this.elementMgr.getCurrentElement();

        let insert = ( str:string, index:number, value:string ) => {
            return str.substr(0, index) + value + str.substr(index);
        };

        el.text = insert( el.text, this.cursorLocation.offset, text );

        this.elementMgr.rewordElement( el );
        this.linalyze();
        this.resetBlinkState();

        this.cursorLocation.offset += text.length;
        this.cursorLocation.element = el;
        this.getPositionForElementOffset( el, this.cursorLocation.offset, this.cursorLocation );

        if ( sendNotification ) this._contentChanged( this, "Edit" );
    }

    /**
     * Processes a keyDown event. The key is in a human readable string format like "Enter".
     * @param {string} key
     */

    public keyDown( key:string )
    {
        if ( this.readOnly ) return;
        if ( this.selection ) {
            this.cursorLocation = this.elementMgr.deleteRange( this.selectionStart, this.selectionEnd );
            this.linalyze();
            this.selection = false;
            this.elementMgr.setCurrentElement(this.cursorLocation.element);
            if ( key === "Backspace" ) {
                this.getPositionForElementOffset( this.cursorLocation.element, this.cursorLocation.offset, this.cursorLocation );
                this.resetBlinkState();
                this._contentChanged( this, "Edit" );
                this._redraw();
                return;
            }
        }
        let el = this.elementMgr.getCurrentElement();

        let insert = ( str:string, index:number, value:string ) => {
            return str.substr(0, index) + value + str.substr(index);
        };

        if ( key === "Enter" )
        {
            el.text = insert( el.text, this.cursorLocation.offset, "\n" );

            this.elementMgr.rewordElement( el );
            this.linalyze();

            this.cursorLocation.offset += 1;
            this.cursorLocation.element = el;
            this.getPositionForElementOffset( el, this.cursorLocation.offset, this.cursorLocation );
            this._contentChanged( this, "Edit" );
        } else
        if ( key === "Backspace" )
        {
            let checkPrevious = () => {

                // --- If at the front of the element, go to previous one.
                if ( !this.cursorLocation.offset ) {

                    let previous = this.elementMgr.getPreviousElement( el );

                    if ( !el.text.length && this.elementMgr.length() > 1 ) this.elementMgr.removeElement( el );

                    if ( previous ) {
                        this.cursorLocation.offset = previous.text.length;
                        this.cursorLocation.element = previous;

                        this.elementMgr.setCurrentElement(previous);

                        el = previous;
                        this.getPositionForElementOffset( el, this.cursorLocation.offset, this.cursorLocation );
                    }
                }
            };

            checkPrevious();

            if ( this.cursorLocation.offset ) {
                el.text = el.text.slice(0, this.cursorLocation.offset - 1 ) + el.text.slice( this.cursorLocation.offset );

                this.elementMgr.rewordElement( el );
                this.linalyze();

                this.cursorLocation.offset -= 1;
                this.cursorLocation.element = el;
                this.getPositionForElementOffset( el, this.cursorLocation.offset, this.cursorLocation );

                this._contentChanged( this, "Edit" );
            }

            checkPrevious();
        } else
        if ( key === "ArrowLeft" )
        {
            if ( this.cursorLocation.offset ) --this.cursorLocation.offset;
            else {
                // --- Try to go to previous element
                let element = this.elementMgr.getPreviousElement( this.cursorLocation.element );
                if ( element ) {
                    this.cursorLocation.element = element;
                    this.cursorLocation.offset = element.text.length;
                }
            }

            this.getPositionForElementOffset( this.cursorLocation.element, this.cursorLocation.offset, this.cursorLocation );
        } else
        if ( key === "ArrowRight" )
        {
            if ( this.cursorLocation.offset <= this.cursorLocation.element.text.length ) ++this.cursorLocation.offset;
            else {
                // --- Try to go to previous element
                let element = this.elementMgr.getNextElement( this.cursorLocation.element );
                if ( element ) {
                    this.cursorLocation.element = element;
                    this.cursorLocation.offset = 0;
                }
            }

            this.getPositionForElementOffset( this.cursorLocation.element, this.cursorLocation.offset, this.cursorLocation );
        } else
        if ( key === "ArrowUp" )
        {
            this.cursorLocation.y -= this.cursorLocation.line.maxHeight / 2;
            this.cursorLocation.y = Math.max( this.cursorLocation.y, 0 );
            this.cursorLocation = this.getLocationForMousePos( { x : this.cursorLocation.x, y : this.cursorLocation.y } );
        } else
        if ( key === "ArrowDown" )
        {
            this.cursorLocation.y += this.cursorLocation.line.maxHeight+1;
            this.cursorLocation = this.getLocationForMousePos( { x : this.cursorLocation.x, y : this.cursorLocation.y } );
        }

        this.resetBlinkState();
        this._redraw();
    }

    /**
     * Processes a mouseDown event.
     * @param {object} pos
     */

    public mouseDown( pos:any )
    {
        if ( pos.x < 0 || pos.y < 0 ) return;

        this.scrollAction = undefined;
        this.handleDragOffset = 0;

        if ( this.needsScrollBar && this.scrollBarWidth ) {
            // --- Check if pressed inside handle rect
            if ( pos.x >= this.handleRect.x && pos.x <= this.handleRect.x + this.handleRect.width ){
                // --- ScrollBar
                if ( pos.y >= this.handleRect.y && pos.y <= this.handleRect.y + this.handleRect.height ) {
                    // --- Handle
                    this.scrollAction = "Vertical Handle Move";
                    this.scrollStartX = pos.x;
                    this.scrollStartY = pos.y;
                    this.handleDragOffset = this.handleRect.y;
                }

                this.mouseMove( pos );
                return;
            }
            pos.y += this.vOffset;
        }

        if ( this.hoverElement && this.hoverElement.font.link )
            this._gotoUrl( this.hoverElement.font.link.url );

        let rc:ITextCursor = this.getLocationForMousePos( pos );

        if ( rc ) {
            this.cursorLocation = rc;
            this.elementMgr.setCurrentElement(rc.element);

            if ( rc.element ) {
                if ( !this.selection ) this._fontChanged( rc.element.font );
                else this._fontChanged( this.elementMgr.createFontForRange( this.selectionStart, this.selectionEnd ) );
            }
        }

        this.resetBlinkState();

        this.mouseIsDown = true;
        this.selection = false;
        this._redraw();
    }

    /**
     * Processes a mouseMove event.
     * @param {object} pos
     */

    public mouseMove( pos:any )
    {
        pos.x = Math.max( pos.x, 0 );
        pos.y = Math.max( pos.y, 0 );

        if ( this.scrollAction === "Vertical Handle Move" ) {
            this.handleOffset = pos.y - this.scrollStartY;

            if ( this.handleOffset + this.handleDragOffset < 0 )
                this.handleOffset = -this.handleDragOffset;

            if ( this.handleOffset + this.handleDragOffset + this.handleRect.height > this.height )
                this.handleOffset = this.height - this.handleRect.height - this.handleDragOffset;

            this.vOffset = (this.handleOffset + this.handleDragOffset) * this.maxHeight / this.height;

            this._redraw();
            return;
        }

        if ( this.needsScrollBar && this.scrollBarWidth ) {
            // --- Adjust mouse position for vertical scrollbar offset
            pos.y += this.vOffset;
        }

        let rc = this.getLocationForMousePos( pos );

        if ( rc && !this.mouseIsDown ) {
            if ( this.hoverElement !== rc.element ) {
                this.hoverElement = rc.element;
                this._redraw();

                if ( this.hoverElement ) {
                    if ( this.hoverElement.font.link ) this.canvas.style.cursor = "pointer";
                    else this.canvas.style.cursor = "default";
                }
            }
            return;
        }

        if ( rc ) {
            this.selection = true;

            if ( rc.y < this.cursorLocation.y ) {
                this.selectionStart = rc;
                this.selectionEnd = this.cursorLocation;
            } else
            if ( rc.y === this.cursorLocation.y )
            {
                if ( rc.x <= this.cursorLocation.x ) {
                    this.selectionStart = rc;
                    this.selectionEnd = this.cursorLocation;
                } else {
                    this.selectionStart = this.cursorLocation;
                    this.selectionEnd = rc;
                }

                if ( rc.x === this.cursorLocation.x )
                    this.selection = false;
            } else {
                this.selectionStart = this.cursorLocation;
                this.selectionEnd = rc;
            }

            this._fontChanged( this.elementMgr.createFontForRange( this.selectionStart, this.selectionEnd ) );
            this._redraw();
        }
    }

    /**
     * Processes a mouseUp event.
     * @param {object} pos
     */

    public mouseUp( pos:any )
    {
        this.mouseIsDown = false;
        this.scrollAction = undefined;
    }


    public mouseWheel( step:number ) {
        if ( this.needsScrollBar && this.scrollBarWidth ) {

            this.handleOffset = this.handleOffset - step * 5;

            if ( this.handleOffset + this.handleDragOffset < 0 )
                this.handleOffset = -this.handleDragOffset;

            if ( this.handleOffset + this.handleDragOffset + this.handleRect.height > this.height )
                this.handleOffset = this.height - this.handleRect.height - this.handleDragOffset;

            this.vOffset = (this.handleOffset + this.handleDragOffset) * this.maxHeight / this.height;
            this._redraw();
        }
    }

    /**
     * Layouts the rich text area for the given width, height
     * @param {number} width - The width of the canvas.
     * @param {number} height - The height of the canvas.
     */

    public layout( width:number, height:number ) {

        this.width  = width; 
        this.height = height;

        this.linalyze();

        if ( this.cursorLocation.element )
            this.getPositionForElementOffset( this.cursorLocation.element, this.cursorLocation.offset, this.cursorLocation );

        this._redraw();
    }

    /**
     * Export to the given format.
     * @param {*} type
     */

    public export( format:string, selection:boolean )
    {
        let getTagForSize = ( size:number ) => {
            let tags = this.tagList, diff = 10000, rc;

            tags.forEach( function( tag:ITextTag ) {
                let d = tag.size - size;
                if ( Math.abs( d ) < diff ) {
                    rc = tag.name;
                    diff = Math.abs( d );
                }
            } );
            return rc;
        };

        let transformTextForTag = ( tag:string, formattingTag:string, text:string, attributes:ITextAttributes ) => {
            let out="";
            // --- Line breaks
            if ( formattingTag === "ul" || formattingTag === "ol" ) {
                out = text.replace(/(\r\n|\n|\r)/gm, "</li><li>" );
            } else
            if ( tag === 'p' ) {
                out = text.replace(/(\r\n|\n|\r)/gm, "</p><p>" );
            } else
            {
                if ( tag[0] === 'h' )
                    out = text.replace(/(\r\n|\n|\r)/gm, "" );
                else
                    out = text.replace(/(\r\n|\n|\r)/gm, "</br>" );
            }
            // --- Attributes
            let open = "", close = "";
            if ( attributes.bold ) { open += "<strong>"; close += "</strong>"; }
            if ( attributes.italic ) { open += "<i>"; close += "</i>"; }
            out = open + out + close;
            return out;
        };

        let rc = "";
        let openTag = "", openFormattingTag = "";

        let elements = this.elementMgr.getElements();

        if ( selection ) {
            if ( this.selection ) elements = this.elementMgr.getRange( this.selectionStart, this.selectionEnd );
            else return rc;
        }

        for( let i = 0; i < elements.length; ++i ) {
            let el = elements[i];

            if ( el.font.formatting ) {

                let formatting = el.font.formatting;
                openFormattingTag = formatting.tag;

                rc += "<" + openFormattingTag + ">";
                if ( openFormattingTag === "ul" || openFormattingTag === "ol" )
                    rc += "<li>";
            }

            if ( !el.font.formatting && openFormattingTag ) {
                if ( openFormattingTag === "ul" || openFormattingTag === "ol" )
                    rc += "</li>";
                rc += "</" + openFormattingTag + ">";
                openFormattingTag = undefined;
            }

            if ( format === "text") rc += el.text;
            else
            if ( format === "html" )
            {
                let tag = getTagForSize( el.font.size );
                let text = transformTextForTag( tag, openFormattingTag, el.text, el.font.attributes );

                if ( !openTag ) {
                    rc += `<${tag}>${text}`;
                    openTag = tag;
                } else {
                    if ( tag === openTag ) {
                        rc += text;
                    } else {
                        rc += `</${openTag}><${tag}>${text}`;
                        openTag = tag;
                    }
                }
            }
        }

        if ( format === "html" && openTag )
            rc += `</${openTag}>`;

        return rc;
    }

    /**
     * Clears the document.
     */

    public clear( sendNotification:boolean )
    {
        this.elementMgr.clear();
        this.elementMgr.setCurrentElement(undefined);
        this.cursorLocation = { offset : 0 };
        this.selection = false;
        this.vOffset = 0;
        this.handleDragOffset = 0;
        this.handleOffset = 0;
        if ( sendNotification ) this._contentChanged( this, "Clear" );
    }

    /**
     * Loads a previously saved data string.
     * @param {*} data
     */

    public load( data:string, { clear = true, sendNotification = true } = {} )
    {
        if ( clear ) this.clear(sendNotification);

        let restoreString = ( _string:string ) => {
            let text = "";
            for ( let i = 0; i < _string.length; ++i )
            {
                if ( _string[i] === "\\" && i < _string.length - 1 && _string[i+1] === "n" ) {
                    text += '\n';
                    i++;
                } else text += _string[i];
            }
            return text;
        };

        let d = JSON.parse( data );
        let elements = d.elements;

        for( let i = 0; i < elements.length; ++i )
        {
            let el = elements[i];
            el.text = restoreString( el.text );
            this.elementMgr.rewordElement( el );
        }

        this.elementMgr.setElements(elements);

        this.cursorLocation = {
            element : elements.length ? elements[0] : undefined,
            offset : 0,
        };

        this.linalyze();
        if ( sendNotification )
            this._contentChanged( this, "Load" );
        this._redraw();

        this.getPositionForElementOffset( this.cursorLocation.element, this.cursorLocation.offset, this.cursorLocation );
    }

    /**
     * Stores the current document into a string.
     * @param {boolean} includeCursorLocation - If true includes the cursor location in the saved data (helpful for example for undo / redo).
     * @returns {string} The data
     */

    public save( includeCursorLocation:boolean ): string
    {
        let out:any = {};

        out.elements = [];

        let saveString = ( _string:string ) => {
            let text = "";
            for ( let i = 0; i < _string.length; ++i )
            {
                if ( _string[i] === '\n' )
                    text += '\\n';
                else text += _string[i];
            }
            return text;
        };

        for( let i = 0; i < this.elementMgr.length(); ++i )
        {
            let el = this.elementMgr.at( i );

            let newEl:any = {};
            newEl.text = saveString( el.text );
            newEl.font = Object.assign( {}, el.font );
            out.elements.push( newEl );
        }

        return JSON.stringify( out );
    }


    /**
     * Draws the text at the given screen coordinates. The screen coordinates are only necessary if you don't want to draw the text at 0, 0
     * of your 2D canvas.
     * @param {*} screenX The X offset inside the 2D canvas. 0 by default.
     * @param {*} screenY The Y offset inside the 2D canvas. 0 by default.
     */
    public draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean): boolean {
        
    // draw( screenX = 0, screenY = 0 )

        this._drawHTMLText

        this.screenOffsetX = screenX; this.screenOffsetY = screenY;

        // ---
        let startX = screenX, startY = screenY;

        let x = 0, y = 0;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if ( this.clearBackground )
            ctx.clearRect( startX, startY, this.width, this.height );

        // --- Clip the content

        ctx.save();
        ctx.rect( startX, startY, this.width, this.height );
        ctx.clip();

        screenY -= this.vOffset;

        ctx.fillStyle = 'black';
        ctx.textBaseline = 'alphabetic';

        let formatTag;
        for( let l = 0; l < this.lines.length; ++l ) {
            let line = this.lines[l];

            // --- Dont draw line if below visible area
            if ( y - this.vOffset > this.height )
                continue;

            x += line.offset;
            screenX += line.offset;

            if ( line.symbol ) {
                if ( line.symbol === "circle" ) {
                    ctx.beginPath();
                    let radius = Math.min( line.maxHeight, 3 );
                    let centerX = line.offset - 4 - radius;
                    let centerY = Math.ceil( line.maxHeight / 2 );

                    ctx.beginPath();
                    ctx.arc( screenX - 14 - radius, screenY + centerY, 3, 0, 2 * Math.PI, false);
                    ctx.fillStyle = this.defaultFont.style;
                    ctx.strokeStyle = this.defaultFont.style;
                    ctx.lineWidth = 1;
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();
                }
            }

            if ( !line.words.length && this.selection && ( y >= this.selectionStart.y && y <= this.selectionEnd.y ) ) {
                // --- If empty line, draw a selection rectangle
                ctx.fillStyle = this.selectionStyle;
                ctx.fillRect( startX + x, startY + y - this.vOffset, 5, line.maxHeight );
            }

            for ( let w = 0; w < line.words.length; ++w ) {
                let lWord = line.words[w];

                ctx.font = lWord.element.font.text;

                // --- Get the text and width to draw

                let textToDraw, textToDrawWidth;

                if ( lWord.wrapped ) {
                    // --- Word wrap, only print word
                    textToDraw = lWord.word;
                    textToDrawWidth = lWord.wordMetrics.width;
                } else {
                    textToDraw = lWord.text;
                    textToDrawWidth = lWord.width;
                }

                // --- Draw selection background if necessary

                if ( this.selection )
                {
                    // console.log( y, this.selectionStart.x, this.selectionStart.y, this.selectionEnd.x, this.selectionEnd.y );

                    if ( y >= this.selectionStart.y && y <= this.selectionEnd.y )
                    {
                        ctx.fillStyle = this.selectionStyle;

                        let drawWholeText = false;

                        if ( y > this.selectionStart.y && y < this.selectionEnd.y )
                        {
                            // --- This line is in the middle of the vertical selection somewhere, select everything
                            ctx.fillRect( startX + x, startY + y - this.vOffset, textToDrawWidth, line.maxHeight );
                        } else
                        if ( y === this.selectionStart.y && y === this.selectionEnd.y )
                        {
                            // --- This line is the start and end line of the selection
                            let rx = startX + x, rw = textToDrawWidth;

                            if ( this.selectionStart.x > x ) {
                                let diff = x - this.selectionStart.x;
                                rx -= diff; rw += diff;
                            }

                            if ( this.selectionEnd.x <= rx + rw ) {
                                let diff = rx + rw - this.selectionEnd.x - startX;
                                rw -= diff;
                            }

                            if ( rw > 1 ) ctx.fillRect( rx, startY + y - this.vOffset, rw, line.maxHeight );
                        } else
                        if ( y === this.selectionStart.y )
                        {
                            // --- This line is the start line
                            let rx = startX + x, rw = textToDrawWidth;

                            if ( this.selectionStart.x > x ) {
                                let diff = x - this.selectionStart.x;
                                rx -= diff; rw += diff;
                            }

                            if ( rw > 1 ) ctx.fillRect( rx, startY + y - this.vOffset, rw, line.maxHeight );
                        } else
                        if ( y === this.selectionEnd.y )
                        {
                            // --- This line is end line
                            let rx = startX + x, rw = textToDrawWidth;

                            if ( this.selectionEnd.x <= rx + rw ) {
                                let diff = rx + rw - this.selectionEnd.x - startX;
                                rw -= diff;
                            }

                            if ( rw > 1 ) ctx.fillRect( rx, startY + y - this.vOffset, rw, line.maxHeight );
                        }
                    }
                }

                // --- Draw the text

                if ( lWord.element.font.style ) ctx.fillStyle = lWord.element.font.style;
                else ctx.fillStyle = 'black';

                if ( lWord.element.font.link ) {
                    ctx.fillStyle = this.linkStyle;
                }

                if ( lWord.element.font.link && lWord.element === this.hoverElement )
                {
                    // if ( lWord.element.font.link.hoverStyle )
                    //ctx.fillStyle = lWord.element.font.link.hoverStyle;

                    if ( lWord.element.font.link.hoverAttributes ) {
                        let attributes = lWord.element.font.link.hoverAttributes;
                        if ( attributes.includes( "underline") )
                            ctx.fillRect( screenX, screenY + line.maxAscent + 1, textToDrawWidth, 1 );
                    }
                }

                ctx.fillText( textToDraw, screenX, screenY + line.maxAscent );
                x += textToDrawWidth; screenX += textToDrawWidth;
            }

            if ( l < this.lines.length - 1 ) {
                x = 0;
                y += line.maxHeight;

                screenX = startX;
                screenY += line.maxHeight;
            }
        }

        // --- Cursor / Blink State
        if ( !this.selection && !this.readOnly ) {
            if ( this.blinkState && this.cursorLocation ) {
                let height = this.defaultFont.size;

                if ( this.cursorLocation.line )
                    height = this.cursorLocation.line.maxAscent;// - this.cursorLocation.line.maxDescent;

                ctx.fillStyle = this.defaultFont.style;
                ctx.fillRect( startX + this.cursorLocation.x, startY + this.cursorLocation.y - this.vOffset, 1, height );
            }

            this.updateBlinkState();
        }

        ctx.restore();

        // --- Scrollbar
        if ( this.needsScrollBar && this.scrollBarWidth ) {
            // --- Draw Scrollbar

            let x = this.width - this.scrollBarWidth;
            let y = Math.max( this.handleOffset + this.handleDragOffset, 0 );
            let height = Math.min( this.height / this.maxHeight * this.height, this.height );

            this.handleRect = { x : x, y : y, width : this.scrollBarWidth, height : height };
            this._scrollBarFunc( ctx, this.handleRect );
        }

        return true;
    }
}