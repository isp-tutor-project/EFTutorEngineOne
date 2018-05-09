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

import { IEFTutorDoc } from "./IEFTutorDoc";

import { TRoot } 			from "../thermite/TRoot";
import { TObject } 			from "../thermite/TObject";
import { TObjectMask } 		from "../thermite/TObjectMask";
import { TTutorContainer } 	from "../thermite/TTutorContainer";

import { CEFTimeLine } 		from "../core/CEFTimeLine";
import { CEFEvent } 		from "../events/CEFEvent";

import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";

import Tween    		  	= createjs.Tween;
import Timeline   		  	= createjs.Timeline;
import Event    		  	= createjs.Event;
import DisplayObject 		= createjs.DisplayObject;
import Ease			  	    = createjs.Ease;




export class CEFTransitions extends CEFTimeLine 
{	
	// There are N scenes in any given app
	// Each scene represents a different step in the tutoring process
	// and has an array of tweens that set the stage context for the scene itelf.
	//	 
	public currScene:string = null;				// null initial scene
	public newScene:string  = null;				// null next scene
	
	public rTime:number     = .25;				// Removal Transition time
	public tTime:number     = .25;				// Normal Transition time

	public fSingleStep:boolean = true;			// single stepping operations - debug

	private activeObjs:any  = {};				// Pointers to the objects in the most recent scene + persistent ojects
	private persistObjs:any = {};				// Pointers to persistent objects - these live thorughout the tutor lifecycle
	private currentObjs:Array<any>;				// Pointers to the objects in the current scene
	private fSwapObjects:boolean = false;		// flag - true - swap objects  - false - use deep state copy 

	private timeLine:Timeline;
	
	
	constructor(_tutorDoc:IEFTutorDoc)
	{
		super(_tutorDoc);

		this.traceMode = true;
		if(this.traceMode) CUtil.trace("CEFTransitions:Constructor");						
    }


	public connectToTutor(parentTutor:TTutorContainer, autoTutor:Object) : void
	{
		this.tutorAutoObj = autoTutor;		
		this.activeObjs   = {};				// Start with an empty activeObj - nothing currently on stage									
	}
	
