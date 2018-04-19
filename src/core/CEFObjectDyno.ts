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

import { CEFRoot }		from "./CEFRoot";
import { CEFTutorRoot } from "./CEFTutorRoot";
import { CEFObject } 	from "./CEFObject";
import { CEFScene } 	from "./CEFScene";

import { ILogManager } 	from "../managers/ILogManager";

import { CUtil } 		from "../util/CUtil";

import DisplayObject 		  = createjs.DisplayObject;


/**
 *  This is a simple dynamic CEFObject to allow for on the fly property creation
 *  Added to support Table creation as a CEFObject
 * 
 *  This was added purely to support 'parentScene' initialization for scripting 
 * 
 *  TODO: Create a better way of dealing with parentScene - which would really better be called - executionContext
 * 
 */ 
export class CEFObjectDyno extends CEFRoot
{
	public objID:string;										// Automation ID - unique ID 

	
	constructor()
	{
		super();
	}
	
	public initAutomation(_parentScene:CEFScene, sceneObj:Object, ObjIdRef:string, lLogger:ILogManager, lTutor:CEFTutorRoot) : void
	{								
		if(this.traceMode) CUtil.trace("CEFObjectDyno initAutomation:");						
		
		// parse all the component objects - NOTE: everything must be derived from CWOZObject
		//
		var subObj:DisplayObject;
		var wozObj:CEFObject;
		
		this.objID = ObjIdRef+name;					// set the objects ID
		
		for(var i1:number = 0 ; i1 < this.numChildren ; i1++)
		{
			subObj = this.getChildAt(i1) as DisplayObject;
			
			// Have Object determine its inplace size
			//
			if(subObj instanceof CEFObject || subObj instanceof CEFObjectDyno)
			{					
				//## Mod Apr 14 2014 - maintain linkage to parent scene - used for D.eval execution context - e.g. button script execution
				(subObj as CEFRoot).parentScene = _parentScene;
			}				
		}		 
	}
}