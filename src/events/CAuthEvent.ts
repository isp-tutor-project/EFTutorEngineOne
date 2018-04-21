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

import { CEFEvent } from "./CEFEvent";
import { CUtil } 	from "../util/CUtil";

import Event = createjs.Event;


	
export class CAuthEvent extends Event
{	
	// event types		
	
	public static readonly AUTH_STATUS:string		= "auth_status";
	
	// subtypes
	
	public static readonly AUTH_ADMIN:string	   	= "auth_admin";
	public static readonly AUTH_USER:string    		= "auth_user";

	public static readonly BOOTLDR_SUCCESS:string	= "bootldr_success";
	public static readonly BOOTLDR_FAILED:string	= "bootldr_failed";		
	public static readonly BOOTLDR_CANCELLED:string= "bootldr_cancelled";
			
	public static readonly GROUPID_SUCCESS:string	= "groupid_success";
	public static readonly GROUPID_FAILED:string	= "groupid_failed";		
	public static readonly GROUPID_CANCELLED:string	= "groupid_cancelled";
	
	public static readonly AUTH_SUCCESS:string	 	= "auth_success";
	public static readonly AUTH_FAILED:string	 	= "auth_failed";		
	public static readonly AUTH_CANCELLED:string	= "auth_cancelled";
	
	public static readonly LOADER_SUCCESS:string	= "loader_success";
	public static readonly LOADER_FAILED:string 	= "loader_failed";				
	public static readonly LOADER_CANCELLED:string	= "loader_cancelled";
	
	public static readonly SUCCESS:string		 	= "success";
	public static readonly VALIDATE:string	  		= "validate";
	public static readonly FAIL:string	 			= "fail";
	
	
	private traceMode:boolean = false;
	
	// Event Parms
	
	public subType:string;
	public dataPacket:Object;
	
	
	constructor(type:string = CAuthEvent.SUCCESS, _subType:string = null, _dataPacket:Object=null, bubbles:boolean = false, cancelable:boolean = false ) 
	{
		super(type, bubbles, cancelable);
		
		this.subType 	 = _subType;
		this.dataPacket  = _dataPacket;
	}
	
	/**	
	 * Creates and returns a copy of the current instance.	
	 * @return A copy of the current instance.		
	 */		
	public clone():Event		
	{
		if(this.traceMode) CUtil.trace("cloning CAuthEvent:");
		
		return new CAuthEvent(this.type, this.subType, this.dataPacket, this.bubbles, this.cancelable );		
	}
	
}
