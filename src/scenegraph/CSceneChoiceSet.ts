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


//** imports

import { IEFTutorDoc } 			from "../core/IEFTutorDoc";

import { CSceneNode } 			from "./CSceneNode";
import { CSceneGraph } 			from "./CSceneGraph";
import { CSceneChoice } 		from "./CSceneChoice";

import EventDispatcher  = createjs.EventDispatcher;



export class CSceneChoiceSet extends CSceneNode
{
	private _choices:Array<any> = new Array;
	
	private _iter:number = 0;		
	private _cycle:number;					// recycle distance for looping
	private _count:number;					// The count of different distributions for this choice set
	private _replace:boolean = true;
	

	/**
	 *  The inclusion of multiple stocastic distributions based on iteration was done to allow the forcing of
	 *  a specific item on a given iteration - 
	 * e.g. we want the 'red one' selected on the first round but a given distribution of the others from then on.
	 */		
	constructor(_tutorDoc:IEFTutorDoc, target:EventDispatcher=null)
	{
		super(_tutorDoc, target);
	}		
	
	
	/** 
	 * Note:  We can use this to construct a CChoiceSet object from CNode data or CChoiceSet data
	 * 			  
	 *		When moduleFactory is a "type":"node" the generated object is referenced directly from the graph 
		*   	When moduleFactory is a "type":"choiceset" the generated object is a global referenced elsewhere 
		*      
		**/		
	public static factory(_tutorDoc:IEFTutorDoc, parent:CSceneGraph, nodeName:string, moduleFactory:any) : CSceneChoiceSet
	{			
		let node:CSceneChoiceSet = new CSceneChoiceSet(_tutorDoc);
		
		// If this is a CNode spec then extract the CNode info - e.g. edges etc. 
		
		if(moduleFactory.type == "node")
		{
			node.nodeFactory(parent, nodeName, moduleFactory);
			
			// change the factory to the module referenced by the node
			
			moduleFactory = parent._graphFactory.CChoiceSets[node._name];
		}
		
		// Add the actiontrack data to the ChoiceSet
		// We select amongst these based upon their probability 
		
		let choices:Object = moduleFactory.choices;			
		
		for (let set in choices)
		{
			node._choices.push(new CSceneChoice(set));	
		}

		node._replace = moduleFactory.replace;
		node._cycle   = Number(moduleFactory.cycle);
		node._count   = node._choices[0].count;			// We assume the authoring environment has contrained the count so they are all the same
					
		return node;
	}
	
	
	public nextActionTrack() : string
	{
		let nextTrackClass:string 		= null; 
		let choice:CSceneChoice;
		let curOdds:number 				= 0;
		let sampleSize:number;			
		let rand:number;

		
		// Recalc the sample size on each iteration since in non-replacement scenarios the 
		// sample size is constantly changing.  Possibly not by increments of one
		// i.e. some nodes can have higher probabilities of being chosen but once chosen have zero.

		do
		{
			for (let choice of this._choices)
			{
				sampleSize += choice.odds(this._iter); 
			}
			
			// If everything has been chosen reload the set and try again
			
			if(sampleSize == 0)
			{
				for (choice of this._choices)
				{
					choice.replace(); 
				}
			}				
			
		}while(sampleSize == 0);
			
		
		// create a random integer value between 0 and sampleSize-1
		
		rand = Math.floor(Math.random() * sampleSize);
		
		for (let choice of this._choices)
		{
			curOdds += choice.odds(this._iter);
			
			if(rand < curOdds)
			{
				nextTrackClass = choice.classpath;
				
				if(!this._replace)
					choice.choose();

				// Move to the next distribution or cycle if we have gone off the end.
				
				this._iter++;
				
				if(this._iter >= this._count)
				{
					this._iter = this._count - this._cycle;					
				}					
				break;
			}
		}
					
		return nextTrackClass;			
	}		
}