	//## Mod Oct 29 2012 - Support for scene reentry in demo mode. 
	//
	public resetTransitions() : void 
	{
		this.activeObjs = {};
	}
	
	
	//////////////////////////////////////////////////////////////
	// Function: walkTweens
	//
	//  Description: 
	//			debug
	//
	// Parameters: event
	//
	// returns: NULL
	//		
	public walkTweens() : void
	{			
		let i1:number;
	
		if(this.traceMode) CUtil.trace("Tween Enumeration for Scene: ", this.currScene);
		
		for(i1 = 0 ; i1 < this.Running.length ; i1++)
		{			
			if(this.traceMode) CUtil.trace("Object Value: ", this.Running[i1].obj);
		}
	}				

	
	//////////////////////////////////////////////////////////////
	// Function: gotoScene - 
	//
	//  Description: 
	//			transition to another scene
	//
	// Parameters: event
	//
	// returns: NULL
	//		
	public gotoScene(scn:string) : void
	{					
		if(this.traceMode) CUtil.trace("Goto Scene: ", scn);
	
		// Use single Stepping 
		//
		this.fSingleStep = false;						
	
		// Ensure there are no active transitions
		this.stopTransitions();
		
		// Set the index of the target scene
		//
		this.newScene = scn;	
		
		if(this.currScene != null)
		{
			this.timeLine = new Timeline(null,null, {useTicks:true, loop:-1, paused:true});
			this.setTransitionOUT();	
			
			if(this.Running.length)
				this.startTransition(this.outFinished);				
				
			else 
			{
				this.setTransitionIN(this.tutorAutoObj, this.newScene);	
				this.changeScene();
				this.startTransition(this.inFinished);	
				
				// Catch special case where there are no tweens
				
				if(!this.started) 
					this.inFinished();
			}
		}
		else
		{
			this.setTransitionIN(this.tutorAutoObj, this.newScene);	
			this.changeScene();
			this.startTransition(this.inFinished);				
		}
	}				
	
	
	//////////////////////////////////////////////////////////////
	// Function: setTransitionOUT
	//
	//  Description: 
	//			setup the Running array for the OUT transition
	//
	// Parameters: event
	//
	// returns: NULL
	//		
	public setTransitionOUT() : void
	{			
		let bMatch:boolean;
		let targObj:any;
		let tween:Tween;
	
		// look for objects that are not in the new scene but are in current
		//
		if(this.currScene != null) for(let sceneObj of this.tutorAutoObj[this.currScene])
		{				
			bMatch = false;
			
			// Don't tween the instances
			//
			if(sceneObj == "instance") continue;
			
			// we can exit to a null scene just to get everything off screen
			//
			if(this.newScene != null)
			{	
				// If object exists in the new scene, then:
				//  	1: If it is CEF and the xnames match then they are the same
				//		2: If they are non-WOZ then they match by default
				//
				if (this.tutorAutoObj[this.newScene][sceneObj] != undefined)
				{
					if (this.tutorAutoObj[this.currScene][sceneObj].instance instanceof TObject)
					{
						if(this.traceMode) CUtil.trace("newObject: " + this.tutorAutoObj[this.newScene][sceneObj].instance.xname);
						if(this.traceMode) CUtil.trace("oldObject: " + this.tutorAutoObj[this.currScene][sceneObj].instance.xname);
						
						if (this.tutorAutoObj[this.newScene][sceneObj].instance.xname == this.tutorAutoObj[this.currScene][sceneObj].instance.xname )
																															bMatch = true;
					}
					else 
						bMatch = true;
				}
				
			}
			
			// This object in the current scene does not exist in the new scene
			//
			if(!bMatch)
			{			
				if(this.traceMode) CUtil.trace("setTransitionOUT: " + this.tutorAutoObj[this.currScene][sceneObj].instance.name);
				
				targObj = this.tutorAutoObj[this.currScene][sceneObj];			// Convenience Copy	
				
				// we are going to turn "off" the object
				// Run the alpha tween from the current alpha to ZERO to remove the object
				//
				tween = new Tween(targObj.instance).to({alpha:0}, Number(this.rTime), Ease.cubicInOut)
										
				// push the tween on to the run stack
				//
				this.Running.push(tween);
			}				
		}
	}				
		
	
	//////////////////////////////////////////////////////////////
	// Function: setTransitionIN
	//
	//  Description: 
	//			setup the Running array for the IN transition
	//
	// Parameters: event
	//
	// returns: NULL
	//		
	public setTransitionIN(objectList:any, objectName:string ) : void
	{		
		let targObj:any;
		let liveObj:DisplayObject;
		let tween:Tween;
		let xname:string;
		
		// always start the current Object array from scratch
		
		this.currentObjs = new Array;
		
		// First iniitalize all the newscene objects tweenable properties to match the live version of the objects.
		//
		// NOTE: The WOZ environment treats all objects with the same name as the same instances so that scenes
		//       may be edited individually in Flash but treated as part of a single timeline in the WOZ environment
		//
		for(let namedObj in objectList[objectName])
		{
			// Exclude the instance property of the scene itself
			
			if(namedObj != "instance")
			{
				// Convenience Copy
				
				targObj = objectList[objectName][namedObj];
				
				// Skip WOZ objects that aren't to be tweened
				// Use the namedObj to disinguish unique instances
				//
				if(targObj.instance instanceof TObject)
				{
					if(!targObj.instance.isTweenable())
												continue;
					
					// use the xname to identify unique instances
					
					xname = targObj.instance.xname;
				}
				else 
					xname = namedObj;
				
				
				// If matching object has been onscreen before copy its properties
				// Note that all unique objects in a movie must have a unique name even across scenes(CEFScenes)
				//
				if(this.activeObjs[xname] != undefined)
				{
					// Convenience Copy
					//
					liveObj = this.activeObjs[xname];
					
					// note that swapping and sub-tweening are mutually exclusive 
					//
					if(this.fSwapObjects)
					{
						// Get the objects
						
						let dO1:DisplayObject = this.tutorAutoObj[this.currScene][namedObj].instance;
						let dO2:DisplayObject = this.tutorAutoObj[this.newScene][namedObj].instance;
						
						// Get their locations in the display list
						// TODO: fix gTutor reference
						
						// let dI1:number = this.tutorDoc.tutorContainer[this.currScene].getChildIndex(dO1);
						// let dI2:number = this.tutorDoc.tutorContainer[this.newScene].getChildIndex(dO2);
						
						// Swap them in the scenes display lists
						
						// this.tutorDoc.tutorContainer[this.currScene].addChildAt(dO2, dI1 );
						// this.tutorDoc.tutorContainer[this.newScene].addChildAt(dO1, dI2);
						
						// Swap the instances in the TutorObj
						
						this.tutorAutoObj[this.currScene][namedObj].instance = dO2;
						this.tutorAutoObj[this.newScene][namedObj].instance  = dO1;
						
						// update the convenience copy
						
						targObj = objectList[objectName][namedObj];									
					}
					else
					{
						// If it is a WOZ object do a deep copy of its internal state
						// We assume all named WOZ Objects are WOZ in all instances
						//
						if((liveObj instanceof TObject) && (targObj.instance.tweenID == liveObj.tweenID))
						{				
//								if(xname == "CCRSOLCAT1TBL2")						//@@ debug
//													CUtil.trace("table2 hit");			//@@ debug			
							
							targObj.instance.deepStateCopy(liveObj);
						}
						// Otherwise just take its x.y.width.height.alpha
						//
						else 
							this.shallowStateCopy(targObj.instance, liveObj);					
					}
					
					
					// Now that the object is initialized - check if its in-place properties are different from its current state
					// indicating the need for a tween.
					//
					if(targObj.inPlace.X != liveObj.x)
					{
						
						tween = new Tween(targObj.instance).to({x:targObj.inPlace.X}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + targObj.name + " property: " + targObj.prop + " in: " + tween.duration + "secs");
						
						// push the tween on to the run stack
						//
						this.Running.push(tween);						
					}
					if(targObj.inPlace.Y != liveObj.y)
					{
						tween = new Tween(targObj.instance).to({y:targObj.inPlace.Y}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + targObj.name + " property: " + targObj.prop + " in: " + tween.duration + "secs");
												
						// push the tween on to the run stack
						//
						this.Running.push(tween);						
					}
					// if(targObj.inPlace.Width != liveObj.width)		//** TODO */
					// {
					// 	tween = new Tween(targObj.instance, "width", Cubic.easeInOut, targObj.instance.width, targObj.inPlace.Width, tTime, true );
					// 	if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + tween.obj.name + " property: " + tween.prop + " from: " + tween.begin + "  to : " + tween.finish + " in: " + tween.duration + "secs");
						
					// 	// push the tween on to the run stack
					// 	//
					// 	this.Running.push(tween);						
					// }
					// if(targObj.inPlace.Height != liveObj.height)
					// {
					// 	tween = new Tween(targObj.instance, "height", Cubic.easeInOut, targObj.instance.height, targObj.inPlace.Height, tTime, true );
					// 	if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + tween.obj.name + " property: " + tween.prop + " from: " + tween.begin + "  to : " + tween.finish + " in: " + tween.duration + "secs");
						
					// 	// push the tween on to the run stack
					// 	//
					// 	this.Running.push(tween);						
					// }
					if(targObj.inPlace.Alpha != liveObj.alpha)
					{
						tween = new Tween(targObj.instance).to({alpha:targObj.inPlace.Alpha}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + targObj.name + " property: " + targObj.prop + " in: " + tween.duration + "secs");

						// push the tween on to the run stack
						//
						this.Running.push(tween);						
					}
					
				}
				
				// Otherwise just set tweens to bring the objects on screen from 0 alpha
				else
				{
					// Run the alpha tween from ZERO to bring the object on stage
					//
					if(!(targObj.instance instanceof TObjectMask))
											targObj.instance.alpha = 0;
					
					// Generate the tween
					//
					tween = new Tween(targObj.instance).to({alpha:targObj.inPlace.Alpha}, this.tTime, Ease.cubicInOut);
					if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + targObj.name + " property: " + targObj.prop + " in: " + tween.duration + "secs");
					
					// push the tween on to the run stack
					//
					this.Running.push(tween);
				}					
			
									
				// Check for persistent objects and subtweening			

				if(targObj.instance instanceof TObject)
				{
					// Make object visible
					//
					if(!targObj.instance.hidden)
						targObj.instance.visible = true;
					
					// Record any persistent objects
					
					if(targObj.instance.bPersist)
					{
						this.persistObjs[xname] = targObj.instance;
					}
					else
					{
						// If not WOZobject add it to the currentObjs - we don't want persistent objects duplicated
						
						this.currentObjs.push(new Array(xname,targObj.instance));													
					}
					
					// Recurse any objects that require subobject tweening - tables etc
					
					if(targObj.instance.isSubTweenable())
					{
						if(this.traceMode) CUtil.trace("SubTweening : " + targObj.instance.name );
						
						this.setTransitionIN(objectList[objectName], namedObj ); 
					}
				}
				else
				{						
					targObj.instance.visible = true;
					
					// If not WOZobject add it to the currentObjs - we don't want persistent objects duplicated
					
					this.currentObjs.push(new Array(xname,targObj.instance));						
				}
			}
		}
		
