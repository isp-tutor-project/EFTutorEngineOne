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
import { CONST }                from "../util/CONST";

import MovieClip     	      = createjs.MovieClip;



export class THtmlText extends THtmlBase {


	//************ Stage Symbols
	
    public SControlContainer:TObject;    

	//************ Stage Symbols				
    


    constructor() {

        super();

    }


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

    public THtmlTextInitialize() {

        this.THtmlBaseInitialize.call(this);
        this.init4();
    }

    public initialize() {

        this.THtmlBaseInitialize.call(this);		
        this.init4();
    }

    private init4() {
        
        this.traceMode = true;
        if(this.traceMode) CUtil.trace("THtmlText:Constructor");

        this.fontSize = 40;

        this.cssSheet = {

            "[eftext].outerContainer" : {
                "display": "block",
                "position":"absolute",
                "box-sizing":"content-box",

                "visibility":"hidden"
            },
    
            "[eftext] .tablecell" : {
                "display":"table-cell",
                "box-sizing":"border-box",
                "height":"inherit",
                "width":"inherit",
            },
    
            "[eftext] p" : {
                "margin":"0px",
            }
        };        
    }

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


    public Destructor() : void
    {
        
        if(this.fAdded) {
            dom_overlay_container.removeChild(this.outerContainer); 
            this.fAdded = false;
        }

        super.Destructor();
    }

//*************** Serialization

    /**
     * Note that this is called during the forced CreateJS tick to initialize 
     * the createJS controls - so onCreate will not have been called yet.
     * 
     * @param evt 
     */
    public onAddedToStage(evt:CEFEvent) {

        console.log("HTMLText On Stage");

        if(!this.fAdded) {

            this.dimContainer = this.SControlContainer;
            this.SControlContainer.visible = false;        

            this.outerContainer = document.createElement("div"); 
            this.outerContainer.className = "outerContainer";
            this.outerContainer.setAttribute(CONST.EFTEXT_TYPE, "");
            this.outerContainer.setAttribute(this.name, "");

            this.controlContainer = document.createElement("div"); 
            this.controlContainer.className = "tablecell";

            this.outerContainer.appendChild(this.controlContainer); 

            super.onAddedToStage(evt);
        }
    }

    
   public deSerializeObj(objData:any) : void
   {
       console.log("deserializing: Text Control");

       super.deSerializeObj(objData);		
       
   }

//*************** Serialization
}