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


//** imports

import { IModuleDesc } from "./IModuleDesc";


export class CUtil extends Object
{
	// Use the performance sytem timer if available.
	// see: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
	//
	static w:any = window;

	static now:Function = CUtil.w.performance.now  || CUtil.w.performance.mozNow || CUtil.w.performance.msNow ||
						  CUtil.w.performance.oNow || CUtil.w.performance.webkitNow;
	
	static getDefinitionByNameCache:any = {};
    private static SHOW:boolean  = true;
    private static HIDE:boolean  = false;


	constructor()
	{
		super();
	}
            

	public static trace(message:string|string[],...alt:any[]) : void {

		let fullMessage:string = "";

		if(message instanceof Array) {

		}
		else if(arguments.length > 1) {

			for(let item in arguments) {
				
				fullMessage += fullMessage.concat(item," ");
			}

			console.log(fullMessage); 
		}
		else {

			console.log(message); 
		}
	}
		
	
	public static getTimer() : number {

		return ((CUtil.now && CUtil.now.call(CUtil.w.performance)) || (new Date().getTime()));
	}


	public static getQualifiedClassName(value:any):string {

		let type = typeof value;
		
        if (!value || (type != "object"&&!value.prototype)) {
            return type;
		}
		
		let prototype:any = value.prototype ? value.prototype : Object.getPrototypeOf(value);
		
        if (prototype.hasOwnProperty("__class__")) {
            return prototype["__class__"];
		}
		
        let constructorString:string = prototype.constructor.toString().trim();
        let index:number = constructorString.indexOf("(");
		let className:string = constructorString.substring(9, index);
		
        Object.defineProperty(prototype, "__class__", {
            value: className,
            enumerable: false,
            writable: true
        });
        return className;
    }



	public static getDefinitionByName(name:string):any {

        if (!name)
			return null;
			
		let definition = CUtil.getDefinitionByNameCache[name];
		
        if (definition) {
            return definition;
		}
		
        let paths = name.split(".");
		let length = paths.length;
		
		definition = __global;
		
        for (let i = 0; i < length; i++) {
            let path = paths[i];
            definition = definition[path];
            if (!definition) {
                return null;
            }
		}
		
        CUtil.getDefinitionByNameCache[name] = definition;
        return definition;
    }	


	public static loadJSON(pathToFile:string, scope:any, callback:Function) {

		let async:boolean;

		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', pathToFile, async = true);
		xobj.onreadystatechange = function() {
			if (xobj.readyState == 4 && xobj.status == 200) {
	
				// .open will NOT return a value but simply returns undefined in async mode so use a callback
				//
				callback.call(scope, xobj.responseText);	
			}
		}
		xobj.send(null);		

		// console.log("Request sent: " + pathToFile);
	}


	public static loadAsset(modDesc:IModuleDesc[]) {




	}

	public static loadModules(modules:IModuleDesc[]) : Promise<any> {

		return Promise.all(modules.map(CUtil.injectAnScripts));
	}


	public static injectAnScripts(module:IModuleDesc) : Promise<any> {

		console.log("Script to Load:" + module.name);

		let tag = document.createElement("script");
		
		var injectorPromise = new Promise(function(resolve, reject) {

			CUtil.loadAnModule(module).then(function(scriptText:string) {
				
				//## TODO: Check if there is a problem using "head" - i.e. is it universal
				tag.text = scriptText + "//# sourceURL= http://127.0.0.1/"+ module.tutor + "/" + module.name + ".js";
				document.head.appendChild(tag);

				let comp=AdobeAn.getComposition(module.compID);
			
				let lib=comp.getLibrary();

				let loader = new createjs.LoadQueue(false);

				loader.addEventListener("complete", function(evt){CUtil.handleComplete(evt,comp)});
				loader.loadManifest(lib.properties.manifest);	
				resolve("module complete");
			})
		});

		return injectorPromise;
	}

	public static loadAnModule(module:IModuleDesc): Promise<any> {

		console.log("Module to Load:" + module.name);
		
		var requestPromise = new Promise(function(resolve, reject) {

			let xhr = new XMLHttpRequest;

			xhr.open("GET", module.URL, true);		
			
			xhr.onload = function (e) {

			if (xhr.readyState === 4) {

				if (xhr.status === 200) {

					resolve(xhr.response);

				} else {

					console.error(xhr.response);
					reject(xhr.response);
				}
			}
			};

			xhr.onprogress = function (e) {
	//		  Module.setStatus('Loading JavaScript: ' + (100 * e.loaded / + e.total) + '%');
			};

			xhr.send();		
		});

		return requestPromise;
	}


	// Note that this is pulled from the Adobe HTML scripts to initialize the newly loaded module.
	//
	//@@ TODO: create declarations 
	//
	public static handleComplete(evt:any,comp:any) {

		let lib=comp.getLibrary();
		let ss=comp.getSpriteSheet();
		let queue = evt.target;
		let ssMetadata = lib.ssMetadata;

		for(let i = 0 ; i < ssMetadata.length ; i++) {

			ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
		}

		AdobeAn.compositionLoaded(lib.properties.id);
	}	


	// CUtil.preLoader(CUtil.HIDE);
	// 
    public preLoader(show:boolean) {

		let preloaderDiv:any;
		
        if(preloaderDiv = document.getElementById("_preload_div_")) {

            if(show) {

                preloaderDiv.style.display = 'inline-block';
            }
            else {
                preloaderDiv.style.display = 'none';
            }
        }
    
    }


	
}

let __global = this.__global || this;