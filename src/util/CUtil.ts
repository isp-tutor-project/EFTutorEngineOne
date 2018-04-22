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



	// CUtil.preLoader(CUtil.HIDE);
	// 
    public static preLoader(show:boolean) {

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
	

	public static strMap2Obj(strMap:Map<string,Object>) {

		let obj = Object.create(null);

		for (let [k,v] of strMap) {
			obj[k] = v;
		}

		return obj;
	}
	public static obj2StrMap(obj:any) {

		let strMap = new Map<string,Object>();

		for (let k of Object.keys(obj)) {
			strMap.set(k, obj[k]);
		}
		
		return strMap;
	}		

}

let __global = this.__global || this;