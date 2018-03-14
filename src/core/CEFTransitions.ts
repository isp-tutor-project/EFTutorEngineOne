//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2008 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CEFTransitions.as
//                                                                        
//  Purpose:   CEFTransitions object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Apr 21 2008  
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

import { CEFAnimator } 	from "./CEFAnimator";
import { CUtil } 		from "../util/CUtil";
import { CEFTutorRoot } from "./CEFTutorRoot";

import Tween    		  = createjs.Tween;




export class CEFTransitions extends CEFAnimator 
{	
	// There are N scenes in any given app
	// Each scene represents a different step in the tutoring process
	// and has an array of tweens that set the stage context for the scene itelf.
	//	 
	public currScene:string = "Sscene0";		// null initial scene
	public newScene:string  = null;				// null next scene
	
	public rTime:Number     = .25;				// Removal Transition time
	public tTime:Number     = .25;				// Normal Transition time

	public fSingleStep:boolean = true;			// single stepping operations - debug

	public prntTutor:Object;					// The parent CEFTutorRoot of these transitions
	public tutorAutoObj:Object;					// The location of this tutor to automation array
	
	private activeObjs:Object  = new Object;	// Pointers to the objects in the most recent scene + persistent ojects
	private currentObjs:Array<any>;				// Pointers to the objects in the current scene
	private persistObjs:Object = new Object;	// Pointers to persistent objects - these live thorughout the tutor lifecycle
	private fSwapObjects:boolean = false;		// flag - true - swap objects  - false - use deep state copy 
	
	
	constructor() : void 
	{
		super();

		this.traceMode = false;
		if(this.traceMode) CUtil.trace("CEFTransitions:Constructor");						
	}	

	
	public connectToTutor(parentTutor:CEFTutorRoot, autoTutor:Object) : void
	{
		this.prntTutor = parentTutor;
		this.tutorAutoObj = autoTutor;
		
		this.activeObjs = new Object;	// Start with an empty activeObj - nothing currently on stage									
	}
	
