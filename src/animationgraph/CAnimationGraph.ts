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

import { CAnimationNode } 			from "./CAnimationNode";
import { CAnimationAction } 		from "./CAnimationAction";
import { CAnimationModule } 		from "./CAnimationModule";
import { CAnimationChoiceSet } 		from "./CAnimationChoiceSet";
import { CAnimationConstraint } 	from "./CAnimationConstraint";

import { CEFRoot }					from "../core/CEFRoot";
import { CEFSceneSequence }			from "../core/CEFSceneSequence";




export class CAnimationGraph extends CAnimationNode 
{
	private _nodes:any       = new Object;		
	private _modules:any     = new Object;
	private _choicesets:any  = new Object;
	private _actions:any     = new Object;
	private _graphs:any      = new Object;
	private _constraints:any = new Object;		
	
	private _currNode:CAnimationNode;
	private _currAnimation:string;
	private _prevAnimation:string;
	
	private _parentScene:CEFSceneSequence;
	
	public  _graphFactory:any;

	public static _pFeatures:any = new Object; 
	
	
	public CAnimationGraph()
	{
	}
	
	public static factory(parent:CEFSceneSequence, id:string, factoryName:string) : CAnimationGraph
	{			
		let animationgraph:CAnimationGraph = new CAnimationGraph;			
	
		animationgraph._graphFactory = CEFRoot.gAnimationGraphDesc[factoryName];
		
		animationgraph.sceneInstance = parent;

		animationgraph.parseModules();
		animationgraph.parseActions();
		animationgraph.parseChoiceSets();
		animationgraph.parseConstraints();
		
		//@@ TODO - Allow for shared nodes by linking to pre-parsed AnimationModules, AnimationChoiceSets etc. instead of always 
		//          creating a unique module (or action...etc) node.
		
		animationgraph.parseNodes();			
	
		animationgraph.seekRoot();
		
		return animationgraph;
	}
	
	
	public seekRoot() : void
	{
		this._currNode = this._nodes["root"];
	}

	
	public onEnterRoot() : void
	{
		this._currNode.preEnter();			
	}
	
	
	public get sceneInstance() : CEFSceneSequence
	{
		// Do scene Specific Enter Scripts
		//
		return this._parentScene;		
	}		
	
	public set sceneInstance(scene : CEFSceneSequence)
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

		if(CAnimationGraph._pFeatures[pid] != undefined)
		{
			iter = CAnimationGraph._pFeatures[pid] + 1;
			
			if(iter >= size)
			{
				iter = size - cycle;					
			}
			
			CAnimationGraph._pFeatures[pid] = iter;
		}
		
		// On first touch we have to create the property
		
		else CAnimationGraph._pFeatures[pid] = 0;
		
		return iter;
	}
	
	
	// increments the curranimation polymorphically
	// potentially called recursively if currNode is a subgraph.
	//
	// returns the class name of the next ActionTrack as a string
	//
	public nextAnimation() : string
	{
		let nextNode:CAnimationNode;
		
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
						this._nodes[name] = CAnimationAction.factory(this, name, nodeList[name]);
						break;
					
					case "module":					
						this._nodes[name] = CAnimationModule.factory(this, name, nodeList[name]);
						break;
					
					case "choiceset":					
						this._nodes[name] = CAnimationChoiceSet.factory(this, name, nodeList[name]);
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
				this._modules[name] = CAnimationModule.factory(this, name, moduleFactory[name]);	
		}			
		
		return true;
	}
	
	
	private parseActions() : boolean
	{
		let actionFactory = this._graphFactory.CActions;
		
		for(let name in actionFactory) 
		{
			if(name != "COMMENT")
				this._actions[name] = CAnimationAction.factory(this, name, actionFactory[name]);	
		}			
		
		return true;
	}
	
	
	private parseChoiceSets() : boolean
	{
		let choicesetFactory = this._graphFactory.CChoiceSets;
		
		for(let name in choicesetFactory) 
		{
			if(name != "COMMENT")
				this._choicesets[name] = CAnimationChoiceSet.factory(this, name, choicesetFactory[name]);	
		}			
		
		return true;
	}
	
	
	private parseConstraints() : boolean
	{
		let constraintFactory = this._graphFactory.CConstraints;
		
		for(let name in constraintFactory) 
		{
			if(name != "COMMENT")
				this._constraints[name] = CAnimationConstraint.factory(this, constraintFactory[name]);	
		}			
		
		return true;
	}
			
	
	public findNodeByName(name:string) : CAnimationNode
	{
		return this._nodes[name];
	}
	
	
	public findConstraintByName(name:string) : CAnimationConstraint
	{
		return this._constraints[name];
	}
	
	
	public get node() : CAnimationNode
	{
		return this._currNode;
	}
	
	public set node(newNode:CAnimationNode) 
	{
		// If backtracking through a volatile history we need to reset
		// nodes so that if we revisit them they will increment their
		// _currScene correctly
		
		if(this._currNode != newNode)
			this._currNode.resetNode();
		
		this._currNode = newNode;			
	}		
}
