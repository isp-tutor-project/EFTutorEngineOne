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
import { cellData }             from "./IThermiteTypes";
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
    private cellContent:Array<Array<any>>;    

    public selectedCell:cellData; 

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
        // this.fontSize  = 20;

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
                "transition": "color 300ms"
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

            this.controlContainer  = this.outerContainer;

            super.onAddedToStage(evt);
        }
    }

//*************** Table Methods

    public getCell(row:number, col:number) : any {

        return this.cellData[row][col];
    }

    public getRows() : number {

        return this.cellData.length;
    }

    public getCols() : number {

        return this.cellData[0].length;
    }

    public setColWidth(col:number, width:string) {

        this.getCell(0,col).cell.classList.toggle("hidden");
    }

    private findCell(cell:any) : void {

        loop1:
        for(let row=0 ; row < this.cellData.length ; row++) {

            for(let col=0 ; col < this.cellData[row].length ; col++ ) {

                if(this.cellData[row][col].cell === cell) {

                    this.selectedCell = this.cellData[row][col];
                    break loop1;
                }
            }
        }
    }

    protected clickListener(e:Event) {        
        e.stopPropagation();

        this.findCell(e.currentTarget);
        
        this.hostScene.onSelect(this.name); // Pass control name     
    }        

    private getParentCell(control:HTMLElement) : HTMLElement {

        let found:boolean = false;

        do {
            switch(control.tagName.toLowerCase()) {
                case "td":
                case "th":
                    found = true;
                    break;
            }
            if(found) break;

            control = control.parentElement;

        }while(1);

        return control;
    }

    protected changeListener(e:Event) {        
        e.stopPropagation();

        let select:HTMLSelectElement = e.currentTarget as HTMLSelectElement;

        this.findCell(this.getParentCell(select));
        
        this.selectedCell.selectedIndex = select.selectedIndex;
        this.selectedCell.selectedValue = select.options[select.selectedIndex].text;

        this.hostScene.onSelect(this.name); // Pass control name     
    }        

    private captureContent() {

        this.cellContent = new Array(this.cellData.length);

        for(let row=0 ; row < this.cellData.length ; row++) {

            this.cellContent[row] = new Array(this.cellData[row].length);

            for(let col=0 ; col < this.cellData[row].length ; col++ ) {

                let content = this.cellData[row][col].cell.innerHTML;

                this.cellContent[row][col] = content !== ""? content:null;
            }
        }
    }

    public showCells(left:number, top:number, right:number, bottom:number) {

        for(let row=top; row <= bottom ; row++) {
            for(let col=left ; col <= right ; col++ ) {

                let cell    = this.cellData[row][col].cell;
                let content = this.cellContent[row][col];

                if(content !== "") {
                    cell.innerHTML = content;
                }
            }
        }
    }

    public hideCells(left:number, top:number, right:number, bottom:number) {

        this.captureContent();

        for(let row=top; row <= bottom ; row++) {
            for(let col=left ; col <= right ; col++ ) {

                let cell = this.cellData[row][col].cell;

                // Note: innerHTML cannot be null
                // 
                cell.innerHTML = "";
            }
        }
    }

    private getInnerComponent(cell:HTMLElement) {

        let result:HTMLElement;

        result = cell.getElementsByTagName("select")[0];

        return result? result:cell;
    }
    

    public listenToCells(type:string, left:number, top:number, right:number, bottom:number) {

        for(let row=top; row <= bottom ; row++) {
            for(let col=left ; col <= right ; col++ ) {

                let cell = this.getInnerComponent(this.cellData[row][col].cell);
                
                this.addListener(cell, type);
            }
        }
    }
    
    public clearListeners(type:string) {

        for(let row=0; row < this.cellData.length ; row++) {
            for(let col=0 ; col < this.cellData[row].length ; col++ ) {

                let cell = this.getInnerComponent(this.cellData[row][col].cell);

                this.removeListener(cell, type);
            }
        }
    }


    setCellValue(row:number, col:number, value:string) {

        this.cellData[row][col].cell.innerHTML = value;
    }


    public highlightNone() {

        for(let row=0 ; row < this.cellData.length ; row++) {

            for(let col=0 ; col < this.cellData[row].length ; col++ ) {

                this.cellData[row][col].cell.style.background = "";
            }
        }
    }

    public highlightSelected(bgcolor:string) {

        let row = this.selectedCell.row;
        let col = this.selectedCell.col;

        this.highlightCells(bgcolor, col, row, col, row);
    }


    highlightRow(bgcolor:string, row:number, flashCount:number = 0, flashRate:number = 0) {

       this.highlightCells(bgcolor, 0, row, this.getCols()-1, row);
    }


    public highlightCells(bgcolor:string, left:number, top:number, right:number, bottom:number, flashCount:number = 0, flashRate:number = 0) {

        for(let row=top; row <= bottom ; row++) {
            for(let col=left ; col <= right ; col++ ) {

                let cell = this.cellData[row][col].cell;

                cell.style.background = bgcolor;
            }
        }
    }

    public highlightCellBorders(color:string, flashCount:number, flashRate:number, left:number, top:number, right:number, bottom:number) {


        for(let row=top; row <= bottom ; row++) {

            this.cellData[row][left].cell.style.borderLeftColor  = color;            
            this.cellData[row][right].cell.style.borderLeftColor = color;            
        }
        for(let col=left; col <= right ; col++) {

            this.cellData[top][col].cell.style.borderTopColor       = color;            
            this.cellData[bottom][col].cell.style.borderBottomColor = color;            
        }
    }

