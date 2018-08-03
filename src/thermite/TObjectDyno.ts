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

import { TRoot }			from "./TRoot";
import { TObject } 			from "./TObject";
import { TSceneBase } 		from "./TSceneBase";

import { TTutorContainer } from "./TTutorContainer";

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
export class TObjectDyno extends TRoot
{
	public objID:string;										// Automation ID - unique ID 

	
	constructor()
	{
		super();
	}

	
	/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
	/* ######################################################### */

	public TObjectDynoInitialize() {
        this.TRootInitialize.call(this);

        this.init1();
    }

    public initialize() {
        this.TRootInitialize.call(this);
		
        this.init1();
    }

    private init1() {
    }

	/* ######################################################### */
	/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */

	


	public initAutomation(_parentScene:TSceneBase, sceneObj:Object, ObjIdRef:string, lLogger:ILogManager, lTutor:TTutorContainer) : void
	{								
		if(this.traceMode) CUtil.trace("CEFObjectDyno initAutomation:");						
		
		// parse all the component objects - NOTE: everything must be derived from CEFObject
		//
		var subObj:DisplayObject;
		var wozObj:TObject;
		
		this.objID = ObjIdRef+name;					// set the objects ID
		
		for(var i1:number = 0 ; i1 < this.numChildren ; i1++)
		{
			subObj = this.getChildAt(i1) as DisplayObject;
			
			// Have Object determine its inplace size
			//
			if(subObj instanceof TObject || subObj instanceof TObjectDyno)
			{					
				//## Mod Apr 14 2014 - maintain linkage to parent scene - used for D.eval execution context - e.g. button script execution
				(subObj as TRoot).parentScene = _parentScene;
			}				
		}		 
	}
}