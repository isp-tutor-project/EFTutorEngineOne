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

import { TButton } 	from "../thermite/TButton";
import { CONST } 	from "../util/CONST";

import MovieClip     		  = createjs.MovieClip;


export class CEFLabelButton extends TButton
{
	//************ Stage Symbols
	
	public SLabel:MovieClip;
	
	//************ Stage Symbols
	
	
	
	public CEFLabelButton():void
	{
		//trace("CEFLabelButton:Constructor");
	}
	
	
	public setLabel(newLabel:string) : void
	{
		// this.SLabel     = newLabel;			
	}		
			
}
