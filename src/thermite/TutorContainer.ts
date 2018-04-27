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

import { CEFRoot }				from "../core/CEFRoot";
import { CEFTutorRoot } 		from "../core/CEFTutorRoot";

import { CSceneGraphNavigator } from "../scenegraph/CSceneGraphNavigator";

import { CTutorState }      from "../util/CTutorState";
import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";


import Tween     		  = createjs.Tween;
import Rectangle     	  = createjs.Rectangle;
import Shape     		  = createjs.Shape;


export class TutorContainer extends CEFTutorRoot
{
    public containerBounds:Shape;
    public nominalBounds:Rectangle;
    
    /**
     * Tutor constructor
     */
    constructor()
    {
        super();
        this.init2();
    }

	/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
	/* ######################################################### */

    public CEFTutorInitialize() {
        this.CEFTutorRootInitialize();

        this.init2();
    }

    public initialize() {
        this.CEFTutorRootInitialize();

        this.init2();
    }

    private init2() {

        this.traceMode = false;
        
        if(this.traceMode) CUtil.trace("TutorContainer:Constructor");

		// TODO derive container dimensions from TutorLoader module
		//
        this.containerBounds = new Shape();
        this.containerBounds.graphics.f("rgba(255,0,0,0)").s("rgba(0,0,0,0)").ss(1,1,1).dr(0,0,1920,1200);
        this.containerBounds.setTransform(0,0);

        this.timeline.addTween(Tween.get(this.containerBounds).wait(1));
        
        this.nominalBounds = new Rectangle(0,0,1920,1200);
    }
	
	/* ######################################################### */
	/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */
	
	public Destructor() : void
	{
		super.Destructor();
	}
	

//*************** Logging state management
	
	public captureLOGState() : string
	{
		let obj:string = super.captureLOGState();
				
		return obj;											   
	}				

//*************** Logging state management


    //****** Initialize the Tutor configurations - Add Scenes - Audio etc.
    
    public initializeTutor() : void
    {
       
        //*** Init the Tutor Global Variables
		// ******************************************************************************************
		
        // Initialize the Knowledge tracing         
        this.instantiateKT();        
        
        // This manufactures the sceneGraph from the JSON object spec file 			
        //
        if(CTutorState.gSceneGraphDesc != null)
             CSceneGraphNavigator.rootGraphFactory(CTutorState.gSceneGraphDesc);
    }
    
	
//*************** Serialization
	
	/*
	* 
	*/
	public loadXML(stringSrc:any) : void
	{		
		super.loadXML(stringSrc);
		
	}
	
	/*
	*/
	public saveXML() : string
	{
		let propVector:string;
		
		return propVector;
	}	
	
//*************** Serialization
	
}