//*************** Serialization


    private resolvePlaceHolderElement(selector:string, cellData:any) : string {

        let element = `<option hidden>${this.hostScene.resolveTemplates(selector, this._templateRef)}</option>`;

        cellData.placeHolder = this.hostScene.ontologyPath;

        return element;
    }


    private resolveOptionElements(options:Array<string>, cellData:any) : string {

        let optionStr:string = "";
        cellData.options = [];
        
        options.forEach((selector:string )=> {

            optionStr += `<option value="">${this.hostScene.resolveTemplates(selector, this._templateRef)}</option>`;            

            cellData.options.push[this.hostScene.ontologyPath];        
        });

        return optionStr;
    }


    private initElementFromData(rowindex:number, colindex:number, element:any) : void {

        let cell = this.table.rows[rowindex].cells.item(colindex);

        // resolve any selector references - these may include query selectors.
        // 
        let value = this.hostScene.resolveTemplates(element.value, this._templateRef);        
        let path  = this.hostScene.ontologyPath;

        let cellData:any = this.cellData[rowindex][colindex] = {};

        cellData.row         = rowindex;
        cellData.col         = colindex;
        cellData.ontologyKey = path;

        switch(value) {
            case "$LIST": 
                cellData.isList = true;

                cell.innerHTML = `<div><select class="list">
                    ${this.resolvePlaceHolderElement(element.placeHolder, cellData)}
                    ${this.resolveOptionElements(element.options, cellData)}
                </select></div>`;
                break;

            default:    
                cellData.isText = true;
                cell.innerHTML  = `<div>${value}</div>`;
                break;
        }

        cellData.cell = cell;
    }


    /*
    * Note this is potentially called recursively with (referenced data) layouts
    */
   public deSerializeObj(objData:any) : void
   {
        super.deSerializeObj(objData);			

        console.log("deserializing: Table Control");

        if(objData.tabledata) {
            this.cellData = [];

            objData.tabledata.rowdata.forEach( (coldata:any, rowindex:number) => {
            
                this.cellData.push([]);

                coldata.forEach( (element:any, colindex:number) => {

                    this.initElementFromData(rowindex, colindex, element);
                });            
            });
        }
   }


//*************** Serialization
}