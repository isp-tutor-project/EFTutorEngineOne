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


export interface ITextFont {

    [key: string]: any;

    name?: string;
    size?: number;
    attributes?: ITextAttributes;
    style?: string;
    text?: string;

    link?: string;
}


export interface ITextTag {

    name: string;
    size: number;
}


export interface ITextCursor {

    x?: number;
    y?: number;

    offset?: number;
    line?: ITextLine;

    element?: ITextElement;
}


export interface ITextAttributes {

    [key: string]: any;

    bold?: boolean;
    italic?: boolean;
}


export interface ITextElement {

    text: string;
    font: ITextFont;
    words: Array<ITextSectionFormat>;

    maxWordHeight?: number;
    maxAscent?: number;
    maxDescent?: number;
}


export interface ITextSectionFormat {

    prefix?: string;
    word?: string;
    lineBreak?: boolean;
    wrapped?: boolean;

    prefixMetrics?: TextMetrics;
    wordMetrics?: TextMetrics;

    offset?: number;
    endOffset?: number;

    width?: number;
    height?: number;

    text?: string;
    element?: ITextElement;
    
}

export interface ITextLine {

    words: Array<ITextSectionFormat>;
    maxHeight: number;
    maxAscent: number;
    maxDescent: number;
    maxWidth: number;
    offset: number;
    symbol: string;

}