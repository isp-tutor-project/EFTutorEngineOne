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

import { TRoot }                from "./thermite/TRoot";

import { CEFTutorDoc }          from "./core/CEFTutorDoc";

import { LoaderPackage }        from "./util/IBootLoader";
import { IModuleDesc }          from "./util/IModuleDesc";

import { CURLLoader }           from "./network/CURLLoader";
import { CURLRequest }          from "./network/CURLRequest";

import { CEFEvent }             from "./events/CEFEvent";
import { CProgressEvent }       from "./events/CProgressEvent";
import { CSecurityErrorEvent }  from "./events/CSecurityErrorEvent";
import { CIOErrorEvent }        from "./events/CIOErrorEvent";

import { CONST }                from "./util/CONST";
import { CUtil }                from "./util/CUtil";

import MovieClip     		  = createjs.MovieClip;
import DisplayObject          = createjs.DisplayObject;



export class CEngine {

    public loader:CURLLoader;
    public bootTutor:string;

    public tutorDescr:LoaderPackage.IPackage;
    public tutorDoc:any;

    public timerID:number;

    public loaderData:Array<LoaderPackage.ILoaderData>;
    public sourcePath:string[];
    

	// This is a special signature to avoid typescript error "because <type> has no index signature."
	// on this[<element name>]
	// 
	[key: string]: any;


    constructor() { }


    public start(_bootTutorID:string ) : void
    {
        this.bootTutor   = _bootTutorID;

        console.log("In TutorEngineOne startup: " + _bootTutorID);

        // Setup the mouse tracking for CreateJS
        // 
        var frequency = 30;
        EFLoadManager.efStage.enableMouseOver(frequency);

        if(_bootTutorID) {

            // Construct the Tutor Document object and the Tutor Container.
            // We inject this into the prototypes of the Thermite classes.
            //
            if(!this.tutorDoc) {
                this.tutorDoc      = new CEFTutorDoc();            //this._sceneGraph, this._tutorGraph 
                this.tutorDoc.name = this.bootTutor;
            }

            this.loadBootImage();
        }
    }


    public loadTutorImage() : void {

        this.sourcePath = new Array();

        try {
            for(let filename of CONST.TUTOR_VARIABLE) {

                this.sourcePath.push("EFTutors/" + this.bootTutor + "/" + filename);
            }




    }



    public loadFileSet(fileSet:string[], onLoad:Function, onComplete:Function) {

        try {

            let modulePromises = fileSet.map((module, index) => {

                let loader = new CURLLoader();
        
                return loader.load(new CURLRequest(module))
                    .then((filetext:string) => {
        
                       return onLoad(index, filetext);
                    })                        
            })

            Promise.all(modulePromises)        
                .then(() => {

                    console.log("Load-Set Complete");

                    if(onComplete)
                        onComplete();

                })                
        }        
        catch(error){

            console.log("Load-Set failed: " + error);
        }
    }

    


    public loadBootImage() {

        this.sourcePath = new Array();

        try {
            for(let filename of CONST.TUTOR_VARIABLE) {

                this.sourcePath.push("EFTutors/" + this.bootTutor + "/" + filename);
            }

            this.loadFileSet(this.sourcePath, this.tutorDoc.onLoadJson.bind(this.tutorDoc), this.loadModuleIDs.bind(this));
        }        
        catch(error){

            console.log("Boot-Image load failed: " + error);
        }
    }


    public loadModuleIDs() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this.tutorDoc.tutorConfig.dependencies) {

                // Generate the _modules base object
                //
                this.tutorDoc.modules.push({modName:moduleName});
                this.sourcePath.push(moduleName + CONST.MODID_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.tutorDoc.onLoadModID.bind(this.tutorDoc), this.loadModuleGraphs.bind(this));
        }        
        catch(error){

            console.log("Module-ID load failed: " + error);
        }
    }
        
    public loadModuleGraphs() {

        this.sourcePath = new Array();

        try {
            for(let moduleName of this.tutorDoc.tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.GRAPH_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.tutorDoc.onLoadSceneGraphs.bind(this.tutorDoc), this.loadModuleExtensions.bind(this));
        }        
        catch(error){

            console.log("Module-Graph load failed: " + error);
        }
    }

    public loadModuleExtensions() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this.tutorDoc.tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.EXTS_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.tutorDoc.onLoadCode.bind(this.tutorDoc), this.loadModuleMixins.bind(this));
        }        
        catch(error){

            console.log("Module-Exts load failed: " + error);
        }
    }

    public loadModuleMixins() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this.tutorDoc.tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.MIXINS_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.tutorDoc.onLoadCode.bind(this.tutorDoc), this.loadModuleFonts.bind(this));
        }        
        catch(error){

            console.log("Module-Mxins load failed: " + error);
        }
    }

    public loadModuleFonts() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this.tutorDoc.tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.FONTFACE_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.tutorDoc.onLoadFonts.bind(this.tutorDoc), this.loadModuleData.bind(this));
        }        
        catch(error){

            console.log("Module-Font load failed: " + error);
        }
    }

    public loadModuleData() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this.tutorDoc.tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.MODID_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.tutorDoc.onLoadData.bind(this.tutorDoc), this.loadScripts.bind(this));
        }        
        catch(error){

            console.log("Module-Data load failed: " + error);
        }
    }

    public loadScripts() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this.tutorDoc.tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.SCRIPTS_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.tutorDoc.onLoadData.bind(this.tutorDoc), this.loadScriptData.bind(this));
        }        
        catch(error){

            console.log("Module-Data load failed: " + error);
        }
    }

    public loadScriptData() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this.tutorDoc.tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.SCRIPTDATA_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.tutorDoc.onLoadData.bind(this.tutorDoc), this.loadAnimateModules.bind(this));
        }        
        catch(error){

            console.log("Module-Data load failed: " + error);
        }
    }

    public loadAnimateModules() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this.tutorDoc.tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.ANMODULE_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.tutorDoc.onLoadAnCode.bind(this.tutorDoc), this.startTutor.bind(this));
        }        
        catch(error){

            console.log("AnimateMod-load failed: " + error);
        }
    }


    public startTutor() {
        
        console.log("module load complete: ");

        this.constructTutor();
        
        CUtil.preLoader(false);
    }


    public constructTutor() {

        // load the target application and let it run

        try {

            this.tutorDoc.initializeTutor();
                                    
            console.log("Tutor Construction Complete");
        }
        catch(error) {

            console.log("Tutor Construction Failed:  " + error.toString());
        }

        CUtil.preLoader(false);
    }


}