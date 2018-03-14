//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//  Copyright(c) 2013 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation 08/31/2013 
//                                                                        
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//*********************************************************************************


//## imports

import { CAnimationNode } 	from "./CAnimationNode";
import { CAnimationGraph } 	from "./CAnimationGraph";
import { CAnimationTrack } 	from "./CAnimationTrack";

import { CEFRoot } 			from "../core/CEFRoot";

import { CUtil } 			from "../util/CUtil";

import EventDispatcher = createjs.EventDispatcher;



export class CAnimationModule extends CAnimationNode
{
	private _animations:Array<any> = new Array;	
	private _ndx:number = -1;
	private _reuse:boolean;
	
	
	constructor(target:EventDispatcher=null)
	{
		super(target);
	}
	
	
	/** 
	 * Note:  We can use this to construct a CModule object from CNode data or CModule data
	 * 			  
	 *		When moduleFactory is a "type":"node" the generated object is referenced directly from the graph 
		*   	When moduleFactory is a "type":"module" the generated object is a global referenced elsewhere 
		*      
	**/		
	public static factory(parent:CAnimationGraph, nodeName:string, moduleFactory:any) : CAnimationModule
	{
		let node:CAnimationModule = new CAnimationModule;			
		
		// If this is a CNode spec then extract the CNode info - e.g. edges etc. 
		
		if(moduleFactory.type == "node")
		{
			node.nodeFactory(parent, nodeName, moduleFactory);

			// change the factory to the module referenced by the node
			
			moduleFactory = parent._graphFactory.CModules[node._name];
		}
		
		node._reuse = moduleFactory.reuse;
		
		// Add the actiontrack data to the module
		// These may represent classnames for actiontracks of choiceset references that will
		// provide an actiontrack classname 
		
		let actiontracks:Object = moduleFactory.actiontracks;			
		
		for (let track in actiontracks)
		{
			node._animations.push(new CAnimationTrack(track, parent));	
		}
		
		return node;
	}
	
	
	public nextAnimation() : string
	{
		let nextTrackClass:string = null; 
		let nextAnimation:CAnimationTrack;
		let features:string;
		let featurePass:boolean = false;
		
		// If new scene has features, check that it is being used in the current tutor feature set
		// Note: You must ensure that there is a match for the last scene in the sequence   			
		
		while(this._ndx < this._animations.length)
		{
			this._ndx++;
			
			nextAnimation  = this._animations[this._ndx];				
			nextTrackClass = null;
			
			if(nextAnimation != null)
			{
				features = nextAnimation.features;
				
				// If this scene is not in the feature set for the tutor then check the next one.
				
				if(features != "")
				{
					featurePass = CEFRoot.gTutor.testFeatureSet(features);

					if(featurePass)
					{
						// Check Probability Feature if present
						
						if(nextAnimation.hasPFeature)
						{
							featurePass = nextAnimation.testPFeature();
						}											
					}																			
				}
				
				// unconditional tracks pass automatically - unless they have PFeature
				
				else
				{
					// Check Probability Feature if present
					
					if(nextAnimation.hasPFeature)
					{
						featurePass = nextAnimation.testPFeature();
					}				
					else featurePass = true;
				}
				
				if(featurePass)
				{
					CUtil.trace("Animation Feature: " + features + " passed:" + featurePass);
					
					switch(nextAnimation.type)
					{
						case "actiontrack":
							nextTrackClass = nextAnimation.classname;
							break;
						
						case "choiceset":
							nextTrackClass = nextAnimation.nextAnimation();
							break;
					}
					
					break;		// leave the loop
				}					
			}
			else break;
		}
		
		// If we have exhausete the node check if it can be reused - if so reinitialize it for 
		// the next time it is called.
		
		if(this._ndx >= this._animations.length)
		{
			if(this._reuse)
			{
				this.resetNode();
			}
		}			
		
		return nextTrackClass;			
	}

	
	public seekToAnimation(seek:string) : string
	{
		let animation:CAnimationTrack = null;
		let ndx:number = 0;
		
		// Move to the correct scene within the module
		
		for (let animation of this._animations)
		{
			if(seek == animation.classname)
			{
				this._ndx = ndx;
				break;
			}			
			ndx++;
		}
		
		return animation.classname;
	}
	
	
	public applyNode() : boolean
	{
		//dispatchEvent(new Event("todo"));  //return this._animations[this._ndx];
		
		return false;			
	}
			
	
	public resetNode() : void
	{		
		this._ndx = -1;
	}				
}	
