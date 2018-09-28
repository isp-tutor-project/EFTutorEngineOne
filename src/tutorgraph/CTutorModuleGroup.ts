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

import { IEFTutorDoc } 		from "../core/IEFTutorDoc";

import { CTutorNode } 	from "./CTutorNode";
import { CTutorGraph } 	from "./CTutorGraph";
import { CTutorModule } from "./CTutorModule";
import { CTutorScene } 	from "./CTutorScene";

import { CUtil } 		from "../util/CUtil";


export class CTutorModuleGroup extends CTutorNode
{
	private _modules:Array<any>  = new Array;	
	private _ndx:number   		 = -1;		
	private _moduleShown:boolean = false;		
	private _shownCount:number   = 0;		

	private instanceNode:string;
	private type:string;
	private start:string;
	private show:string;
	private reuse:boolean;
	private onempty:string;

	private static SEQUENTIAL:string = "seqtype";
	private static STOCHASTIC:string = "randtype";
	
	constructor(_tutorDoc:IEFTutorDoc)
	{
		super(_tutorDoc);
	}			
	
	public static factory(_tutorDoc:any, parent:CTutorGraph, id:string, groupFactory:any, factory:any) : CTutorModuleGroup
	{
		let groupFactoryData:any = factory.CModuleGroups[groupFactory.link];
		
		let node:CTutorModuleGroup = new CTutorModuleGroup(_tutorDoc);			
		
		// polymorphically Initialize the base type - add the edges
		
		if(groupFactory.edges)
			node.nodeFactory(parent, id, groupFactory);
		
		node.instanceNode = groupFactoryData.instanceNode; 
		node.type		  =	groupFactoryData.type;		  
		node.start		  =	groupFactoryData.start;		  	
		node.show		  =	groupFactoryData.show;		  	
		node.reuse		  =	groupFactoryData.reuse;		  	
		node.onempty	  =	groupFactoryData.onempty;	  		
					
		// add module name to the modules list
		
		let moduleList:any = groupFactoryData.modules;			
		
		for (let moduleDescr of moduleList)
		{
			// either use a module from a specific node instance 
			
			if(moduleDescr.instanceNode != "")
			{
				node._modules.push(parent.findNodeByName(moduleDescr.instanceNode));
			}
			
			// or create a new module instance by name - note that when creating the submodules 
			// they have no edges for their nodes since they are embedded in the group
			else
			{				
				node._modules.push(CTutorModule.factory(_tutorDoc, parent, "", moduleDescr, factory));
			}
		}
		
		return node;
	}
	
	public captureGraph(obj:any) : Object
	{
		obj['index']        = this._ndx.toString();			
		obj['_moduleShown'] = this._moduleShown.toString(); 
		obj['_shownCount']  = this._shownCount.toString();			
		
		obj['moduleNode']   =  this._modules[this._ndx].captureGraph({});		
		
		return obj;
	}
	
	public restoreGraph(obj:any) : any
	{
		this._ndx         = Number(obj['index']);			
		this._moduleShown = (obj['_moduleShown'] == 'true')? true:false; 
		this._shownCount  = Number(obj['_shownCount']);			
		
		return this._modules[this._ndx].restoreGraph(obj['moduleNode']);						
	}
	
	
	public initialize() : void
	{
		switch(this.type)
		{
			case CTutorModuleGroup.SEQUENTIAL:
				switch(this.start)
				{
					case CTutorModuleGroup.STOCHASTIC:
						break;
					
					default:
						this._ndx = Number(this.start);
						break;	
				}
				break;
		}
	}
	
	public nextScene() : CTutorScene
	{
		let nextScene:CTutorScene = null;

		// First pass must initialize the modulegroup object
		
		if(this._ndx == -1)
			this.initialize();

		//@@ TODO: this will loop infinitely if there is no matching scene found anywhere in the group
		
		// If new scene has features, check that it is being used in the current tutor feature set
		// Note: You must ensure that there is a match for the last scene in the sequence   			
		
		do
		{
			nextScene = this._modules[this._ndx].nextScene();
			
			if(nextScene == null)
			{
				//@@ TODO add support for different node types
				//   At the moment we just loop on the nodes indefinitely
				
				// move to next scene - roll over at the end
				this._ndx++;
				
				this._ndx = this._ndx % this._modules.length;
				
				if(this.show != "all")
				{		
					// If any scene from the module was shown then inc the count						
					if(this._moduleShown)						
						this._shownCount++;
					
					// If weve reached the limit on the number of modules to show this round then break
					// We'll pick up showing the next module on the next itereation.
					
					if(this._shownCount == Number(this.show))
					{
						this._moduleShown = false;
						this._shownCount  = 0;		// reset show counter
						break;
					}
				}
			}
			else break;
			
		}while(this._ndx < this._modules.length)
		
		if(nextScene != null)
			this._moduleShown = true;
			
		return nextScene;			
	}
	
	public applyNode() : boolean
	{
		dispatchEvent(new Event("todo"));  //return _scenes[this._ndx];
		
		return false;			
	}		
	
	public seekToScene(seekScene:CTutorScene) : CTutorScene
	{
		let module:CTutorModule;
		let scene:CTutorScene = null;
		let ndx:number = 0;
		
		// Move to the correct scene within the module
		
		for (let module of this._modules)
		{
			if(seekScene == module.seekToScene(seekScene))
			{
				this._ndx = ndx;
				break;
			}			
			ndx++;
		}		
		
		return scene;
	}

	public resetNode() : void
	{		
		this._ndx         = -1;			
		this._shownCount  = 0;
		this._moduleShown = false;
	}
	
}
