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



export class CEFEvent extends Event
{				
	public static readonly ENTER_FRAME:string 		 = "enterFrame";
	public static readonly ADDED_TO_STAGE:string 	 = "added";
	public static readonly REMOVED_FROM_STAGE:string = "removed";
	public static readonly MOTION_FINISH:string		 = "complete";

	public static readonly CHANGE:string		 = "change";
	public static readonly COMPLETE:string		 = "complete";
	
	public tarObjID:string;		// CEFObject ID - Used for automation logging

	constructor(TarObjID:string, type:string, bubbles:boolean = false, cancelable:boolean = false )
	{
		super(type, bubbles, cancelable);
		
		this.tarObjID = TarObjID;
	}

	/**	
	* Creates and returns a copy of the current instance.	
	* @return A copy of the current instance.		
	*/		
	public clone():Event		
	{
		CUtil.trace("cloning WOZEvent:");
		
		return new CEFEvent(this.tarObjID, this.type, this.bubbles, this.cancelable );		
	}
	
	
//*************** Logging state management

	public captureLogState(obj:any = null) : Object
	{
		if(obj == null) obj = new Object;
		
		obj['target']     = this.tarObjID;
		obj['type']       = this.type;
		obj['bubbles']    = this.bubbles; 
		obj['cancelable'] = this.cancelable;
		
		return obj;
	}		
			
	public captureXMLState() : string
	{
		var xmlVal:string = "<CEFEvent target={tarObjID} type={type} bubbles={bubbles} cancelable={cancelable}/>";

		return xmlVal;
	}		

	public restoreXMLState(xmlState:string) : void
	{
	}		
	
	public compareXMLState(xmlState:string) : boolean
	{
		return false;
	}		
	
//*************** Logging state management
	

	public trace(message:string|string[]) : void {

		let fullMessage:string = "";

		if(Array.isArray(message)) {

			 for(let item of message) {
				
				fullMessage += fullMessage.concat(item," ");
			}

			console.log(fullMessage); 
		}
		else {
			fullMessage = message;
		}

		console.log(fullMessage); 
	}


}

