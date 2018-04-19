


export class CLoadableModule
{
	private _loader:Object;
	private _loadFunction:String;
	private _loadParms:Array<string>;
	private _valueObject:Object;
	private _valueProperty:String;
	
	constructor(loader:Object, loadFunction:String, loadParms:Array<string>, valueObj:Object, valueProp:String) 
	{
		this._loader 	  	= loader;
		this._loadFunction	= loadFunction;
		this._loadParms 	= loadParms;			
		this._valueObject  	= valueObj;
		this._valueProperty	= valueProp;
		
		return;
	}
	
	public get loader() : Object
	{
		return this._loader;
	}
	public get loadFunction() : String
	{
		return this._loadFunction;
	}
	public get loadParms() : Array<string>
	{
		return this._loadParms;
	}
	public get valueObj() : Object
	{
		return this._valueObject;
	}
	public get valueProperty() : String
	{
		return this._valueProperty;
	}
}