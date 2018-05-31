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

import { TMouseEvent } 		    from "../events/CEFMouseEvent";

import { ITextCursor, 
         ITextElement,
         ITextFont,
         ITextTag,
         ITextAttributes,
         ITextSectionFormat}       from "./TTextInterfaces";

import { CONST }                from "../util/CONST";
import { CUtil } 			    from "../util/CUtil";


import MovieClip     	  = createjs.MovieClip;
import Text     		  = createjs.Text;



export class TTextManager {

    private current:ITextElement;
    private elements:Array<ITextElement>;
    private defaultFont:ITextFont;

    private ctx:CanvasRenderingContext2D;
    
    constructor(context:CanvasRenderingContext2D, defaultFont:ITextFont ) {

        this.ctx      = context;
        this.elements = new Array<ITextElement>();
        this.defaultFont = defaultFont;
    }

    /**
     * @returns {number} The length of the element array.
     */

    public length(): number {
        return this.elements.length;
    }

    /**
     * Returns the element object at the given index.
     * @param {number} index
     * @returns {object} The elements at the given index.
     */

    public at( index: number ): ITextElement {
        return this.elements[index];
    }

   /**
     * Creates a new element;
     */

    public createElement( font?:ITextFont ) : ITextElement
    {
        if ( !font ) font = this.defaultFont;

        let el:ITextElement = { text : "", 
                                font : Object.assign( {}, font ),
                                words : new Array<ITextSectionFormat>() };
        return el;
    }

    /**
     * Returns the elements.
     */

    public getElements()
    {
        return this.elements;
    }

    /**
     * Returns the elements.
     */

    public setElements(_elements:Array<ITextElement>)
    {
        this.elements = _elements;
    }


    

    /**
     * Returns the current element.
     */

    public getCurrentElement()
    {
        if ( !this.current ) {
            this.current = this.createElement();
            this.elements.push( this.current );
        }

        return this.current;
    }


    /**
     * Returns the current element.
     */

    public setCurrentElement(el:ITextElement)
    {
        this.current = el;
    }


    /**
     * @returns the element before the given element.
     */

    public getPreviousElement( el:ITextElement)
    {
        let index = this.elements.indexOf( el );

        if ( index )
            return this.elements[index-1];
    }


    /**
     * @returns the element after the given element.
     */

    public getNextElement( el:ITextElement )
    {
        let index = this.elements.indexOf( el );

        if ( index < this.elements.length )
            return this.elements[index+1];
    }


    /**
     * Removes the given element.
     * @param {object} el - the element to remove
     */

    public removeElement( el: ITextElement )
    {
        let index = this.elements.indexOf( el );

        if ( index !== -1 ) this.elements.splice( index, 1 );
    }


    /**
     * Splits the element at the given offset, inserts the new element and returns it.
     * @param {*} el
     * @param {*} offset
     * @returns {object} The created element.
     */

    public splitElement( el: ITextElement, offset: number ): ITextElement {
        let newEl = this.createElement();
        newEl.font = Object.assign( {}, el.font );

        let index = this.elements.indexOf( el );
        this.elements.splice( index + 1, 0, newEl );

        newEl.text = el.text.substr( offset );
        el.text = el.text.substr( 0, offset );

        this.rewordElement( el );
        this.rewordElement( newEl );

        return newEl;
    }


    /**
     * Inserts the element at the given location.
     * @param {*} el
     * @param {*} loc
     */

    public insertElementAt( el: ITextElement, loc: ITextCursor ) : void
    {
        // console.log( loc.element.text.length, loc.offset );
        // 
        if ( loc.element.text.length === loc.offset ) {

            // --- Insert it behind the location element
            let index = this.elements.indexOf( loc.element );
            this.elements.splice( index + 1, 0, el );

        } else if ( loc.offset === 0 ) {

            // --- Insert it before the location element
            let index = this.elements.indexOf( loc.element );
            this.elements.splice( Math.min( index - 1, 0 ), 0, el );

        } else {
            this.splitElement( loc.element, loc.offset );
            let index = this.elements.indexOf( loc.element );
            this.elements.splice( index + 1, 0, el );
        }
    }

