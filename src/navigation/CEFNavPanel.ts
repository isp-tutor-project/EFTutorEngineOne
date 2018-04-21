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

import { CEFTutorRoot } 		from "../core/CEFTutorRoot";
import { CEFSceneNavigator } 	from "../core/CEFSceneNavigator";
import { CEFScene } 			from "../core/CEFScene";
import { CEFObject } 			from "../core/CEFObject";
import { CEFRoot } 				from "../core/CEFRoot";

import { ILogManager } 			from "../managers/ILogManager";

import { CUtil } 				from "../util/CUtil";

import DisplayObject 		  = createjs.DisplayObject;




export class CEFNavPanel extends CEFSceneNavigator
{	
	
	
	constructor() 
	{
		super();

		this.traceMode = false;

		if(this.traceMode) CUtil.trace("CEFNavPanel:Constructor");
		
		this.sceneCurr = 0;
		this.scenePrev = 0;
	}
	
//***************** Automation *******************************		

	public initAutomation(_parentScene:CEFScene, scene:any, ObjIdRef:String, lLogger:ILogManager, lTutor:CEFTutorRoot) : void
	{								
		// parse all the component objects - NOTE: everything must be derived from CEFObject
		//
		var sceneObj:DisplayObject;
		var wozObj:CEFObject;
		var wozRoot:CEFRoot;
		
		this.objID = ObjIdRef+name;					// set the objects ID
		
		for(var i1:number = 0 ; i1 < this.numChildren ; i1++)
		{
			sceneObj = this.getChildAt(i1) as DisplayObject;
			
			scene[sceneObj.name] = {};
			scene[sceneObj.name].instance = sceneObj;										

			if(this.traceMode) CUtil.trace("\t\tCEFNavPanel found subObject named:" + sceneObj.name + " ... in-place: ");
			
			// Recurse WOZ Children
			//
			if(sceneObj instanceof CEFObject)				
			{
				wozObj = sceneObj as CEFObject;				// Coerce the Object					
				wozObj.initAutomation(_parentScene, scene[sceneObj.name], this.objID + ".", lLogger, lTutor);
			}
		}		 
	}

	// Walk the WOZ Objects to initialize their automation mode
	//
	public setObjMode(TutScene:any, sMode:String) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start - Walking Top Level Nav Objects***");

		for(var sceneObj in TutScene)
		{			
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject)
			{
				TutScene[sceneObj].instance.setAutomationMode(TutScene[sceneObj], sMode );										
			}					
		}		
		if(this.traceMode) CUtil.trace("\t*** End - Walking Top Level Nav Objects***");
	}
	
//***************** Automation *******************************		

//***************** Debug *******************************		
		
	public dumpSceneObjs(TutScene:any) : void
	{							
		for(var sceneObj in TutScene)
		{
			if(this.traceMode) CUtil.trace("\tNavPanelObj : " + sceneObj);
			
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject)
			{
				if(this.traceMode) CUtil.trace("\tCEF***");
				
				TutScene[sceneObj].instance.dumpSubObjs(TutScene[sceneObj], "\t");										
			}					
		}		
	}

//***************** Debug *******************************		
	
}
