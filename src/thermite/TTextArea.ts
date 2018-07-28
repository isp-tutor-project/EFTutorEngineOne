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

//**Imports

import { TObject } 			    from "./TObject";
import { THtmlBase }            from "./THtmlBase";

import { CEFEvent }             from "../events/CEFEvent";
import { TMouseEvent } 		    from "../events/CEFMouseEvent";

import { CUtil } 			    from "../util/CUtil";

import MovieClip     	      = createjs.MovieClip;



export class TTextArea extends THtmlBase {


	//************ Stage Symbols
	
    public STextContainer:TObject;    
    public STextArea: HTMLDivElement;
    
    // Generated controls    

    public controlContainer:HTMLDivElement;

	//************ Stage Symbols				
    


    constructor() {

        super();

    }


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

    public TTextAreaInitialize() {

        this.THtmlBaseInitialize.call(this);
        this.init4();
    }

    public initialize() {

        this.THtmlBaseInitialize.call(this);		
        this.init4();
    }

    private init4() {
        
        this.traceMode = true;
        if(this.traceMode) CUtil.trace("TTextArea:Constructor");

        this.fontSize = 4;

        this.cssSheet = {

            ".outerContainer" : {
                "position":"absolute",
                "box-sizing":"border-box"
            },
    
            ".tablecell" : {
                "display":"table-cell",
                "box-sizing":"border-box",
                "height":"inherit",
                "width":"inherit",
                "vertical-align":"middle",
                "user-select":"none"
            },
    
            "p": {
                "margin":"0px"
            }
        };
        
    }

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


    public Destructor() : void
    {
        
        if(this.fAdded) {
            dom_overlay_container.removeChild(this.STextArea); 
            this.fAdded = false;
        }

        super.Destructor();
    }

    /**
     * Note that this is called during the forced CreateJS tick to initialize 
     * the createJS controls - so onCreate will not have been called yet.
     * 
     * @param evt 
     */
    public onAddedToStage(evt:CEFEvent) {

        console.log("TextArea On Stage");

        if(!this.fAdded) {

            this.dimContainer = this.STextContainer;
            this.STextContainer.visible = false;        

            this.outerContainer = document.createElement("div"); 
            this.outerContainer.className = "outerContainer";

            this.controlContainer = document.createElement("div"); 
            this.controlContainer.id        = "controlContainer";
            this.controlContainer.className = "tablecell";

            dom_overlay_container.appendChild(this.outerContainer); 
            this.outerContainer.appendChild(this.controlContainer); 

            // Set focus in the $onEnterScene override
            //
            // this.STextArea.focus();

            super.onAddedToStage(evt);
        }
    }

    /*
    * 
    */
   public deSerializeObj(objData:any) : void
   {
       console.log("deserializing: Input Custom Control");

       super.deSerializeObj(objData);				
   }

}