    /**
     *
     * @param {*} el
     * @param {*} fromElement
     * @param {*} toElement
     * @returns {boolean} True if the given element is located between the from and to element, false otherwise.
     */

    public isElementInsideRange( el: ITextElement, fromElement: ITextElement, toElement: ITextElement ): boolean
    {
        let result:boolean = false;

        let fromIndex = this.elements.indexOf( fromElement ), toIndex = this.elements.indexOf( toElement );

        if ( fromIndex !== -1 && toIndex !== -1 ) {

            let index = this.elements.indexOf( el );

            if ( index >= fromIndex && index <= toIndex ) 
                                                result = true;
        }

        return result;
    }

    /**
     * Deletes the given range between the two locations.
     * @param {*} fromLoc
     * @param {*} toLoc
     * @returns {object} The new location.
     */

    public deleteRange( fromLoc: ITextCursor, toLoc: ITextCursor ): object
    {
        let elements:Array<ITextElement> = new Array<ITextElement>();
        let newLoc:ITextCursor = {x:0,y:0,offset:0,element:null};

        for( let i = 0; i < this.elements.length; ++i )
        {
            let el = this.elements[i];

            if ( this.isElementInsideRange( el, fromLoc.element, toLoc.element ) )
            {
                if ( el !== fromLoc.element && el !== toLoc.element )
                    continue; // Delete if inside range
                else
                if ( el === fromLoc.element && el === toLoc.element )
                {
                    let text = fromLoc.element.text;
                    fromLoc.element.text = text.substr( 0, fromLoc.offset ) + text.substr( toLoc.offset, text.length - toLoc.offset );
                    this.rewordElement( fromLoc.element );

                    elements.push( fromLoc.element );
                    newLoc.element = fromLoc.element;
                    newLoc.offset = fromLoc.offset;
                } else
                if ( el === fromLoc.element )
                {
                    let text = fromLoc.element.text;
                    fromLoc.element.text = text.substr( 0, fromLoc.offset );
                    this.rewordElement( fromLoc.element );

                    elements.push( fromLoc.element );
                    newLoc.element = fromLoc.element;
                    newLoc.offset = fromLoc.offset;
                } else
                if ( el === toLoc.element )
                {
                    let text = toLoc.element.text;
                    toLoc.element.text = text.substr( toLoc.offset, text.length - toLoc.offset );
                    this.rewordElement( toLoc.element );

                    elements.push( toLoc.element );
                }
            } else elements.push( el );
        }
        this.elements = elements;
        return newLoc;
    }

    /**
     * Applies the font to the range between the two locations.
     * @param {*} font
     * @param {*} fromLoc
     * @param {*} toLoc
     * @returns {object} The new location.
     */

