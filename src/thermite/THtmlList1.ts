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

import { CUtil } 			    from "../util/CUtil";
import { CONST }                from "../util/CONST";

import MovieClip     	      = createjs.MovieClip;



export class THtmlList1 extends THtmlBase {


	//************ Stage Symbols
	
    public SControlContainer:TObject;    
    
	//************ Stage Symbols				
    
    private efListOptions:HTMLElement;
    private efListBox:HTMLElement;
    private efList:Array<HTMLElement>;

    constructor() {

        super();

    }


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

    public THtmlList1Initialize() {

        this.THtmlBaseInitialize.call(this);
        this.init4();
    }

    public initialize() {

        this.THtmlBaseInitialize.call(this);		
        this.init4();
    }

    private init4() {
        
        this.traceMode = true;
        if(this.traceMode) CUtil.trace("THtmlList1:Constructor");

        this.fontSize   = 14;
        this.arrowScale = 4.5;

        this.cssSheet = {

            "[eflist].outerContainer" : {
                "position":"absolute",
                "visibility":"hidden",
        
                "top":"0px",
                "left":"0px",
                "height":"44px",
                "width":"400px",
        
                "font-family":"Arial",
                "font-size":"14px",
            },
        
            /*hide original SELECT element:*/
        
            "[eflist].outerContainer select" : {
                "display":"none",
            },
        
        
            "[eflist] .listbox": {
                "display": "table-cell",
                "height": "40px",
                "width": "inherit",
                "box-sizing": "border-box",
                "vertical-align": "middle",
            },

            /*style the options, including the selected item:*/

            "[eflist] .listoptions div, [eflist] .listbox": {
                "color": "#ffffff",
                "padding": "8px 16px",
                "border": "1px solid transparent",
                "border-color": "transparent transparent rgba(0, 0, 0, 0.1) transparent",
                "cursor": "pointer",
                "user-select": "none",
            },

            /*style items options:*/

            "[eflist] .listoptions": {
                "position": "absolute",
                "top": "100%",
                "left": "0",
                "right": "0",
                "z-index": "99",
            },

            "[eflist] .color": {
                "background-color": "DodgerBlue",
            },

            /*hide the items when the select box is closed:*/

            "[eflist] .hideoptions": {
                "display": "none",
            },

            "[eflist] .listoptions div:hover, [eflist] .isselected": {
                "background-color": "rgba(0, 0, 0, 0.1)"
            },

            "[eflist] .listbox::after": {
                "position": "absolute",
                "box-sizing": "border-box",
                "content": "",

                "top": "12px",
                "right": "10px",
                "width": "32",

                "border": " solid transparent",
                "border-color": "#fff transparent transparent transparent"
            },

            "[eflist] .listbox.active::after": {
                "border-color": "transparent transparent #fff transparent",
                "top": "-4px"
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

    /**
     * Note that this is called during the forced CreateJS tick to initialize 
     * the createJS controls - so onCreate will not have been called yet.
     * 
     * @param evt 
     */
    public onAddedToStage(evt:CEFEvent) {

        console.log("HTMLList On Stage");

        if(!this.fAdded) {

            this.dimContainer = this.SControlContainer;
            this.SControlContainer.visible = false;        

            this.outerContainer = document.createElement("div"); 
            this.outerContainer.className = "outerContainer";
            
            this.outerContainer.setAttribute(CONST.EFLISTBOX_TYPE, "");            
            this.outerContainer.setAttribute(this.name, "");

            /* create a new DIV that will act as the selected item:*/
            this.efListBox = document.createElement("DIV");
            this.efListBox.setAttribute("class", "listbox color");
            this.controlContainer.appendChild(this.efListBox);

            /* create a new DIV that will contain the option list:*/
            this.efListOptions = document.createElement("DIV");
            this.efListOptions.setAttribute("class", "listoptions color hideoptions");
            this.efList = new Array<HTMLElement>();

            dom_overlay_container.appendChild(this.outerContainer); 
            this.controlContainer = this.outerContainer;            

            // update the arrow icon based on the box height
            // the arrow size is based on the height of the outerContainer
            // It is generated using the way border joints are painted. i.e. beveled ends
            // 
            var hBox = parseInt(window.getComputedStyle(this.efListBox).height);
            var hArrow = hBox / this.arrowScale;

            var topNormal = (hBox - hArrow) / 2;
            var topActive = topNormal - hArrow;

            this.arrowNormal.styles.top = topNormal + "px";
            this.arrowNormal.styles.right = this.arrowNormal.styles.top;
            this.arrowNormal.styles.border = hArrow + "px " + this.arrowNormal.styles.border;

            this.arrowActive.styles.top = topActive + "px";

            this.addRule(this.arrowNormal.selector, this.arrowNormal.styles);
            this.addRule(this.arrowActive.selector, this.arrowActive.styles);

            super.onAddedToStage(evt);
        }
    }


//*************** Serialization

    private onClick(evt:Event) {

    }


    private resolveOptionElements(options:Array<string>) : string {

        let optionStr:string = "";

        options.forEach((selector:string )=> {

            optionStr += `<option value="">${this.hostScene.resolveTemplate(selector, this._OntologyFtr)}</option>`;            
        });

        return optionStr;
    }


    private initListFromData(element:any) : void {

        // for each option in the original select element,
        // create a new DIV that will act as an option item:
        let efOption = document.createElement("DIV");
        
        let value = this.hostScene.resolveTemplate(element.name, this._OntologyFtr);        

        efOption.innerHTML = `<div>${value}</div>`; 

        // Mirror any initial selection
        // 
        if (element.selected) {
            efOption.setAttribute("class", "isselected");
        }

        let host = this;
        efOption.addEventListener("click", function (evt) {
            host.onClick.call(host, evt);
        });

        this.efListOptions.appendChild(efOption);
        this.efList.push(efOption);
    }


    private resolveDataSource(datasource:string) : any {

        let result:any;
        let dataPath:Array<string> = datasource.split(".");

        if(dataPath[0] === "$$EFL") {
            result = this.tutorDoc.moduleData[this.hostModule][CONST.SCENE_DATA]._LIBRARY[CONST.EFDATA_TYPE][dataPath[1]];
        }

        return result;
    }


    private initFromDataSource(data:any) {

        if(data.listdata)
            data.listdata.options.forEach((element:any) => {
            
                this.initListFromData(element);
            });
    }


   public deSerializeObj(objData:any) : void
   {
       console.log("deserializing: Input Custom Control");

       super.deSerializeObj(objData);				

       this.datasource = objData.datasource || this.datasource;

       if(objData.datasource) {
           this.initFromDataSource(this.resolveDataSource(objData.datasource));
       }
   }

//*************** Serialization
}