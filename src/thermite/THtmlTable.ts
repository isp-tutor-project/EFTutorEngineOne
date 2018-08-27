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



export class THtmlTable extends THtmlBase {


	//************ Stage Symbols
	
    public SControlContainer:TObject;    
    
    //************ Stage Symbols	
    
    private table:HTMLTableElement;
    private cellData:Array<Array<any>>;    

    private RX_CELLID:RegExp;


    constructor() {

        super();

    }


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

    public THtmlTableInitialize() {

        this.THtmlBaseInitialize.call(this);
        this.init4();
    }

    public initialize() {

        this.THtmlBaseInitialize.call(this);		
        this.init4();
    }

    private init4() {
        
        this.traceMode = true;
        if(this.traceMode) CUtil.trace("THtmlTable:Constructor");
    
        this.RX_CELLID = /(\d*)\.(\d*)\.(.*)/;
        this.fontSize  = 20;

        this.cssSheet = {

            "[eftable].outerContainer" : {
                "table-layout": "fixed",
                "position":"absolute",
                "box-sizing":"border-box",            
            
                "border": "3px solid black",
                "border-radius": "6px",
                "border-spacing": "0px",

                "font-family":"arial",
                "font-size":"12px",

                "pointer-events": "all",

                "width": "500px",
                "height": "300px",

                "user-select": "none",
                "background-color": "white",
                "box-shadow": "6px 6px 4px 4px #3a2c2c66",

                "visibility":"hidden"
            },
        
            "[eftable] th, [eftable] td" : {
                "display": "table-cell",
                "padding": "10px",
                "border-right": "2px solid rgba(128, 128, 128, 0.486)",
                "border-bottom": "2px solid rgba(128, 128, 128, 0.486)",
                "text-align": "center",
            },
        
            "[eftable] th:last-child, [eftable] td:last-child" : {
                "border-right": "none",
            },
        
            "[eftable] tr:last-child td" : {
                "border-bottom": "none",
            },

            "[eftable] .list" : {
                "font-weight":"bold",
                "width": "100%",
                "border": "0px",
                "background-color": "white",
                "color": "rgb(0, 0, 0)"
            },

            "[eftable] option" : {
                "background-color": "white",
                "color": "rgb(0, 0, 0)",

                "font-size":"2.0em",
                "font-weight":"bold"
            },

            "input, textarea, select, button" : {
                "font-size":"inherit"
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

        console.log("HTMLTable On Stage");

        if(!this.fAdded) {

            this.dimContainer = this.SControlContainer;
            this.SControlContainer.visible = false;        

            this.outerContainer = document.createElement("table"); 
            this.outerContainer.className = "outerContainer";
            this.table = this.outerContainer as HTMLTableElement;
            
            this.outerContainer.setAttribute(CONST.EFTABLE_TYPE, "");            
            this.outerContainer.setAttribute(this.name, "");

            dom_overlay_container.appendChild(this.outerContainer); 

            this.controlContainer  = this.outerContainer;

            super.onAddedToStage(evt);
        }
    }

//*************** Table Methods

    protected clickListener(e:Event) {        
        e.stopPropagation();

        let selectorVal = this.RX_CELLID.exec((e.currentTarget as any).dataset.data);

        this.hostScene.handleEvent();
    }        

    public hideCells(left:number, top:number, right:number, bottom:number) {
    }
    

    public listenToCells(type:string, left:number, top:number, right:number, bottom:number) {

        let host = this;

        for(let row=top; row <= bottom ; row++) {
            for(let col=left ; col <= right ; col++ ) {

                let cell = this.cellData[row][col];

                this.addListener(cell, type);
            }
        }
    }
    
    public clearListeners(type:string) {

        for(let row=0; row < this.cellData.length ; row++) {
            for(let col=0 ; col < this.cellData[row].length ; col++ ) {

                let cell = this.cellData[row][col];

                this.removeListener(cell, type);
            }
        }
    }

    public highlightCells(bodycolor:number, bordercolor:number, flashCount:number, flashRate:number, left:number, top:number, right:number, bottom:number) {


    }

    public highlightCellBorders(color:number, flashCount:number, flashRate:number, left:number, top:number, right:number, bottom:number) {

    }

    public highlightCellBodies(color:number, flashCount:number, flashRate:number, left:number, top:number, right:number, bottom:number) {

    }


//*************** Serialization


    private resolvePlaceHolderElement(selector:string) : string {

        return `<option hidden>${this.hostScene.resolveTemplates(selector, this._templateRef)}</option>`;
    }


    private resolveOptionElements(options:Array<string>) : string {

        let optionStr:string = "";

        options.forEach((selector:string )=> {

            optionStr += `<option value="">${this.hostScene.resolveTemplates(selector, this._templateRef)}</option>`;            
        });

        return optionStr;
    }


    private initElementFromData(rowindex:number, colindex:number, element:any) : void {

        let cell = this.table.rows[rowindex].cells.item(colindex);

        let value = this.hostScene.resolveTemplates(element.value, this._templateRef);        

        switch(value) {
            case "$LIST": 
                cell.innerHTML = `<div><select class="list">
                    ${this.resolvePlaceHolderElement(element.placeHolder)}
                    ${this.resolveOptionElements(element.options)}
                </select></div>`;
                break;

            default:    
                cell.innerHTML = `<div>${value}</div>`;
                break;
        }
        cell.dataset.data = `${rowindex}.${colindex}.${value}`;

        this.cellData[rowindex][colindex] = cell;
    }


    protected initObjfromData(data:any) {

        super.initObjfromData(data);

        if(data.tabledata) {
            this.cellData = [];

            data.tabledata.rowdata.forEach( (coldata:any, rowindex:number) => {
            
                this.cellData.push([]);

                coldata.forEach( (element:any, colindex:number) => {

                    this.initElementFromData(rowindex, colindex, element);
                });            
            });
        }
    }


    protected initFromDataSource(datasource:any) {

        let data:any = this.hostScene.resolveSelector(datasource, null);

        if(data) {
            this.initObjfromData(data);
        }
    }


    /*
    * Note this is potentially called recursively with (referenced data) $$REF
    */
   public deSerializeObj(objData:any) : void
   {
        console.log("deserializing: Table Control");

        super.deSerializeObj(objData);			
   }


//*************** Serialization
}