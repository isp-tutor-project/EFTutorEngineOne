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

import { IEFTutorDoc } 			from "../core/IEFTutorDoc";

import { CSceneNode } 			from "./CSceneNode";
import { CSceneAction } 		from "./CSceneAction";
import { CSceneModule } 		from "./CSceneModule";
import { CSceneChoiceSet } 		from "./CSceneChoiceSet";
import { CSceneConstraint } 	from "./CSceneConstraint";

import { TRoot }				from "../thermite/TRoot";
import { TScene }				from "../thermite/TScene";
import { CONST }            	from "../util/CONST";



export class CSceneGraph extends CSceneNode 
{
	private _nodes:any       = {};		
	private _modules:any     = {};
	private _choicesets:any  = {};
	private _actions:any     = {};
	private _graphs:any      = {};
	private _constraints:any = {};		
	
	private _currNode:CSceneNode;
	private _currAnimation:string;
	private _prevAnimation:string;
	
	private _parentScene:TScene;
	
	public  _graphFactory:any;

	
	
	constructor(_tutorDoc:IEFTutorDoc)
	{
		super(_tutorDoc);
	}				

	
	public static factory(_tutorDoc:IEFTutorDoc, parent:TScene, id:string, factoryName:string) : CSceneGraph
	{			
		let scenegraph:CSceneGraph = new CSceneGraph(_tutorDoc);			
	
		scenegraph._graphFactory = _tutorDoc.sceneGraph[factoryName];
		
		scenegraph.sceneInstance = parent;

		scenegraph.parseModules();
		scenegraph.parseActions();
		scenegraph.parseChoiceSets();
		scenegraph.parseConstraints();
		
		//@@ TODO - Allow for shared nodes by linking to pre-parsed SceneModules, SceneChoiceSets etc. instead of always 
		//          creating a unique module (or action...etc) node.
		
		scenegraph.parseNodes();			
	
		scenegraph.seekRoot();
		
		return scenegraph;
	}
	
	
	public seekRoot() : void
	{
		this._currNode = this._nodes["root"];
	}

	
	public onEnterRoot() : void
	{
		this._currNode.preEnter();			
	}
	
	
	public get sceneInstance() : TScene
	{
		// Do scene Specific Enter Scripts
		//
		return this._parentScene;		
	}		
	
	public set sceneInstance(scene : TScene)
	{
		this._parentScene  = scene;		
	}		
			
	
	/**
	 * 	
	 */
	public queryPFeature(pid:string, size:number, cycle:number) : number
	{
		let iter:number = 0;
		
		// On subsequent accesses we increment the iteration count 
		// If it has surpassed the size of the pFeature array we cycle on the last 'cycle' entries

		if(this.tutorDoc._pFeatures[pid] != undefined)
		{
			iter = this.tutorDoc._pFeatures[pid] + 1;
			
			if(iter >= size)
			{
				iter = size - cycle;					
			}
			
			this.tutorDoc._pFeatures[pid] = iter;
		}
		
		// On first touch we have to create the property
		
		else this.tutorDoc._pFeatures[pid] = 0;
		
		return iter;
	}
	
	
	// increments the curranimation polymorphically
	// potentially called recursively if currNode is a subgraph.
	//
	// returns the class name of the next ActionTrack as a string
	//
	public nextAnimation() : string
	{
		let nextNode:CSceneNode;
		
		if(this._currNode) do 
		{
			// Increment the animation polymorphically
			
			this._currAnimation = this._currNode.nextAnimation();
			
			// If the node is exhausted move to next node
			
			if(this._currAnimation == null)
			{
				this._currNode = this._currNode.nextNode();
				
				if(this._currNode)
				{
					// Apply action nodes
					
					this._currNode.applyNode();
				}
			}
			
		}while((this._currAnimation == null) && (this._currNode != null))
		
		// Remember a context in which to do constraint testing for graph Node transitions.
		// i.e. the constraints are tested within the context of the last valid Animation
		
		this._prevAnimation = this._currAnimation;	
		
		return this._currAnimation;				
	}
	
	
	//***** Private
	
	
	private parseNodes() : boolean
	{
		let nodeList:any = this._graphFactory.CNodes;
		
		// Note: this is not order garanteed 
		
		for(let name in nodeList) 
		{
			if(name != "COMMENT")		
			{
				switch(nodeList[name].subtype)
				{
					case "action":					
						this._nodes[name] = CSceneAction.factory(this.tutorDoc, this, name, nodeList[name]);
						break;
					
					case "module":					
						this._nodes[name] = CSceneModule.factory(this.tutorDoc, this, name, nodeList[name]);
						break;
					
					case "choiceset":					
						this._nodes[name] = CSceneChoiceSet.factory(this.tutorDoc, this, name, nodeList[name]);
						break;						
				}
			}
		}			
		
		return true;
	}
	
	
	private parseModules() : boolean
	{
		let moduleFactory = this._graphFactory.CModules;
		
		for(let name in moduleFactory) 
		{
			if(name != "COMMENT")
				this._modules[name] = CSceneModule.factory(this.tutorDoc, this, name, moduleFactory[name]);	
		}			
		
		return true;
	}
	
	
	private parseActions() : boolean
	{
		let actionFactory = this._graphFactory.CActions;
		
		for(let name in actionFactory) 
		{
			if(name != "COMMENT")
				this._actions[name] = CSceneAction.factory(this.tutorDoc, this, name, actionFactory[name]);	
		}			
		
		return true;
	}
	
	
	private parseChoiceSets() : boolean
	{
		let choicesetFactory = this._graphFactory.CChoiceSets;
		
		for(let name in choicesetFactory) 
		{
			if(name != "COMMENT")
				this._choicesets[name] = CSceneChoiceSet.factory(this.tutorDoc, this, name, choicesetFactory[name]);	
		}			
		
		return true;
	}
	
	
	private parseConstraints() : boolean
	{
		let constraintFactory = this._graphFactory.CConstraints;
		
		for(let name in constraintFactory) 
		{
			if(name != "COMMENT")
				this._constraints[name] = CSceneConstraint.factory(this.tutorDoc, this, constraintFactory[name]);	
		}			
		
		return true;
	}
			
	
	public findNodeByName(name:string) : CSceneNode
	{
		return this._nodes[name];
	}
	
	
	public findConstraintByName(name:string) : CSceneConstraint
	{
		return this._constraints[name];
	}
	
	
	public get node() : CSceneNode
	{
		return this._currNode;
	}
	
	public set node(newNode:CSceneNode) 
	{
		// If backtracking through a volatile history we need to reset
		// nodes so that if we revisit them they will increment their
		// _currScene correctly
		
		if(this._currNode != newNode)
			this._currNode.resetNode();
		
		this._currNode = newNode;			
	}		
}
