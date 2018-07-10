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


//## imports

import { IEFTutorDoc } 		from "../core/IEFTutorDoc";

import { CSceneNode } 		from "./CSceneNode";
import { CSceneGraph } 		from "./CSceneGraph";
import { CActionTrack } 		from "./CActionTrack";

import { CUtil } 			from "../util/CUtil";

import EventDispatcher = createjs.EventDispatcher;



export class CSceneModule extends CSceneNode
{
	private _tracks:Array<any> = new Array;	
	private _ndx:number = -1;
	private _reuse:boolean;
	
	
	constructor(_tutorDoc:IEFTutorDoc, target:EventDispatcher=null)
	{
		super(_tutorDoc, target);
	}
	
	
	/** 
	 * Note:  We can use this to construct a CModule object from CNode data or CModule data
	 * 			  
	 *		When moduleFactory is a "type":"node" the generated object is referenced directly from the graph 
		*   	When moduleFactory is a "type":"module" the generated object is a global referenced elsewhere 
		*      
	**/		
	public static factory(_tutorDoc:IEFTutorDoc, parent:CSceneGraph, nodeName:string, moduleFactory:any) : CSceneModule
	{
		let node:CSceneModule = new CSceneModule(_tutorDoc);			
		
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
			node._tracks.push(new CActionTrack(_tutorDoc, track, parent));	
		}
		
		return node;
	}
	
	
	public nextActionTrack() : string
	{
		let nextTrackClass:string = null; 
		let nextTrack:CActionTrack;
		let features:string;
		let featurePass:boolean = false;
		
		// If new scene has features, check that it is being used in the current tutor feature set
		// Note: You must ensure that there is a match for the last scene in the sequence   			
		
		while(this._ndx < this._tracks.length)
		{
			this._ndx++;
			
			nextTrack  = this._tracks[this._ndx];				
			nextTrackClass = null;
			
			if(nextTrack != null)
			{
				features = nextTrack.features;
				
				// If this scene is not in the feature set for the tutor then check the next one.
				
				if(features != "")
				{
					featurePass = this.tutorDoc.testFeatureSet(features);

					if(featurePass)
					{
						// Check Probability Feature if present
						
						if(nextTrack.hasPFeature)
						{
							featurePass = nextTrack.testPFeature();
						}											
					}																			
				}
				
				// unconditional tracks pass automatically - unless they have PFeature
				
				else
				{
					// Check Probability Feature if present
					
					if(nextTrack.hasPFeature)
					{
						featurePass = nextTrack.testPFeature();
					}				
					else featurePass = true;
				}
				
				if(featurePass)
				{
					CUtil.trace("Track Features: " + features + " passed:" + featurePass);
					
					switch(nextTrack.type)
					{
						case "actionNode":
							nextTrackClass = nextTrack.actionName;
							break;
						
						case "actiontrack":
							nextTrackClass = nextTrack.trackName;
							break;
						
						case "choiceset":
							nextTrackClass = nextTrack.nextChoice();
							break;
					}
					
					break;		// leave the loop
				}					
			}
			else break;
		}
		
		// If we have exhausete the node check if it can be reused - if so reinitialize it for 
		// the next time it is called.
		
		if(this._ndx >= this._tracks.length)
		{
			if(this._reuse)
			{
				this.resetNode();
			}
		}			
		
		return nextTrackClass;			
	}

	
	public seekToTrack(seek:string) : string
	{
		let track:CActionTrack = null;
		let ndx:number = 0;
		
		// Move to the correct scene within the module
		
		for (let track of this._tracks)
		{
			if(seek == track.classpath)
			{
				this._ndx = ndx;
				break;
			}			
			ndx++;
		}
		
		return track.trackName;
	}
	
	
	public applyNode() : boolean
	{
		//dispatchEvent(new Event("todo")); 
		
		return false;			
	}
			
	
	public resetNode() : void
	{		
		this._ndx = -1;
	}				
}	
