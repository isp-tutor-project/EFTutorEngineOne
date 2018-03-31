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

import Event = createjs.Event;

import { CUtil } from "../util/CUtil";
import { CEFEvent } from "./CEFEvent";



export class CEFTextEvent extends CEFEvent
{
	
	public static readonly WOZSETSELECTION:string 	= "wozSetSelection";		// Click event from the button 
	public static readonly WOZSETSCROLL:string 	= "wozSetScroll";			// Click event from the Hardware mouse
	public static readonly WOZINPUTTEXT:string 	= "wozInputText";
	public static readonly WOZCAPTUREFOCUS:string 	= "wozCaptureFocus";
	public static readonly WOZRELEASEFOCUS:string 	= "wozReleaseFocus";

	public textdata:string;
	public index1:number;
	public index2:number;
			
	constructor(TarObjID:string, Type:string, Index1:number = 0, Index2:number = 0, TextData:string = "", Bubbles:boolean = false, Cancelable:boolean = false)
	{
		super(TarObjID, Type, Bubbles, Cancelable);
		
		this.textdata = TextData;
		this.index1   = Index1;
		this.index2   = Index2;
	}

	/**	
	* Creates and returns a copy of the current instance.	
	* @return A copy of the current instance.		
	*/		
	public clone():Event		
	{
		CUtil.trace("cloning CEFTextEvent:");
		
		return new CEFTextEvent(this.tarObjID, this.type, this.index1, this.index2, this.textdata, this.bubbles, this.cancelable );		
	}
		
}
