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

import { CAnimationGraph } from "./CAnimationGraph";
import { CAnimationChoiceSet } from "./CAnimationChoiceSet";






export class CAnimationTrack
{
	private _parent:CAnimationGraph;
	
	private _type:string;
	
	private _choiceset:CAnimationChoiceSet;		
	private _classname:string;
	
	private _features:string;

	private _pid:string;			// GUID for stocastic object
	private _cycle:number;			// recycle distance for looping
	private _prob:Array<any>;		// Array of probabliities for given PID 
	
	
	constructor(factory:any, parent:CAnimationGraph)
	{			
		this._parent = parent;
		
		if(factory.choiceset != undefined)
		{
			this._type       = 'choiceset';	
			this._choiceset	= CAnimationChoiceSet.factory(this._parent, factory.choiceset, this._parent._graphFactory.CChoiceSets[factory.choiceset]);
		}
		
		else if(factory.classname != undefined)
		{
			this._type       = 'actiontrack';				
			this._classname	= factory.classname;
		}
		
		this._features 	= factory.features;
		
		// Handle Stocastic Features
		
		if(factory.$P != undefined)
		{				
			this._pid   = factory.pid;
			this._prob  = factory.$P.split('|');
			this._cycle = Number(factory.cycle);
		}
	}

	public nextAnimation() : string
	{
		return this._choiceset.nextAnimation();
	}

	public testPFeature() : boolean
	{
		let iter:number = this._parent.queryPFeature(this._pid, this._prob.length, this._cycle);			
		let rand:number = Math.random();
		
		// It's important to be < not <= because if we have 0 prob we never want it to fire.
		
		return (rand < this._prob[iter]);
	}
	
	
	public get hasPFeature() : boolean
	{
		return (this._pid != null);
	}
		
	
	public get type() : string
	{
		return this._type;
	}		
			
	public set features(newFTR:string)
	{
		this._features = newFTR;	
	}		
	
	public get features() : string
	{
		return this._features;
	}		
	
	public get classname() : string
	{
		return this._classname;
	}		
	
}
