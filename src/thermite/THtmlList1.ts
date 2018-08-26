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

    private ARROWNORMAL:string;
    private ARROWACTIVE:string;

    public selected:any;
    public listData:any;



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
        this.selected   = {};

        this.ARROWNORMAL = "[eflist] .listbox::after";
        this.ARROWACTIVE = "[eflist] .listbox.active::after";        

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
                "pointer-events":"all"
            },
        
            /*hide original SELECT element:*/
        
            "[eflist].outerContainer select" : {
                "display":"none",
            },
        
        
            "[eflist] .listbox": {
                "display": "table-cell",
                "height": "inherit",
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
            this.outerContainer.appendChild(this.efListBox);

            let host = this;
            this.efListBox.addEventListener("click", function (e) {

                // when the select box is clicked, close any other select boxes,
                // and open/close the current select box:

                e.stopPropagation();
                host.closeAllSelect(this);
                host.efListBox.nextElementSibling.classList.toggle("hideoptions");
                host.efListBox.classList.toggle("active");
            });        
        
            // create a new DIV that will contain the option list:
            //
            this.efListOptions = document.createElement("DIV");
            this.efListOptions.setAttribute("class", "listoptions color hideoptions");
            this.efList = new Array<HTMLElement>();

            dom_overlay_container.appendChild(this.outerContainer); 
            this.controlContainer = this.outerContainer;          
            this.controlContainer.appendChild(this.efListOptions);
  
            super.onAddedToStage(evt);

            // if the user clicks anywhere outside the select box
            // then close all select boxes:
            // 
            document.addEventListener("click", function (e) {
                host.closeAllSelect(null);
            });        


            // update the arrow icon based on the box height
            // the arrow size is based on the height of the outerContainer
            // It is generated using the way border joints are painted. i.e. beveled ends
            // 
            // var hBox = parseInt(window.getComputedStyle(this.efListBox).height);
            // var hArrow = hBox / this.arrowScale;

            // var topNormal = (hBox - hArrow) / 2;
            // var topActive = topNormal - hArrow;

            // let arrowNormal = this.cssSheet[this.ARROWNORMAL];
            // let arrowActive = this.cssSheet[this.ARROWACTIVE];

            // arrowNormal.styles.top = topNormal + "px";
            // arrowNormal.styles.right = arrowNormal.styles.top;
            // arrowNormal.styles.border = hArrow + "px " + arrowNormal.styles.border;

            // arrowActive.styles.top = topActive + "px";

            // this.addRule(arrowNormal.selector, arrowNormal.styles);
            // this.addRule(arrowActive.selector, arrowActive.styles);


        }
    }


//*************** Serialization

    private selectObjectByElement(tar:HTMLElement) {

        let selOption = this.getSelectionByName(tar.innerHTML); 

        this.selected = Object.assign({},selOption);
        
        this.hostScene.onSelect(this.name); // Pass control name        
    }


    private getSelectionByName(itemName:string) : any {

        let result:any;
        let options:any[] = this.listData.options;

        for(let i1 = 0 ; i1 < options.length ; i1++) {
        
            if(itemName ===  this.hostScene.resolveTemplates(options[i1].name, this._ontologyKey)) {
                result = options[i1];
                break;
            }
        }

        return result;
    }


    private onOptionClick(evt:Event, tar:HTMLElement) {

        // when an item is clicked, update the original select box,
        // and the selected item:
        // 
        var currSel;

        this.selectObjectByElement(tar);
        
        this.efListBox.innerHTML = tar.innerHTML;
        currSel = this.efListOptions.getElementsByClassName("isselected");

        for (let k = 0; k < currSel.length; k++) {
            currSel[k].removeAttribute("class");
        }
        tar.setAttribute("class", "isselected");
    }


    private closeAllSelect(tar:HTMLElement) {

        // function that will close all select boxes in the document,
        // except the current select box:

        let x, y, i, arrNo = [];

        x = document.getElementsByClassName("listoptions");
        y = document.getElementsByClassName("listbox");

        for (i = 0; i < y.length; i++) {
            if (tar == y[i]) {
                arrNo.push(i)
            } else {
                y[i].classList.remove("active");
            }
        }
        for (i = 0; i < x.length; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.add("hideoptions");
            }
        }
    }


    private clearOptionList() {

        this.efList.forEach((option:any)=> {
            this.efListOptions.removeChild(option);
        });
        
        this.efList = new Array<HTMLElement>();
    }


    private initListFromData(element:any) : void {
        
        // for each option in the original select element,
        // create a new DIV that will act as an option item:
        let efOption = document.createElement("DIV");
        
        let name = this.hostScene.resolveTemplates(element.name, this._ontologyKey);        

        efOption.innerHTML = name; 

        // Mirror any initial selection
        // 
        if (element.selected) {
            efOption.setAttribute("class", "isselected");
        }

        let host = this;
        efOption.addEventListener("click", function (evt) {
            host.onOptionClick.call(host, evt, this);
        });

        this.efListOptions.appendChild(efOption);
        this.efList.push(efOption);
    }


    protected initFromDataSource(datasource:any) {

        let data:any = this.hostScene.resolveSelector(datasource, this._ontologyKey);

        if(data && data.listdata) {
            this.listData = data.listdata;
            this.clearOptionList();

            data.listdata.options.forEach((element:any) => {

                this.initListFromData(element);
            });

            this.efListBox.innerHTML = this.hostScene.resolveTemplates(data.listdata.placeHolder, this._ontologyKey);  
        }
    }


    protected initObjfromData(objData:any) {

        if(objData.style) {
            this.addCustomStyles(objData.style, this.cssSheet );
            this.addCSSRules(this.styleElement, this.cssSheet );
        }
    }


    public deSerializeObj(objData:any) : void
    {
        console.log("deserializing: Input Custom Control");

        super.deSerializeObj(objData);				

        this.datasource = objData.datasource || this.datasource;
    }

//*************** Serialization
}