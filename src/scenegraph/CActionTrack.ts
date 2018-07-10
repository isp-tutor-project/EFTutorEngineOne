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

import { IEFTutorDoc } 		from "../core/IEFTutorDoc";

import { CSceneGraph } 		from "./CSceneGraph";
import { CSceneChoiceSet } 	from "./CSceneChoiceSet";
import { CONST } from "../util/CONST";



export class CActionTrack
{
	protected tutorDoc:IEFTutorDoc;		
	private _parent:CSceneGraph;
	
	private _type:string;
	
	private _choiceset:CSceneChoiceSet;		
	private _trackname:string;
	private _actionname:string;
	
	private _features:string;

	private _pid:string;			// GUID for stocastic object
	private _cycle:number;			// recycle distance for looping
	private _prob:Array<any>;		// Array of probabliities for given PID 
	
	
	constructor(_tutorDoc:IEFTutorDoc, factory:any, parent:CSceneGraph)
	{			
		this.tutorDoc = _tutorDoc;
		this._parent  = parent;
		
		if(factory.choiceset != undefined)
		{
			this._type       = 'choiceset';	
			this._choiceset	= CSceneChoiceSet.factory(_tutorDoc, this._parent, factory.choiceset, this._parent._graphFactory.CChoiceSets[factory.choiceset]);
		}
		
		else if(factory.trackname != undefined)
		{
			this._type      = 'actiontrack';				
			this._trackname	= factory.trackname;
		}

		else if(factory.actionname != undefined)
		{
			this._type       = 'actionNode';				
			this._actionname = CONST.ACTION_PFX + factory.actionname;
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

	public nextChoice() : string
	{
		return this._choiceset.nextActionTrack();
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
	
	public get trackName() : string
	{
		return this._trackname;
	}		
	
	public get actionName() : string
	{
		return this._actionname;
	}		
}
