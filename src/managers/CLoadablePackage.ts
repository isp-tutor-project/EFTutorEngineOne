


import { CLoadableModule } from "./CLoadableModule";



export class CLoadablePackage 
{
	private packageVec:Array<CLoadableModule> = new Array<CLoadableModule>();
	
	constructor()
	{
	}
	
	public addModule(loadObj:Object, loadFunction:String, loadParms:Array<string>, valueObj:Object = null, valueProp:String = "") : void
	{
		var newModule:CLoadableModule;
		
		newModule = new CLoadableModule(loadObj, loadFunction, loadParms, valueObj, valueProp );
		
		this.packageVec.push(newModule);
		
		return;
	}
	
	public nextModule() : CLoadableModule 
	{
		return this.packageVec.shift();
	}
	
	public get loadPackage() : Array<CLoadableModule>
	{
		return this.packageVec;
	}
	
	public get length() : number
	{
		return this.packageVec.length;
	}
}