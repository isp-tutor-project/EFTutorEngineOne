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

// Root Tutor object in the EdForge class framework

import { CEFRoot }              from "./CEFRoot";
import { CEFTutorRoot } 	    from "./CEFTutorRoot";	
import { CEFMouseMask }         from "./CEFMouseMask";

import { CSceneGraphNavigator } from "../scenegraph/CSceneGraphNavigator";
import { CEFNavDemo }           from "../thermite/scene/CEFNavDemo";
import { CDialogDesignPrompt1 } from "../dialogs/CDialogDesignPrompt1";

import { CTutorState }          from "../util/CTutorState";
import { CONST }                from "../util/CONST";
import { CUtil } 			    from "../util/CUtil";


/** Deprecated and deleted Apr 26 2018 */

/**
 * This is the code-behind for the stage DisplayObjectContainer that represents the
 * tutor - see TED_FLA.xfl in the TED Module.
 * 
 * This is the starting point for all tutors.
 */
export class CEFTutor extends CEFTutorRoot 
{
    //************ Stage Symbols
    
// DIALOGS	
        
    public SdlgPrompt:CDialogDesignPrompt1;
    public SdlgMask:CEFMouseMask;
    
// DEMO

    public SdemoScene:CEFNavDemo;
    
    //************ Stage Symbols

    static CREATE:boolean    = true;
    static NOCREATE:boolean  = false;
    static PERSIST:boolean   = true;
    static NOPERSIST:boolean = false;
    static ENQUEUE:boolean   = true;
    static NOENQUEUE:boolean = false;
        
    public tutorScenes:Array<any> = new Array();			
    
    public   Ramps_Pre_Title:string = "";
    public   designTitle:string     = "Design Ramp Experiments";
    public   thinkTitle:string      = "Think about designing experiments";

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
        
        CUtil.trace("CEFTutor:Constructor");						
               
        // Initialize the Knowledge tracing 
        
        this.instantiateKT();        
    }
            
	/* ######################################################### */
	/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */
    
// ******************* Overrides 		
    
    
    //****** Initialize the scene configurations - Add Audio etc.
    
    public initializeTutor() : void
    {
       
        //*** Init the Tutor Global Variables
        // ******************************************************************************************
        
        // This manufactures the sceneGraph from the JSON object spec file 			
        //
        if(CTutorState.gSceneGraphDesc != null)
             CSceneGraphNavigator.rootGraphFactory(CTutorState.gSceneGraphDesc);
    }
    
    
// ******************* Overrides 		

}


