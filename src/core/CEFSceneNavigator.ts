//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2008 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CWOZSceneNavigator.as
//                                                                        
//  Purpose:   CWOZSceneNavigator Base class implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
// History: File Creation 10/8/2008 10:36 AM
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


package cmu.woz 
{
	//** Imports
	
	/**
	* ...
	*/
	public class CWOZSceneNavigator extends CWOZNavigator
	{
		
		//*************** Navigator "ROOT INSTANCE" CONSTANTS - 
		// Place these within a subclass to set the root of a navigation sequence
		// 
		private var StscenePrev:int;
		private var StsceneCurr:int;
		
		private var StsceneTitle:Array    = new Array();
		private var StscenePage:Array     = new Array();
		private var StsceneSeq:Array      = new Array();
		private var StsceneClass:Array    = new Array();
		private var StscenePersist:Array  = new Array();
		private var StsceneFeatures:Array = new Array();
			
		//*************** Navigator "ROOT INSTANCE" CONSTANTS - 
		
		/**
		* Creates a new CWOZSceneNavigator instance. 
		*/
		public function CWOZSceneNavigator() 
		{
			
		}
		
		/**
		 * Add a scene to a navigation sub-sequence - These sequences are driven by scene events not NEXT/PREV button clicks
		 * @param	sceneTitle
		 * @param	sceneName
		 */
		override public function addScene(SceneTitle:string, ScenePage:string, SceneName:string, SceneClass:string, ScenePersist:boolean, SceneFeatures:string = "null" ) : void
		{
			sceneCnt++;
			
			StsceneTitle.push(SceneTitle);
			StscenePage.push(ScenePage);
			StsceneSeq.push(SceneName);			
			StsceneClass.push(SceneClass);			
			StscenePersist.push(ScenePersist);
			
			if(SceneFeatures != "null")
				StsceneFeatures.push(SceneFeatures);	
			else
				StsceneFeatures.push(null);	
		}	
		
		
//****** Overridable Behaviors
		
//***************** Navigation Behaviors *******************************	

		//*************** Navigator getter setters - 
		// Override these within a subclass to set the root of a navigation sequence
		override protected function get scenePrev() :int 
		{
			return StscenePrev;
		}
		override protected function set scenePrev(scenePrevINT:int) :void 
		{
			StscenePrev = scenePrevINT;
		}
		
		override protected function get sceneCurr() :int 
		{
			return StsceneCurr;
		}
		override protected function set sceneCurr(sceneCurrINT:int) :void 
		{
			StsceneCurr = sceneCurrINT;
		}
		override protected function get sceneCurrINC() :int 
		{
			var feature:string;
			var featSet:Array = new Array;
			var match:boolean = false;
			
			StsceneCurr++;
			
			// If new scene has features, check that it is being used in the current tutor feature set
			// Note: You must ensure that there is a match for the last scene in the sequence   
			
			while(StsceneFeatures[StsceneCurr] != null)
			{
				// If this scene is not in the feature set for the tutor then check the next one.
				
				if(!gTutor.testFeatureSet(StsceneFeatures[StsceneCurr])) StsceneCurr++;
		   			  												else break;
			}
			
			return StsceneCurr;
		}
		
		override protected function get sceneCurrDEC() :int 
		{
			var feature:string;
			var featSet:Array = new Array;
			var match:boolean = false;
			
			StsceneCurr--;
			
			// If new scene has features, check that it is being used in the current tutor feature set
			// Note: You must ensure that there is a match for the last scene in the sequence   
			
			while(StsceneFeatures[StsceneCurr] != null)
			{
				// If this scene is not in the feature set for the tutor then check the next one.
				
				if(!gTutor.testFeatureSet(StsceneFeatures[StsceneCurr])) StsceneCurr++;
																	else break;
			}
			
			return StsceneCurr;
		}
		
		
		override protected function get sceneTitle() :Array							// initialize the Tutor specific scene titles
		{
			return StsceneTitle;
		}
		override protected function set sceneTitle(sceneTitleARRAY:Array) :void		// initialize the Tutor specific scene titles
		{
			StsceneTitle = sceneTitleARRAY;
		}
		
		
		override protected function get sceneSeq() :Array								// initialize the Tutor specific scene sequence
		{
			return StsceneSeq;
		}		
		override protected function set sceneSeq(sceneSeqARRAY:Array) :void			// initialize the Tutor specific scene sequence
		{
			StsceneSeq = sceneSeqARRAY;
		}		
		
		
		override protected function get scenePage() :Array								// initialize the Tutor specific scene sequence
		{
			return StscenePage;
		}		
		override protected function set scenePage(scenePageARRAY:Array) :void			// initialize the Tutor specific scene sequence
		{
			StscenePage = scenePageARRAY;
		}		

		
		override protected function get sceneName() :Array								// initialize the Tutor specific scene sequence
		{
			return StsceneSeq;
		}		
		override protected function set sceneName(scenePageARRAY:Array) :void			// initialize the Tutor specific scene sequence
		{
			StsceneSeq = scenePageARRAY;
		}		
		
		
		override protected function get sceneClass() :Array							// initialize the Tutor specific scene sequence
		{
			return StsceneClass;
		}		
		override protected function set sceneClass(scenePageARRAY:Array) :void			// initialize the Tutor specific scene sequence
		{
			StsceneClass = scenePageARRAY;
		}		
		
		
		override protected function get scenePersist() :Array							// initialize the Tutor specific scene sequence
		{
			return StscenePersist;
		}		
		override protected function set scenePersist(scenePageARRAY:Array) :void		// initialize the Tutor specific scene sequence
		{
			StscenePersist = scenePageARRAY;
		}		
		
		
		//*************** Navigator getter setters - 
		
//***************** Navigation Behaviors *******************************		

//****** Overridable Behaviors		
		
	}
	
}