    public applyFontToRange( font: ITextFont, fromLoc: ITextCursor, toLoc: ITextCursor ): object
    {
        let elements:Array<ITextElement> = new Array<ITextElement>();
        let newLoc:ITextCursor = {x:0,y:0,offset:0,element:null};

        let newFromElement, newFromOffset;
        let newToElement, newToOffset;

        for( let i = 0; i < this.elements.length; ++i )
        {
            let el = this.elements[i];

            if ( this.isElementInsideRange( el, fromLoc.element, toLoc.element ) )
            {
                if ( el !== fromLoc.element && el !== toLoc.element )
                {
                    // --- If inside the range, apply font to the whole element
                    el.font = Object.assign( {}, font );
                    this.rewordElement( el );
                    elements.push( el );
                }
                else
                if ( el === fromLoc.element && el === toLoc.element )
                {
                    if ( fromLoc.offset === 0 && toLoc.offset === el.text.length )
                    {
                        // --- The whole element is selected
                        el.font = Object.assign( {}, font );
                        this.rewordElement( el );
                        elements.push( el );

                        newLoc.element = el;
                        newLoc.offset = el.text.length;
                    } else {
                        let text = el.text;

                        if ( fromLoc.offset ) {
                            el.text = text.substr( 0, fromLoc.offset );
                            this.rewordElement( el );
                            elements.push( el );
                        }

                        let middleEl = this.createElement( font );
                        middleEl.text = text.substr( fromLoc.offset, toLoc.offset - fromLoc.offset );
                        this.rewordElement( middleEl );
                        elements.push( middleEl );

                        newFromOffset = 0;
                        newFromElement = middleEl;

                        if ( text.length - toLoc.offset ) {
                            let endEl = this.createElement( toLoc.element.font );
                            endEl.text = text.substr( toLoc.offset, text.length - toLoc.offset );
                            this.rewordElement( endEl );
                            elements.push( endEl );
                        }

                        newToOffset = middleEl.text.length;
                        newToElement = middleEl;

                        newLoc.element = middleEl;
                        newLoc.offset = middleEl.text.length;
                    }
                } else
                if ( el === fromLoc.element )
                {
                    let text = el.text;
                    if ( fromLoc.offset === 0 ) el.font = Object.assign( {}, font );
                    else if ( fromLoc.offset > 0 ) el.text = text.substr( 0, fromLoc.offset );
                    this.rewordElement( el );
                    elements.push( el );

                    if ( fromLoc.offset > 0 ) {
                        let middleEl = this.createElement( font );
                        middleEl.text = text.substr( fromLoc.offset, text.length - fromLoc.offset );
                        this.rewordElement( middleEl );
                        elements.push( middleEl );

                        newFromOffset = 0;
                        newFromElement = middleEl;
                    }
                } else
                if ( el === toLoc.element )
                {
                    let text = el.text;
                    let oldFont = Object.assign( {}, el.font );
                    el.text = text.substr( 0, toLoc.offset );
                    el.font = Object.assign( {}, font );
                    this.rewordElement( el );
                    elements.push( el );

                    newToOffset = el.text.length;
                    newToElement = el;

                    newLoc.offset = el.text.length;
                    newLoc.element = el;

                    if ( toLoc.offset < text.length ) {
                        let middleEl = this.createElement( oldFont );
                        middleEl.text = text.substr( toLoc.offset, text.length - toLoc.offset );
                        this.rewordElement( middleEl );
                        elements.push( middleEl );
                    }
                }
            } else elements.push( el );
        }
        this.elements = elements;

        // --- Adjust the selection if necessary

        if ( newFromElement ) {
            fromLoc.element = newFromElement;
            fromLoc.offset = newFromOffset;
        }

        if ( newToElement ) {
            toLoc.element = newToElement;
            toLoc.offset = newToOffset;
        }

        return newLoc;
    }

    /**
     * Returns the elements inside the given range. The text of the elements is truncated to reflect the range.
     * @param {*} fromLoc
     * @param {*} toLoc
     * @returns {array} The elements inside the range.
     */

    public getRange( fromLoc: ITextCursor, toLoc: ITextCursor ): Array<ITextElement>
    {
        let elements:Array<ITextElement> = new Array<ITextElement>();

        for( let i = 0; i < this.elements.length; ++i )
        {
            let el = this.elements[i];

            if ( this.isElementInsideRange( el, fromLoc.element, toLoc.element ) )
            {
                if ( el !== fromLoc.element && el !== toLoc.element )
                {
                    elements.push( el );
                }
                else
                if ( el === fromLoc.element && el === toLoc.element )
                {
                    if ( fromLoc.offset === 0 && toLoc.offset === el.text.length )
                    {
                        // --- The whole element is selected
                        elements.push( el );
                    } else {
                        let text = el.text;
                        let element = this.createElement( el.font );
                        element.text = text.substr( fromLoc.offset, toLoc.offset - fromLoc.offset );
                        elements.push( element );
                    }
                } else
                if ( el === fromLoc.element )
                {
                    let text = el.text;
                    let element = this.createElement( el.font );
                    element.text = text.substr( fromLoc.offset, text.length - fromLoc.offset );
                    elements.push( element );
                } else
                if ( el === toLoc.element )
                {
                    let text = el.text;
                    let element = this.createElement( el.font );
                    element.text = text.substr( 0, toLoc.offset );
                    elements.push( element );
                }
            }
        }

        return elements;
    }


