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

import { CEFTimeLine } 		from "./CEFTimeLine";
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
	
	public rTime:number     = 350;				// Removal Transition time
	public tTime:number     = 350;				// Normal Transition time

	public fSingleStep:boolean = true;			// single stepping operations - debug

	private activeObjs:any  = {};				// Pointers to the objects in the most recent scene + persistent ojects
	private persistObjs:any = {};				// Pointers to persistent objects - these live thorughout the tutor lifecycle
	private currentObjs:Array<any>;				// Pointers to the objects in the current scene
	private fSwapObjects:boolean = true;		// flag - true - swap objects  - false - use deep state copy 

	
	
	constructor(_tutorDoc:IEFTutorDoc)
	{
		super(null, null, {"useTicks":false, "loop":false, "paused":true }, _tutorDoc);

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
		
		for(i1 = 0 ; i1 < this._tweens.length ; i1++)
		{			
			if(this.traceMode) CUtil.trace("Object Value: ", this.targets[i1].obj);
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
			
			if(this.targets.length) {

                this.startTransition(this.outFinished, this);				
            }
				
			else 
			{
				this.setTransitionIN(this.tutorAutoObj, this.newScene);	
				this.changeScene();

				// Catch special case where there are no tweens
				// 
				if(this._tweens.length > 0) {

					this.startTransition(this.inFinished, this);					
				}
				else
					this.inFinished();
			}
		}
		else
		{
			this.setTransitionIN(this.tutorAutoObj, this.newScene);	
            this.changeScene();
            
			this.startTransition(this.inFinished, this);				
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
            
		try {
			// look for objects that are not in the new scene but are in current
			//
			if(this.currScene != null) for(let sceneObj in this.tutorAutoObj[this.currScene])
			{				
				bMatch = false;
				
				// Don't tween the instances
				//
				if(sceneObj == "_instance") continue;
				
				// we can exit to a null scene just to get everything off screen
				//
				if(this.newScene != null)
				{	
					// If object exists in the new scene, then:
					//  	1: If it is CEF and the xnames match then they are the same
					//
					if (this.tutorAutoObj[this.newScene][sceneObj] != undefined)
					{
						if(this.traceMode) CUtil.trace("newObject: " + this.tutorAutoObj[this.newScene][sceneObj]._instance.xname);
						if(this.traceMode) CUtil.trace("oldObject: " + this.tutorAutoObj[this.currScene][sceneObj]._instance.xname);
						
						if (this.tutorAutoObj[this.newScene][sceneObj]._instance.xname == 
							this.tutorAutoObj[this.currScene][sceneObj]._instance.xname )
																					bMatch = true;
					}
					
				}
				
				// This object in the current scene does not exist in the new scene
				//
				if(!bMatch)
				{			
					if(this.traceMode) CUtil.trace("setTransitionOUT: " + this.tutorAutoObj[this.currScene][sceneObj]._instance.name);
					
					targObj = this.tutorAutoObj[this.currScene][sceneObj];			// Convenience Copy	
					
					// we are going to turn "off" the object
					// Run the alpha tween from the current alpha to ZERO to remove the object
					//
					tween = new Tween(targObj._instance).to({alpha:0}, Number(this.rTime), Ease.cubicInOut)
											
					// push the tween on to the run stack
					//
					this.addTween(tween);
				}				
			}
		}
		catch(error) {
			CUtil.trace("setTransitionOUT failed: " + error);
        }
        
        // Allow scripts to fire just before out transition
        // 
        this.tutorAutoObj[this.currScene]._instance.hideScene();
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
	public setTransitionIN(objectList:any, sceneName:string ) : void
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
		for(let namedObj in objectList[sceneName])
		{
			// Exclude the instance property of the scene itself
			
			if(namedObj != "_instance")
			{
				// Convenience Copy
				
				targObj = objectList[sceneName][namedObj];
				
				// Skip objects that aren't to be tweened
				// Use the namedObj to disinguish unique instances
				//
				if(targObj._instance instanceof TObject)
				{                    
					if(!targObj._instance.isTweenable())
												continue;
				}	
				// use the xname to identify unique instances
				
				xname = targObj._instance.xname;
                
                // Don't show hidden objects
                // 
                if(targObj._instance.hidden)
                                        continue;
                
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
						
						let dO1:DisplayObject = this.tutorAutoObj[this.currScene][namedObj]._instance;
						let dO2:DisplayObject = this.tutorAutoObj[this.newScene][namedObj]._instance;
						
						// Get their locations in the display list
						
						let dI1:number = this.tutorContainer[this.currScene].getChildIndex(dO1);
						let dI2:number = this.tutorContainer[this.newScene].getChildIndex(dO2);
						
						// Swap them in the scenes display lists
						
						this.tutorContainer[this.currScene].addChildAt(dO2, dI1 );
						this.tutorContainer[this.newScene].addChildAt(dO1, dI2);
						
						// Swap the instances in the TutorObj
						
						this.tutorAutoObj[this.currScene][namedObj]._instance = dO2;
						this.tutorAutoObj[this.newScene][namedObj]._instance  = dO1;

						// Swap the instances in the scenes themselves
						
						this.tutorAutoObj[this.currScene]._instance[namedObj] = dO2;
						this.tutorAutoObj[this.newScene]._instance[namedObj]  = dO1;
                        
                        // Update the host scene id for mixins
                        // 
						this.tutorAutoObj[this.newScene]._instance[namedObj].hostScene = this.tutorAutoObj[this.newScene]._instance;
                        
						// update the convenience copy
						
						targObj = objectList[sceneName][namedObj];									
					}
					else
					{
						// If it is a WOZ object do a deep copy of its internal state
						// We assume all named WOZ Objects are WOZ in all instances
						//
						if((liveObj instanceof TObject) && (targObj._instance.tweenID == liveObj.tweenID))
						{											
							targObj._instance.deepStateCopy(liveObj);
						}
						// Otherwise just take its x.y.width.height.alpha
						//
						else 
							this.shallowStateCopy(targObj._instance, liveObj);					
					}
					
					
					// Now that the object is initialized - check if its in-place properties are different from its current state
					// indicating the need for a tween.
					//
					if(targObj.inPlace.x != liveObj.x)
					{
						
						tween = new Tween(targObj._instance).to({x:targObj.inPlace.x}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + sceneName + "  named : " + targObj.name + " property:x  in: " + tween.duration + "msecs");
						
						// push the tween on to the run stack
						//
						this.addTween(tween);						
					}
					if(targObj.inPlace.y != liveObj.y)
					{
						tween = new Tween(targObj._instance).to({y:targObj.inPlace.y}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + sceneName + "  named : " + targObj.name + " property: y  in: " + tween.duration + "msecs");
												
						// push the tween on to the run stack
						//
						this.addTween(tween);						
					}

					if(targObj.inPlace.scaleX != liveObj.scaleX)		
					{
						tween = new Tween(targObj._instance).to({scaleX:targObj.inPlace.scaleX}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + sceneName + "  named : " + targObj.name + " property: scaleX  in: " + tween.duration + "msecs");
						
						// push the tween on to the run stack
						//
						this.addTween(tween);						
					}
					if(targObj.inPlace.scaleY != liveObj.scaleY)
					{
						tween = new Tween(targObj._instance).to({scaleY:targObj.inPlace.scaleY}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + sceneName + "  named : " + targObj.name + " property: scaleY  in: " + tween.duration + "msecs");
						
						// push the tween on to the run stack
						//
						this.addTween(tween);						
					}

					if(targObj.inPlace.skewX != liveObj.skewX)		
					{
						tween = new Tween(targObj._instance).to({skewX:targObj.inPlace.skewX}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + sceneName + "  named : " + targObj.name + " property: skewX  in: " + tween.duration + "msecs");
						
						// push the tween on to the run stack
						//
						this.addTween(tween);						
					}
					if(targObj.inPlace.skewY != liveObj.skewY)
					{
						tween = new Tween(targObj._instance).to({skewY:targObj.inPlace.skewY}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + sceneName + "  named : " + targObj.name + " property: skewY  in: " + tween.duration + "msecs");
						
						// push the tween on to the run stack
						//
						this.addTween(tween);						
					}
					
					if(targObj.inPlace.regX != liveObj.regX)		
					{
						tween = new Tween(targObj._instance).to({regX:targObj.inPlace.regX}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + sceneName + "  named : " + targObj.name + " property: regX  in: " + tween.duration + "msecs");
						
						// push the tween on to the run stack
						//
						this.addTween(tween);						
					}
					if(targObj.inPlace.regY != liveObj.regY)
					{
						tween = new Tween(targObj._instance).to({regY:targObj.inPlace.regY}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + sceneName + "  named : " + targObj.name + " property: regY  in: " + tween.duration + "msecs");
						
						// push the tween on to the run stack
						//
						this.addTween(tween);						
					}

					if(targObj.inPlace.rotation != liveObj.rotation)
					{
						tween = new Tween(targObj._instance).to({rotation:targObj.inPlace.rotation}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + sceneName + "  named : " + targObj._instance.name + " property: rotation  in: " + tween.duration + "msecs");

						// push the tween on to the run stack
						//
						this.addTween(tween);						
					}

					if(targObj.inPlace.alpha != liveObj.alpha)
					{
						tween = new Tween(targObj._instance).to({alpha:targObj.inPlace.alpha}, this.tTime, Ease.cubicInOut);
						if(this.traceMode) CUtil.trace("Tweening obj in scene: " + sceneName + "  named : " + targObj._instance.name + " property: alpha  in: " + tween.duration + "msecs");

						// push the tween on to the run stack
						//
						this.addTween(tween);						
					}
					
				}
				
				// Otherwise just set tweens to bring the objects on screen from 0 alpha
				else
				{
                    // New HTML controls must be added to the overlay container and their style sheets
                    // only when used.  i.e. controls that persist between scenes and therefore have
                    // an unused control instance should never be added
                    // 
                    if(targObj._instance.addHTMLControls)
                            targObj._instance.addHTMLControls();
                            
					// Run the alpha tween from ZERO to bring the object on stage
					//
					if(!(targObj._instance instanceof TObjectMask))
											targObj._instance.alpha = 0;

					// Generate the tween
					//
					tween = new Tween(targObj._instance).to({alpha:targObj.inPlace.alpha}, this.tTime, Ease.cubicInOut);
					if(this.traceMode) CUtil.trace("Tweening obj in scene: " + sceneName + "  named : " + targObj._instance.name + " property: alpha" + " in: " + tween.duration + "msecs");
					
					// push the tween on to the run stack
					//
					this.addTween(tween);
				}					
			
									
				// Check for persistent objects and subtweening			

				if(targObj._instance instanceof TObject)
				{
					// Make object visible
					//
					if(!targObj._instance.hidden)
						targObj._instance.visible = true;
					
					// Record any persistent objects
					
					if(targObj._instance.bPersist)
					{
						this.persistObjs[xname] = targObj._instance;
					}
					else
					{
						// If not WOZobject add it to the currentObjs - we don't want persistent objects duplicated
						
						this.currentObjs.push(new Array(xname,targObj._instance));													
					}
					
					// Recurse any objects that require subobject tweening - tables etc
					
					if(targObj._instance.isSubTweenable())
					{
						if(this.traceMode) CUtil.trace("SubTweening : " + targObj._instance.name );
						
						this.setTransitionIN(objectList[sceneName], namedObj ); 
					}
				}
				else
				{						
					targObj._instance.visible = true;
					
					// If not WOZobject add it to the currentObjs - we don't want persistent objects duplicated
					
					this.currentObjs.push(new Array(xname,targObj._instance));						
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
        
        // Allow scripts to fire just before in transition
        // 
        this.tutorAutoObj[this.newScene]._instance.showScene();
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
			this.tutorAutoObj[this.currScene]._instance.visible = false;

		this.tutorAutoObj[this.newScene]._instance.visible  = true;
		
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
				if(this.tutorAutoObj[this.newScene]._instance.visible == false)
				{				
					this.setTransitionIN(this.tutorAutoObj,this.newScene);	// setup the Running array for the in transition
				}
				
				this.changeScene();
				this.startTransition(this.inFinished, this);			// start it up
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
	
