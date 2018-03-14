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
//  History: File Creation 07/18/2013 
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


//** imports

import { CGraphNode } 	from "./CGraphNode";
import { CSceneGraph } 	from "./CSceneGraph";
import { CGraphScene } 	from "./CGraphScene";

import { CEFRoot } 		from "../core/CEFRoot";

import { CUtil } 			from "../util/CUtil";


export class CGraphModule extends CGraphNode
{
	private _scenes:Array = new Array;	
	private _ndx:number = -1;
	private _reuse:boolean;
	
	
	constructor()
	{
		super();			
	}
	
	
	// Note: moduleFactory can either be a CNode JSON specification or a CGraphModuleGroup JSON specification 
	//      
	
	public static factory(parent:CSceneGraph, id:string, moduleFactory:Object, factory:Object) : CGraphModule
	{
		var moduleFactoryData:Object = factory.CModules[moduleFactory.name];
		
		var node:CGraphModule = new CGraphModule;			
		
		// polymorphically Initialize the base type - add the edges
		// Note: ModuleGroup members dont have associated node edge data (nodeFactoryData) 
		
		if(moduleFactory.edges)
			node.nodeFactory(parent, id, moduleFactory);
		
		node._reuse = moduleFactoryData.reuse;
		
		// add scene instances to the module
		
		var sceneList:Object = moduleFactoryData.scenes;			
		
		for (var scene:Object of sceneList)
		{
			node._scenes.push(new CGraphScene(scene, parent));	
		}
		
		return node;
	}
	
	
	public captureGraph(obj:Object) : Object
	{
		obj['index'] = this._ndx.toString();			
		
		return obj;
	}
	
	public restoreGraph(obj:Object) : any
	{			
		this._ndx = Number(obj['index']);
		
		return this._scenes[this._ndx];
	}
	
	public nextScene() : CGraphScene
	{
		var nextScene:CGraphScene = null;
		var features:string;
		
		// If new scene has features, check that it is being used in the current tutor feature set
		// Note: You must ensure that there is a match for the last scene in the sequence   			
		
		//@@TODO note that if nothing matches in a module ensure it cannot become an infinite loop
		
		while(this._ndx < this._scenes.length)
		{
			this._ndx++;
			
			if(this._ndx >= this._scenes.length) nextScene = null;
									else nextScene = this._scenes[this._ndx];
			
			if(nextScene != null)
			{
				features = nextScene.features;
				
				// If this scene is not in the feature set for the tutor then check the next one.
				
				if(features != "")
				{
					if(CEFRoot.gTutor.testFeatureSet(features))
					{
						// Check stocastic Feature if present
						
						if(nextScene.hasPFeature)
						{
							if(nextScene.testPFeature())
													break;
						}											
						else
							break;
					}
					CUtil.trace("Graph Feature: " + features + " :failed.");
				}
				
				// Check Stocastic Feature if present
				
				else if(nextScene.hasPFeature)
				{
					if(nextScene.testPFeature())
											break;
				}											
				else
					break;
			}
			else break;
		}
		
		// If we have exhausete the node check if it can be reused - if so reinitialize it for 
		// the next time it is called.
		
		if(this._ndx >= this._scenes.length)
		{
			if(this._reuse)
			{
				this.resetNode();
			}
		}			
		
		return nextScene;			
	}
	
	public applyNode() : boolean
	{
		dispatchEvent(new Event("todo"));  //return this._scenes[this._ndx];
		
		return false;			
	}
	
	
	public seekToScene(seekScene:CGraphScene) : CGraphScene
	{
		var scene:CGraphScene = null;
		var ndx:number = 0;
	
		// Move to the correct scene within the module
		
		for (scene of this._scenes)
		{
			if(seekScene == scene)
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
		this._ndx = -1;
	}
	
}
