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

import { TRoot } 				from "../../thermite/TRoot";
import { TScene } 				from "../../thermite/TScene";

import { CEFNavEvent } 			from "../../events/CEFNavEvent";

import { CONST }                from "../../util/CONST";
import { CUtil } 				from "../../util/CUtil";

import MovieClip     		  = createjs.MovieClip;


export class CEFNavDemo extends TScene
{	
	//************ Stage Symbols
			
	private _demoPanel:any;
	
	// non-interactive elements
	
	//************ Stage Symbols		

	private _scenesShown:boolean = false;
	
	constructor()
	{
		super();

		if(this.traceMode) CUtil.trace("CEFNavDemo:Constructor");
					
		this._demoPanel = CUtil.instantiateThermiteObject("moduleName", "CDemoPanel") as MovieClip;	
		
		this._demoPanel.x 	   = 0;					
		this._demoPanel.y       = 0;					
		this._demoPanel.alpha   = 1.0;			
		this._demoPanel.visible = true;					
		this._demoPanel.name    = "SdemoPanel";
		
		this._demoPanel["demoPath"] = (this.tutorDoc as any)["_modulePath"];
		
		// add it to this container
		
		this.addChild(this._demoPanel);				
		
		this._demoPanel.addEventListener(CEFNavEvent.WOZNAVTO, this.gotoScene);
		
		// Add the loaded scene image to the automation matrix
		
		this.tutorDoc.tutorContainer.automateScene("SdemoScene", this );		
	}

	private gotoScene(evt:CEFNavEvent) : void
	{			
		var features:Array<string>;
		var featVect:Array<string> = new Array();
		var subFeature:string;
	
		// Convert the features string to a vector
		// Conjunctive features come as a comma delimited string (which as a unit represent a feature vector so matching is done againt the whole string)
		// Disjunctive features come as a colon delimited list
		
		if(evt.wozFeatures != null)
			this.tutorDoc.tutorContainer.setTutorFeatures(evt.wozFeatures);
		
		// Show the default components to cleanup the demo instantiation 
		
		if(!this._scenesShown)
		{
			this.tutorDoc.tutorContainer.SnavPanel.visible = true;
			this.tutorDoc.tutorContainer.StitleBar.visible = true; 
			
			this._scenesShown = true;
		}

		this.tutorDoc.tutorContainer.xitions.resetTransitions();
		
		this.tutorDoc.tutorContainer.goToScene(new CEFNavEvent(CEFNavEvent.WOZNAVTO, evt.wozNavTarget ));
	}
	
}
