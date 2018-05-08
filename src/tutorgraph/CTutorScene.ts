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

//## Imports

import { IEFTutorDoc } 		from "../core/IEFTutorDoc";

import { CTutorGraph } 	from "./CTutorGraph";

import { TTutorContainer } from "../thermite/TTutorContainer";

import { TObject }		from "../thermite/TObject";
import { TRoot } 		from "../thermite/TRoot";


import { CONST }       	from "../util/CONST";
import { CUtil } 		from "../util/CUtil";


export class CTutorScene 
{
	protected tutorDoc:IEFTutorDoc;		
	protected tutorContainer:TTutorContainer;

	private _parent:CTutorGraph;
	
	private _scene:TObject;
	
	public  _name:string;
	public  _namespace:string;
	private _title:string;
	private _page:string;
	private _class:string;
	private _features:string;
	private _enqueue:boolean;
	private _create:boolean;
	private _visible:boolean;
	private _persist:boolean;
	private _checkpnt:boolean;		
	private _object:string;		
			
	private _pid:string;			// GUID for stocastic object
	private _cycle:number;			// recycle distance for looping
	private _prob:Array<number>;	// Array of probabliities for given PID 
	
	private _iteration:number = 0;
	
	constructor(_tutorDoc:IEFTutorDoc, factory:any, parent:CTutorGraph)
	{

		this.tutorDoc 		= _tutorDoc;
		this.tutorContainer = _tutorDoc.tutorContainer;
		this._parent	 	= parent;
		
		this._name		= factory.name;
		this._namespace = factory.namespace;		
		this._title 	= factory.title;
		this._page		= factory.page;
		this._class		= factory.classname;
		this._features	= factory.features;
		this._enqueue	= (factory.enqueue    === "true")? true:false
		this._create	= (factory.create     === "true")? true:false
		this._visible	= (factory.visible    === "true")? true:false
		this._persist	= (factory.persist    === "true")? true:false
		this._checkpnt  = (factory.ischeckpnt === "true")? true:false				
		this._object	= factory.object;
		
		// Handle Stocastic Features
		
		if(factory.$P != undefined)
		{				
			this._pid   = factory.pid;
			this._prob  = factory.$P.split('|');
			this._cycle = Number(factory.cycle);
		}			
		
		// Pre-Create scene if requested
		
		if(this._create)
			this.instantiateScene(); 					
	}
	
	
	public instantiateScene() : any
	{
		this._scene = this.tutorContainer.instantiateScene(this._name, this._class, this._visible) as TObject;
		
		// Transcribe the factory feature to the object itself
		
		this.features = this._features;
	}
	
	public destroyScene() : void 
	{
		this._scene = null;
	}
	
	public set features(newFTR:string) 
	{
		this._scene.features = newFTR;	
	}		
			
	public get features() : string
	{
		if(this._scene != null)			
			return this._scene.features;
		else
			return this._features;
	}		
			
	public get hasPFeature() : boolean
	{
		return (this._pid != null);
	}
	
	public testPFeature() : boolean
	{
		let iter = this._parent.queryPFeature(this._pid, this._prob.length, this._cycle);			
		let rand = Math.random();
		
		// It's important to be < not <= because if we have 0 prob we never want it to fire.
		
		return (rand < this._prob[iter]);
	}
	
	public get scenename() : string
	{
		return this._name;
	}
	
	public get classname() : string
	{
		return this._class;
	}
	
	public get title() : string
	{
		return this._title;
	}
	
	public get isCheckPoint() : boolean
	{
		return this._checkpnt;
	}
	
	public get page() : string
	{
		return this._page;
	}
	
	public get persist() : boolean
	{
		return this._persist;
	}
	
	public get iteration() : number
	{
		return this._iteration;
	}
	
	public incIteration() : number
	{
		this._iteration++;
		
		return this._iteration;
	}

	public enumDisplayList() : void
	{
		this.tutorContainer.enumChildren(this.tutorContainer, 0);
	}
	
}