	//## Mod Oct 29 2012 - Support for scene reentry in demo mode. 
	//
	public resetTransitions() : void 
	{
		this.activeObjs = new Object;
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
		let targObj:Object;
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
				//  	1: If it is CEF and the wozNames match then they are the same
				//		2: If they are non-WOZ then they match by default
				//
				if (this.tutorAutoObj[this.newScene][sceneObj] != undefined)
				{
					if (tutorAutoObj[currScene][sceneObj].instance is CEFObject)
					{
						if(this.traceMode) CUtil.trace("newObject: " + tutorAutoObj[newScene][sceneObj].instance.wozName);
						if(this.traceMode) CUtil.trace("oldObject: " + tutorAutoObj[currScene][sceneObj].instance.wozName);
						
						if (tutorAutoObj[newScene][sceneObj].instance.wozName == tutorAutoObj[currScene][sceneObj].instance.wozName )
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
				if(this.traceMode) CUtil.trace("setTransitionOUT: " + tutorAutoObj[currScene][sceneObj].instance.name);
				
				targObj = tutorAutoObj[currScene][sceneObj];			// Convenience Copy	
				
				// we are going to turn "off" the object
				// Run the alpha tween from the current alpha to ZERO to remove the object
				//
				tween = new Tween(targObj.instance, "alpha", Cubic.easeInOut, targObj.instance.alpha, 0, rTime, true );
										
				// push the tween on to the run stack
				//
				Running.push(tween);
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
	public setTransitionIN(objectList:Object, objectName:string ) : void
	{		
		let targObj:Object;
		let liveObj:DisplayObject;
		let tween:Tween;
		let wozName:string;
		
		// always start the current Object array from scratch
		
		currentObjs = new Array;
		
		// First iniitalize all the newscene objects tweenable properties to match the live version of the objects.
		//
		// NOTE: The WOZ environment treats all objects with the same name as the same instances so that scenes
		//       may be edited individually in Flash but treated as part of a single timeline in the WOZ environment
		//
		for(let namedObj:string in objectList[objectName])
		{
			// Exclude the instance property of the scene itself
			
			if(namedObj != "instance")
			{
				// Convenience Copy
				
				targObj = objectList[objectName][namedObj];
				
				// Skip WOZ objects that aren't to be tweened
				// Use the namedObj to disinguish unique instances
				//
				if(targObj.instance is CEFObject)
				{
					if(!targObj.instance.isTweenable())
												continue;
					
					// use the wozName to identify unique instances
					
					wozName = targObj.instance.wozName;
				}
				else 
					wozName = namedObj;
				
				
				// If matching object has been onscreen before copy its properties
				// Note that all unique objects in a movie must have a unique name even across scenes(CEFScenes)
				//
				if(activeObjs[wozName] != undefined)
				{
					// Convenience Copy
					//
					liveObj = activeObjs[wozName];
					
					// note that swapping and sub-tweening are mutually exclusive 
					//
					if(fSwapObjects)
					{
						// Get the objects
						
						let dO1:DisplayObject = tutorAutoObj[currScene][namedObj].instance;
						let dO2:DisplayObject = tutorAutoObj[newScene][namedObj].instance;
						
						// Get their locations in the display list
						
						let dI1:int = gTutor[currScene].getChildIndex(dO1);
						let dI2:int = gTutor[newScene].getChildIndex(dO2);
						
						// Swap them in the scenes display lists
						
						gTutor[currScene].addChildAt(dO2, dI1 );
						gTutor[newScene].addChildAt(dO1, dI2);
						
						// Swap the instances in the TutorObj
						
						tutorAutoObj[currScene][namedObj].instance = dO2;
						tutorAutoObj[newScene][namedObj].instance  = dO1;
						
						// update the convenience copy
						
						targObj = objectList[objectName][namedObj];									
					}
					else
					{
						// If it is a WOZ object do a deep copy of its internal state
						// We assume all named WOZ Objects are WOZ in all instances
						//
						if((liveObj is CEFObject) && (CEFObject(targObj.instance).tweenID == CEFObject(liveObj).tweenID))
						{				
//								if(wozName == "CCRSOLCAT1TBL2")						//@@ debug
//													CUtil.trace("table2 hit");			//@@ debug			
							
							targObj.instance.deepStateCopy(liveObj);
						}
						// Otherwise just take its x.y.width.height.alpha
						//
						else 
							shallowStateCopy(targObj.instance, liveObj);					
					}
					
					
					// Now that the object is initialized - check if its in-place properties are different from its current state
					// indicating the need for a tween.
					//
					if(targObj.inPlace.X != liveObj.x)
					{
						tween = new Tween(targObj.instance, "x", Cubic.easeInOut, targObj.instance.x, targObj.inPlace.X, tTime, true );
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + tween.obj.name + " property: " + tween.prop + " from: " + tween.begin + "  to : " + tween.finish + " in: " + tween.duration + "secs");
						
						// push the tween on to the run stack
						//
						Running.push(tween);						
					}
					if(targObj.inPlace.Y != liveObj.y)
					{
						tween = new Tween(targObj.instance, "y", Cubic.easeInOut, targObj.instance.y, targObj.inPlace.Y, tTime, true );
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + tween.obj.name + " property: " + tween.prop + " from: " + tween.begin + "  to : " + tween.finish + " in: " + tween.duration + "secs" + " - liveObj.y:" + liveObj.y);
						
						// push the tween on to the run stack
						//
						Running.push(tween);						
					}
					if(targObj.inPlace.Width != liveObj.width)
					{
						tween = new Tween(targObj.instance, "width", Cubic.easeInOut, targObj.instance.width, targObj.inPlace.Width, tTime, true );
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + tween.obj.name + " property: " + tween.prop + " from: " + tween.begin + "  to : " + tween.finish + " in: " + tween.duration + "secs");
						
						// push the tween on to the run stack
						//
						Running.push(tween);						
					}
					if(targObj.inPlace.Height != liveObj.height)
					{
						tween = new Tween(targObj.instance, "height", Cubic.easeInOut, targObj.instance.height, targObj.inPlace.Height, tTime, true );
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + tween.obj.name + " property: " + tween.prop + " from: " + tween.begin + "  to : " + tween.finish + " in: " + tween.duration + "secs");
						
						// push the tween on to the run stack
						//
						Running.push(tween);						
					}
					if(targObj.inPlace.Alpha != liveObj.alpha)
					{
						tween = new Tween(targObj.instance, "alpha", Cubic.easeInOut, targObj.instance.alpha, targObj.inPlace.Alpha, tTime, true );
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + tween.obj.name + " property: " + tween.prop + " from: " + tween.begin + "  to : " + tween.finish + " in: " + tween.duration + "secs");
						
						// push the tween on to the run stack
						//
						Running.push(tween);						
					}
					
				}
				
				// Otherwise just set tweens to bring the objects on screen from 0 alpha
				else
				{
					// Run the alpha tween from ZERO to bring the object on stage
					//
					if(!targObj.instance is CEFObjectMask)
									targObj.instance.alpha = 0;
					
					// Generate the tween
					//
					tween = new Tween(targObj.instance, "alpha", Cubic.easeInOut, targObj.instance.alpha, targObj.inPlace.Alpha, tTime, true );
					
					//objectList[objectName][wozName];
					
					if(this.traceMode) CUtil.trace("Tweening obj in scene: " + objectName + "  named : " + tween.obj.name + " property: " + tween.prop + " from: " + tween.begin + "  to : " + tween.finish + " in: " + tween.duration + "secs");
					
					// push the tween on to the run stack
					//
					Running.push(tween);
				}					
			
									
				// Check for persistent objects and subtweening			

				if(targObj.instance is CEFObject)
				{
					// Make object visible
					//
					if(!targObj.instance.hidden)
						targObj.instance.visible = true;
					
					// Record any persistent objects
					
					if(targObj.instance.bPersist)
					{
						persistObjs[wozName] = targObj.instance;
					}
					else
					{
						// If not WOZobject add it to the currentObjs - we don't want persistent objects duplicated
						
						currentObjs.push(new Array(wozName,targObj.instance));													
					}
					
					// Recurse any objects that require subobject tweening - tables etc
					
					if(targObj.instance.isSubTweenable())
					{
						if(this.traceMode) CUtil.trace("SubTweening : " + targObj.instance.name );
						
						setTransitionIN(objectList[objectName], namedObj ); 
					}
				}
				else
				{						
					targObj.instance.visible = true;
					
					// If not WOZobject add it to the currentObjs - we don't want persistent objects duplicated
					
					currentObjs.push(new Array(wozName,targObj.instance));						
				}
			}
		}
		
		// Update the active object with objects from the current scene and persistent objects 
		// Throw away the old activeObj array for GC - keeps the tutor compact
		
		activeObjs = new Object;										
		
		for each (let objRec in currentObjs)
		{
			activeObjs[objRec[0]] = objRec[1];
		}
		
		for each (let perObj in persistObjs)
		{
			activeObjs[perObj.wozName] = perObj;
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
		tutorAutoObj[currScene].instance.visible = false;
		tutorAutoObj[newScene].instance.visible  = true;
		
		// From this point on all newScene elements will be visible so proceed 
		// as if it is the currScene.
		//  
		currScene = newScene;		
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
		tar.width  = src.width;
		tar.height = src.height;
		tar.alpha  = src.alpha;			
	}				

	
	/**
	 * override default behavior to hide objects as they go offscreen
	 */
	override public xnFinished(evt:TweenEvent ) : void
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
		
		if(!fSingleStep)							// Debug
		{
			// When the tutor terminates there may not be a new scene to go to.
			
			if(newScene)
			{
				if(tutorAutoObj[newScene].instance.visible == false)
				{				
					setTransitionIN(tutorAutoObj,newScene);	// setup the Running array for the in transition
				}
				
				changeScene();
				startTransition(inFinished);			// start it up
			}
		}
		else
			dispatchEvent(new Event(Event.CHANGE));
			
	}				
	
	/**
	 * Object specific finalization behaviors - invoked through  reference in xnFinished
	 */
	public inFinished() : void
	{			
		CUtil.trace("inFinished");
	
		currScene = newScene;
		dispatchEvent(new Event(Event.COMPLETE));
	}				
			
}
	