		// Update the active object with objects from the current scene and persistent objects 
		// Throw away the old activeObj array for GC - keeps the tutor compact
		
		this.activeObjs = {};										
		
		for (let objRec of this.currentObjs)
		{
			this.activeObjs[objRec[0]] = objRec[1];
		}
		
		for (let perObj in this.persistObjs)
		{
			this.activeObjs[this.persistObjs[perObj].xname] = this.persistObjs[perObj];
		}			
	}				
	
	
	//////////////////////////////////////////////////////////////
	// Function: changeScene
	//
	//  Description: 
	//			switch the active scene
	//
	// Parameters: event
	//
	// returns: NULL
	//		
	public changeScene() : void
	{		
		// switch the visible scene
		//  
		if(this.currScene)
			this.tutorAutoObj[this.currScene].instance.visible = false;

		this.tutorAutoObj[this.newScene].instance.visible  = true;
		
		// From this point on all newScene elements will be visible so proceed 
		// as if it is the currScene.
		//  
		this.currScene = this.newScene;		
	}				
	
	
	//////////////////////////////////////////////////////////////
	// Function: shallowStateCopy
	//
	//  Description: 
	//			only copy superficial features
	//
	// Parameters: event
	//
	// returns: NULL
	//		
	public shallowStateCopy(tar:DisplayObject, src:DisplayObject ) : void
	{			
		tar.x      = src.x;
		tar.y      = src.y;
		tar.alpha  = src.alpha;			
	}				

	
	/**
	 * default behavior to hide objects as they go offscreen
	 */
	public xnFinished(evt:any ) : void
	{				
		if (evt.currentTarget.obj.alpha == 0)
					evt.currentTarget.obj.visible = false;
		
		super.xnFinished(evt);
	}					
	
	
	/**
	 * Object specific finalization behaviors - invoked through  reference in xnFinished
	 */
	public outFinished() : void
	{			
		CUtil.trace("outFinished" );
		
		//gTutor.enumScenes();						//@@ Debug display list Test Oct 29 2012
		
		if(!this.fSingleStep)							// Debug
		{
			// When the tutor terminates there may not be a new scene to go to.
			
			if(this.newScene)
			{
				if(this.tutorAutoObj[this.newScene].instance.visible == false)
				{				
					this.setTransitionIN(this.tutorAutoObj,this.newScene);	// setup the Running array for the in transition
				}
				
				this.changeScene();
				this.startTransition(this.inFinished);			// start it up
			}
		}
		else
			this.dispatchEvent(new Event(CEFEvent.CHANGE,false,false));
			
	}				
	
	/**
	 * Object specific finalization behaviors - invoked through  reference in xnFinished
	 */
	public inFinished() : void
	{			
		CUtil.trace("inFinished");
	
		this.currScene = this.newScene;
		this.dispatchEvent(new Event(CEFEvent.COMPLETE,false,false));
	}				
			
}
	
