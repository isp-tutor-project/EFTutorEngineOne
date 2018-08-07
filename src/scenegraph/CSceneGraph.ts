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
import { CSceneModule } 		from "./CSceneModule";
import { CSceneTrack }          from "./CSceneTrack";
import { CSceneHistoryNode }    from "./CSceneHistoryNode";

import { TScene }				from "../thermite/TScene";



export class CSceneGraph extends CSceneNode 
{
	private _nodes:any              = {};			
    private _currNode:CSceneNode;
    
	private _rootTrack:CSceneTrack;
	private _currTrack:CSceneTrack;
	private _prevTrack:CSceneTrack;
	
	private _parentScene:TScene;
	
	public  _graphFactory:any;

	
	
	constructor(_tutorDoc:IEFTutorDoc)
	{
		super(_tutorDoc);
	}				

	
	public static factory(_tutorDoc:IEFTutorDoc, parent:TScene, hostModule:string, sceneName:string) : CSceneGraph
	{			
		let scenegraph:CSceneGraph = new CSceneGraph(_tutorDoc);			
    
        try {
            scenegraph._graphFactory = _tutorDoc.sceneGraph[hostModule][sceneName];
            
            if(scenegraph._graphFactory == undefined) 
                                        throw("missing scene");
        }
        catch(err) {
            console.log("Error: Missing scene graph: " + hostModule + ":" + sceneName);
        }

		scenegraph.sceneInstance = parent;
		scenegraph.parseNodes();			
		scenegraph.seekRoot();
		
		return scenegraph;
	}
	
	
	public seekRoot() : void
	{
		this._currNode = this._nodes["root"];
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
	public gotoNextTrack() : CSceneTrack
	{
		let nextNode:CSceneNode;
		
		if(this._currNode) do 
		{
			// Increment the animation polymorphically - remember the root track
			
            this._currTrack = this._currNode.gotoNextTrack();            
            this._rootTrack = this._rootTrack || this._currTrack;
			
			// If the node is exhausted move to next node
			
			if(this._currTrack == null)
			{
				this._currNode = this._currNode.nextNode();
			}
			
		}while((this._currTrack == null) && (this._currNode != null))
		
		// Remember a context in which to do constraint testing for graph Node transitions.
		// i.e. the constraints are tested within the context of the last valid Animation
		
		this._prevTrack = this._currTrack;	
		
		return this._currTrack;				
	}
	
    
    public seekToTrack(historyNode:CSceneHistoryNode) : any {

        this._currNode  = historyNode.node;
        this._currTrack = historyNode.track;   

        return this._currNode.seekToTrack(historyNode);
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
					case "module":					
						this._nodes[name] = CSceneModule.factory(this.tutorDoc, this, name, nodeList[name]);
                        break;
                        
                    default:
                        console.log("Error: Invalid Node Type: " + nodeList[name].subtype);
                        break;
				}
			}
		}			
		
		return true;
	}
	
		
	public findNodeByName(name:string) : CSceneNode
	{
		return this._nodes[name];
	}
	
	
	public get node() : CSceneNode
	{
		return this._currNode;
	}

	public get rootTrack() : CSceneTrack
	{
		return this._rootTrack;
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
