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

//** Imports

import { CUtil } 			from "../util/CUtil";

import { CEFObject } from "../core/CEFObject";

import MovieClip     	  = createjs.MovieClip;
import TextField     	  = createjs.Text;

/**
* ...
*/
export class CEFLabelControl extends CEFObject
{
	//************ Stage Symbols
	
	public Slabel:TextField;
	
	//************ Stage Symbols
	
	constructor() 
	{
		super();
	}
	
	public setLabel(newLabel:String, colour:number = 0x000000) : void
	{
		// let format:TextFormat = new TextFormat();
		
		// format.font = "Arial";
		// format.bold = true;
		// format.color = colour;
		// format.size = 22;

		// this.Slabel.defaultTextFormat = format;			
		// this.Slabel.text = newLabel;			
	}		
			
	
}
