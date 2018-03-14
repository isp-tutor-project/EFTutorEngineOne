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
//  File:      CEFTutor.as
//                                                                        
//  Purpose:   CEFTutor implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Apr 21 2008  
//                                                                        
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

import { CSceneGraphNavigator } from "../scenegraph/CSceneGraphNavigator";


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
        
    public tutorScenes:Array = new Array();			
    
    public   Ramps_Pre_Title:string = "";
    public   designTitle:string     = "Design Ramp Experiments";
    public   thinkTitle:string      = "Think about designing experiments";

    /**
     * Tutor constructor
     */
    constructor()
    {
        super();

        this.traceMode = false;
        
        CUtil.trace("CEFTutor:Constructor");						
        
        //*** Construct the default feature-vector (filter) for the tutor.
        // This dictates which features of the sceneConfig (and any other uses of parseXML e.g. ActionTracks) are executed.
        // This also affects which scenes are enumerated in the sceneSeq when navigating
        // This is generally overridden in either COWZNavDemo or from the server 
        
        // setTutorDefaults("FTR_EI:FTR_CVSINTRO:FTR_RAMPSINTRO:FTR_EIA:FTR_EIB:FTR_EIC:FTR_RAMPSPOSTTEST:FTR_SOLNCATCCR");
                    
        //** Populate the sceneConfig object which is defined in CEFTutorRoot
        
        //include "scenes/TED2_SceneConfig.as";		
        //include "scenes/TED2_SceneConfig_CA.as";
        
        // Incomplete ramp setup prompt - hide it and add to stage - 
        // note: The dialog is not part of the scene sequence but must be added to the automation tree for playback purposes
        
        this.SdlgPrompt       = new CDialogDesignPrompt1();
        this.SdlgPrompt.sMask = new CEFMouseMask();
        
        this.SdlgPrompt.name 	  = "SdlgPrompt";
        this.SdlgPrompt.sMask.name = "SdlgMask";
        
        this.addChild(this.SdlgPrompt);
        this.addChild(this.SdlgPrompt.sMask);
        
        this.SdlgPrompt.visible       = false;
        this.SdlgPrompt.sMask.visible = false;
        
        // Initialize the Knowledge tracing 
        
        this.instantiateKT();
        
    }

// ******************* Overrides 		
    
    
    //****** Initialize the scene configurations - Add Audio etc.
    
    public initializeScenes() : void
    {
       
        //*** Init the Tutor Global Variables
        // ******************************************************************************************
        
        // This manufactures the sceneGraph from the JSON object spec file 			
        if(CEFRoot.gSceneGraphDesc != null)
            CSceneGraphNavigator.rootGraphFactory(CEFRoot.gSceneGraphDesc);
        
        // Setup the demo Button on the title bar
        if(this.StitleBar != null)
            this.StitleBar.configDemoButton(this);
    }
    
    
    public resetZorder()
    {
        if(this.StitleBar != null)
            this.StitleBar.setTopMost();
        
        if(this.Sscene0 != null)
            this.Sscene0.setTopMost();
        
        if(this.SdemoScene != null) 
            this.SdemoScene.setTopMost();			
    }		
    
// ******************* Overrides 		

}