    /**
     *
     * @param {object} fromLoc
     * @param {object} toLoc
     */

    public createFontForRange( fromLoc: ITextCursor, toLoc: ITextCursor ) {
        
        let font:ITextFont = {
            attributes : {},
        };

        let set = ( font:ITextFont, elFont:ITextFont, name:string ) => {
            if ( !font[name] ) font[name] = elFont[name];
            else if ( font[name] != elFont[name] ) font[name] = -1;
        };

        let setAttribute = ( font:ITextFont, elFont:ITextFont, name:string ) => {
            if ( font.attributes[name] === undefined ) font.attributes[name] = elFont.attributes[name];
            else if ( font.attributes[name] !== elFont.attributes[name] ) font.attributes[name] = -1;
        };

        for( let i = 0; i < this.elements.length; ++i )
        {
            let el = this.elements[i];

            if ( this.isElementInsideRange( el, fromLoc.element, toLoc.element ) )
            {
                let elFont:ITextFont = el.font;

                set( font, elFont, "name" );
                set( font, elFont, "text" );
                set( font, elFont, "size" );
                set( font, elFont, "style" );
                if ( elFont.link ) {
                    font.link = Object.assign( {}, elFont.link );
                }
                setAttribute( font, elFont, "bold" );
                setAttribute( font, elFont, "italic" );
            }
        }
        return font;
    }

    /**
     * Clear
     */

    public clear( )
    {
        this.elements = [];
    }


    /**
     * Clean
     */

    public clean( )
    {
        let elements:Array<ITextElement> = [];

        for( let i = 0; i < this.elements.length; ++i )
        {
            let el = this.elements[i];

            if ( el.words ) elements.push( el );
        }
        this.elements = elements;
    }


    /**
     * Parses the given element and creates an array of words with their prefixes from the element's text.
     */

    public rewordElement( el:ITextElement )
    {
        el.words = [];
        el.maxWordHeight = 0;
        el.maxAscent = 0;
        el.maxDescent = 0;

        let prefix = "";
        let word = "";

        let pushWord = ( prefix:string, word:string, offset:number ) => {

            let obj:ITextSectionFormat = { prefix : prefix, word : word, lineBreak : false };

            obj.prefixMetrics = this.ctx.measureText( prefix, el.font.text );
            obj.wordMetrics = this.ctx.measureText( word, el.font.text );

            // --- Calculate offset into the elements text
            obj.offset = offset;
            if ( prefix.length ) obj.offset -= prefix.length;
            if ( word.length ) obj.offset -= word.length;
            obj.endOffset = offset;

            obj.width = obj.prefixMetrics.width + obj.wordMetrics.width;
            obj.height = Math.max( obj.prefixMetrics.height, obj.wordMetrics.height );

            el.maxAscent = Math.max( el.maxAscent, obj.wordMetrics.ascent );
            el.maxDescent = Math.max( el.maxDescent, obj.wordMetrics.descent );

            obj.text = prefix + word;

            el.words.push( obj );
        };

        let pushLineBreak = () => {
            el.words.push( { lineBreak : true } );
        };

        for ( let i = 0; i < el.text.length; ++i )
        {
            let c = el.text.charAt( i );

            if ( c === ' ' )
            {
                if ( word.length ) {
                    pushWord( prefix, word, i );
                    prefix = ""; word = "";
                }
                prefix += c;
            } else
            if ( c == '\n' )
            {
                if ( prefix.length || word.length )
                    pushWord( prefix, word, i );

                pushLineBreak();
                prefix = ""; word = "";
            }
            else word += c;
        }

        if ( prefix.length || word.length )
            pushWord( prefix, word, el.text.length );
    }

}