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

    public sourcePath:string[];

    public moduleSet:string;
    public loadModules:Array<string>;
    public anModules:any;

    public supplSet:string;
    public loadSuppls:Array<string>;
    public supplScripts:any;
    
    public _tutorGraph:any;
    public _sceneGraph:any;
    public _tutorConfig:LoaderPackage.ITutorConfig;
    public _modules:Array<LoaderPackage.IModuleDescr>;
    public _moduleData:any;


	// This is a special signature to avoid typescript error "because <type> has no index signature."
	// on this[<element name>]
	// 
	[key: string]: any;


    constructor() { }


    public start(_bootTutorID:string ) : void
    {
        this.bootTutor   = _bootTutorID;
        this._sceneGraph = {};
        this._modules    = new Array<LoaderPackage.IModuleDescr>();
        this._moduleData = {};

        console.log("In TutorEngineOne startup: " + _bootTutorID);

        // Setup the mouse tracking for CreateJS
        // 
        var frequency = 30;
        EFLoadManager.efStage.enableMouseOver(frequency);

        if(_bootTutorID) {

            // Do the engine code injection for the Tutor Loader HTML5 components
            // Generally there aren't any in the Loader project - when debugging a module
            // however there generally are components.
            //
            this.mapThermiteClasses(EFLoadManager.efLoaderLib, null, null);

            this.loadBootImage();
        }
    }


    public loadBootImage() {

        this.sourcePath = new Array();

        try {
            for(let filename of CONST.TUTOR_VARIABLE) {

                this.sourcePath.push("EFTutors/" + this.bootTutor + "/" + filename);
            }

            this.loadFileSet(this.sourcePath, this.onLoadJson.bind(this), this.loadModuleIDs.bind(this));
        }        
        catch(error){

            console.log("Boot-Image load failed: " + error);
        }
    }


    public loadModuleIDs() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this._tutorConfig.dependencies) {

                // Generate the _modules base object
                //
                this._modules.push({modName:moduleName});
                this.sourcePath.push(moduleName + CONST.MODID_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.onLoadModID.bind(this), this.loadModuleGraphs.bind(this));
        }        
        catch(error){

            console.log("Module-ID load failed: " + error);
        }
    }
        
    public loadModuleGraphs() {

        this.sourcePath = new Array();

        try {
            for(let moduleName of this._tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.GRAPH_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.onLoadSceneGraphs.bind(this), this.loadModuleExtensions.bind(this));
        }        
        catch(error){

            console.log("Module-Graph load failed: " + error);
        }
    }

    public loadModuleExtensions() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this._tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.EXTS_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.onLoadCode.bind(this), this.loadModuleMixins.bind(this));
        }        
        catch(error){

            console.log("Module-Exts load failed: " + error);
        }
    }

    public loadModuleMixins() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this._tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.MIXINS_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.onLoadCode.bind(this), this.loadModuleFonts.bind(this));
        }        
        catch(error){

            console.log("Module-Mxins load failed: " + error);
        }
    }

    public loadModuleFonts() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this._tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.FONTFACE_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.onLoadFonts.bind(this), this.loadModuleData.bind(this));
        }        
        catch(error){

            console.log("Module-Font load failed: " + error);
        }
    }

    public loadModuleData() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this._tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.MODID_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.onLoadData.bind(this), this.loadScripts.bind(this));
        }        
        catch(error){

            console.log("Module-Data load failed: " + error);
        }
    }

    public loadScripts() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this._tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.SCRIPTS_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.onLoadData.bind(this), this.loadScriptData.bind(this));
        }        
        catch(error){

            console.log("Module-Data load failed: " + error);
        }
    }

    public loadScriptData() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this._tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.SCRIPTDATA_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.onLoadData.bind(this), this.loadAnimateModules.bind(this));
        }        
        catch(error){

            console.log("Module-Data load failed: " + error);
        }
    }

    public loadAnimateModules() {
        
        this.sourcePath = new Array();

        try {
            for(let moduleName of this._tutorConfig.dependencies) {

                this.sourcePath.push(moduleName + CONST.ANMODULE_FILEPATH);
            }

            this.loadFileSet(this.sourcePath, this.onLoadAnCode.bind(this), this.startTutor.bind(this));
        }        
        catch(error){

            console.log("AnimateMod-load failed: " + error);
        }
    }



    public onLoadJson(index:number, filedata:string) {

        try {
            console.log("JSON Loaded: " + CONST.TUTOR_FACTORIES[index]);

            this[CONST.TUTOR_FACTORIES[index]] = JSON.parse(filedata);      
        }
        catch(error) {

            console.log("JSON parse failed: " + error);
        }
    }


    public onLoadModID(index:number, filedata:string) {

        try {
            console.log("MODID Loaded: " + this._modules[index].modName );

            // Extract the compID from the file into the _modules IModuleDescr spec
            //
            Object.assign(this._modules[index],JSON.parse(filedata));      
        }
        catch(error) {

            console.log("ModID parse failed: " + error);
        }
    }


    public onLoadSceneGraphs(index:number, filedata:string) {

        try {
            console.log("SceneGraph Loaded: " + this._modules[index].modName );

            // Extract the compID from the file into the _modules IModuleDescr spec
            //
            this._sceneGraph[this._modules[index].modName] = JSON.parse(filedata);      
        }
        catch(error) {

            console.log("Graph parse failed: " + error);
        }
    }

    public onLoadCode(index:number, filedata:string) {

        try {
            console.log("ModuleExts Loaded: " + this._modules[index].modName );

            // Extract the compID from the file into the _modules IModuleDescr spec
            //
            let tag = document.createElement("script");

            //## TODO: Check if there is a problem using "head" - i.e. is it universal

            // Inject the script with a suffix to expose the source in the debugger listing.
            tag.text = filedata + "\n//# sourceURL= http://127.0.0.1/"+ this._modules[index].debugPath + "/" + this._modules[index].modName + ".js";

            // Inject the script into the page
            document.head.appendChild(tag);

        }
        catch(error) {

            console.log("Exts parse failed: " + error);
        }
    }


    public onLoadAnCode(index:number, filedata:string) {

        try {
            console.log("AnimateMod Loaded: " + this._modules[index].modName );
            let engine = this;

            // Extract the compID from the file into the _modules IModuleDescr spec
            //
            let tag = document.createElement("script");

            //## TODO: Check if there is a problem using "head" - i.e. is it universal

            // Inject the script with a suffix to expose the source in the debugger listing.
            tag.text = filedata + "\n//# sourceURL= http://127.0.0.1/"+ this._modules[index].debugPath + "/" + this._modules[index].modName + ".js";

            // Inject the script into the page
            document.head.appendChild(tag);

            let comp   = AdobeAn.getComposition(this._modules[index].compID);			
            let lib    = comp.getLibrary();
            let loader = new createjs.LoadQueue(false);

            return new Promise((resolve, reject) => {
                loader.addEventListener("complete", function(evt){engine.handleComplete(evt,comp,resolve,reject)});
                loader.addEventListener("error", function(evt){engine.handleError(evt,comp,reject)});
                loader.loadManifest(lib.properties.manifest);	
            });                

        }   
        catch(error) {

            console.log("Exts parse failed: " + error);
        }
    }


    public onLoadFonts(index:number, filedata:string) {

        try {
            console.log("Fonts Loaded: " + this._modules[index].modName );

            // Create a link tag to inject the @fontface style sheet
            //
            let tag = document.createElement("style");

            tag.type = 'text/css';
            tag.appendChild(document.createTextNode(filedata));

            // Inject the script into the page
            document.head.appendChild(tag);

    }
        catch(error) {

            console.log("Font parse failed: " + error);
        }
    }


    public onLoadData(index:number, filedata:string) {

        try {
            console.log("Data Loaded: " + this._modules[index].modName );

            // ****
            //
            this._moduleData[this._modules[index].modName] = JSON.parse(filedata);      
        }
        catch(error) {

            console.log("Data parse failed: " + error);
        }
    }


    public startTutor() {
        
        console.log("module load complete: ");

        this.constructTutor();
        
        CUtil.preLoader(false);
    }



    public loadFileSet(fileSet:string[], onLoad:Function, onComplete:Function) {

        try {

            let modulePromises = fileSet.map((module, index) => {

                let loader = new CURLLoader();
        
                return loader.load(new CURLRequest(module))
                    .then((filetext:string) => {
        
                        onLoad(index, filetext);
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

    
	// Note that this is pulled from the Adobe HTML scripts to initialize the newly loaded module.
	//
	//@@ TODO: create declarations 
	//
	public handleComplete(evt:any,comp:any, resolve:Function, reject:Function) {

		let lib:any     = comp.getLibrary();
		let ss          = comp.getSpriteSheet();
		let queue       = evt.target;
		let ssMetadata  = lib.ssMetadata;

        // Extract the module name and assign it as a named property of EFLoadManager.modules
        // which is used for dynamic component creation
        //
        for(let compName in lib) {

            let moduleName:string = compName.toUpperCase();
            
            if(moduleName.startsWith("EFMOD_" )) {

                lib._ANmoduleName = moduleName;
                EFLoadManager.modules[moduleName]  = lib;
                EFLoadManager.classLib[moduleName] = {};
                break;
            }
        }

		for(let i = 0 ; i < ssMetadata.length ; i++) {

			ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
		}

        // Do the engine code injection 
        //
        this.mapThermiteClasses(lib, resolve, reject);

        AdobeAn.compositionLoaded(lib.properties.id);        
	}	
	public handleError(evt:any,comp:any, reject:Function) {

        reject("AnModule load Failed:");
    }



    public mapThermiteClasses(AnLib:any, resolve:Function, reject:Function) {
        
        let engine = this;
        let importPromises:Array<Promise<any>> = new Array();
        
        for (const compName in AnLib) {

            if(compName.startsWith(CONST.THERMITE_PREFIX)) {
                
                let varPath: Array<string> = compName.split("__");
                let classPath:string[]     = varPath[0].split("_"); 
                let comPath:string         = varPath[0].replace("_","/");

                comPath = comPath.replace("TC/","thermite/");

                importPromises.push(this.importAndMap(AnLib._ANmoduleName, AnLib[compName], comPath, classPath[classPath.length-1], varPath[1]));
            }
        }

        Promise.all(importPromises)        
            .then(() => {
                
                console.log("Thermite mapping complete");

                // resolve the preloader promise
                if(resolve)
                    resolve();

            }).catch((Error) => {

                console.log("Thermite mapping failed:" + Error);

                // reject the preloader promise
                if(reject)
                    reject();
            });
    }


    public importAndMap(AnModuleName:string, AnObject:any, classPath:string, className:string, variant:string ) {

        console.log("Import and Map: " + AnModuleName + " => " + classPath + " : " + variant);

        return SystemJS.import(classPath).then((ClassObj:any) => {

            let temp1:any = {};

            temp1.constructor   = AnObject.prototype.constructor;
            temp1.clone         = AnObject.prototype.clone;
            temp1.nominalBounds = AnObject.prototype.nominalBounds;
            temp1.frameBounds   = AnObject.prototype.frameBounds;

            AnObject.prototype = Object.create(ClassObj[className].prototype);

            AnObject.prototype.clone           = temp1.clone;
            AnObject.prototype.nominalBounds   = temp1.nominalBounds;
            AnObject.prototype.frameBounds     = temp1.frameBounds;

            // Make the tutor document and container available to all thermite objects
            // when they are created.
            //
            AnObject.prototype.tutorDoc       = this.tutorDoc;
            AnObject.prototype.tutorContainer = this.tutorDoc.tutorContainer;

            EFLoadManager.classLib[AnModuleName][variant.toUpperCase()] = AnObject;            
        })
    }


    public constructTutor() {

        // load the target application and let it run

        try {

            this.tutorDoc.initializeTutor(this.tutorDescr );
                                    
            console.log("Tutor Construction Complete");
        }
        catch(error) {

            console.log("Tutor Construction Failed:  " + error.toString());
        }

        CUtil.preLoader(false);
    }


}