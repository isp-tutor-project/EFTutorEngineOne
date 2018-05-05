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

import { CUtil } 	from "../../util/CUtil";

import MouseEvent = createjs.MouseEvent;

export class TMouseEvent extends MouseEvent
{		
	public tarObjID:string;		// CEFObject ID - Used for automation logging

	public localX:number;
	public localY:number;

	static readonly MOUSE_OVER:string 	= "rollover";
	static readonly MOUSE_OUT:string 	= "rollout";
	static readonly MOUSE_DOWN:string 	= "mousedown";
	static readonly MOUSE_CLICK:string 	= "pressup";


	static readonly MOUSE_MOVE:string 		= "mousemove";			// Click event from the button 
	static readonly MOUSE_UP:string 		= "mouseup";			// Click event from the button 
	static readonly DOUBLE_CLICK:string 	= "dblclick";			// Click event from the button 

	static readonly CLICK:string 		= "click";					// Click event from the button 
			
	static readonly WOZCLICK:string 	= "WOZMOUSE_CLICK";			// Click event from the button 
	static readonly WOZCLICKED:string 	= "WOZMOUSE_CLICKED";		// Click event from the Hardware mouse
	static readonly WOZDBLCLICK:string 	= "WOZMOUSE_DBLCLICKED";	// Click event from the Hardware mouse
	static readonly WOZMOVE:string 		= "WOZMOUSE_MOVE";
	static readonly WOZDOWN:string 		= "WOZMOUSE_DOWN";
	static readonly WOZUP:string 		= "WOZMOUSE_UP";
	static readonly WOZOVER:string 		= "WOZMOUSE_OVER";
	static readonly WOZOUT:string 		= "WOZMOUSE_OUT";
	static readonly WOZKEYDOWN:string 	= "WOZKEY_DOWN";
	static readonly WOZKEYUP:string		= "WOZMKEY_UP";
	static readonly WOZNULL:string		= "WOZNULL";

	constructor(TarObjID:string, type: string, bubbles: boolean, cancelable: boolean, stageX: number, stageY: number, nativeEvent: NativeMouseEvent, pointerID: number, primary: boolean, rawX: number, rawY: number)
	{
		super( type, bubbles, cancelable, stageX, stageY, nativeEvent, pointerID, primary, rawX, rawY);
	}

	/**	
	* Creates and returns a copy of the current instance.	
	* @return A copy of the current instance.		
	*/		
	public clone():TMouseEvent		
	{
		CUtil.trace("cloning MouseEvent:");
		
		return new TMouseEvent(this.tarObjID, this.type, this.bubbles, this.cancelable, this.stageX, this.stageY, this.nativeEvent, this.pointerID, this.primary, this.rawX, this.rawY);		
	}
		
	//*************** Logging state management

	public captureLogState(obj:any = null) : any
	{

		obj['event']  	= 'TMouseEvent';
		obj['tarObjID'] = this.tarObjID; 		
		obj['localX'] 	= this.localX; 
		obj['localY'] 	= this.localY;

		return obj;											   
	}				

	public captureXMLState() : any
	{		
		var eventState:any = {};
				
		// eventState.appendChild(super.captureXMLState());
														
		return eventState;											   
	}		

	public restoreXMLState(xmlState:any) : void
	{
	}		

	public compareXMLState(xmlState:any) : Boolean
	{
		var bTest:Boolean = true;

		return bTest;			
	}		

	//*************** Logging state management
}

