import { CEFObject } from "../core/CEFObject";
import { CUtil } from "../util/CUtil";
import { MObject } from "./MObject";
import { CObject } from "./CObject";

//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//  Copyright(c) 2013 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  Author(s): Kevin Willows                                                           
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


export class CMongo
{
	public static readonly FIND:string   	 	= '"find"';					// NOTE: these must be "quoted" 
	public static readonly INSERT:string 	 	= '"insert"'; 
	public static readonly CREATEACCT:string	= '"createacct"'; 
	public static readonly UPSERT:string 	 	= '"upsert"'; 
	public static readonly UPDATE:string 	 	= '"update"'; 
	public static readonly UNSET:string 		= '"unset"'; 
	public static readonly REMOVE:string 	 	= '"remove"';
	public static readonly RECYCLE:string	 	= '"recycle"';
	public static readonly RECOVER:string	 	= '"recover"';
	public static readonly DBCOMMAND:string   	= '"dbcommand"';
	
	public static readonly DBRUN_DBCOMMAND:string	= "dbcommand";	
	public static readonly DBRUN_LISTDBS:string		= "listdatabases";	
	public static readonly DBRUN_LISTCOLS:string	= "listcollections";	
	
	public static readonly DBRUN_DROPCOLLECTION:string = "dropcollection";		
	public static readonly DBRUN_UPDATEDOCUMENT:string = "updatedocument";
	
	public static readonly ACK_FIND:string    		= 'find';					// NOTE: these must not be "quoted" 
	public static readonly ACK_INSERT:string  		= 'insert'; 
	public static readonly ACK_CREATEACCT:string	= 'createacct'; 
	public static readonly ACK_UPSERT:string  		= 'upsert'; 
	public static readonly ACK_UPDATE:string  		= 'update'; 
	public static readonly ACK_UNSET:string  		= 'unset'; 
	public static readonly ACK_REMOVE:string  		= 'remove';
	public static readonly ACK_RECYCLE:string 		= 'recycle';
	public static readonly ACK_RECOVER:string 		= 'recover';
	public static readonly ACK_DBCOMMAND:string  	= 'dbcommand';
	
	public static readonly QUERY_ALL:string = "";
	
	public static readonly LOG_PACKET:string    = '"LOG_PACKET"';
	public static readonly LOG_TERMINATE:string = '"LOG_TERMINATE"';
	public static readonly LOG_PROGRESS:string  = '"LOG_PROGRESS"';		
	
	public static readonly ACKLOG_PACKET:string    = 'LOG_PACKET';
	public static readonly ACKLOG_TERMINATE:string = 'LOG_TERMINATE';
	public static readonly ACKLOG_PROGRESS:string  = 'LOG_PROGRESS';		
	public static readonly ACKLOG_NAK:string 	   = 'NAK_ERROR';		
	
	// These must match the equivalents in protocolStudyLdr.dart
	
	public static readonly _READY:string      = "READY";
	public static readonly _INPROGRESS:string = "IN PROGRESS";
	public static readonly _COMPLETE:string   = "COMPLETE";
	
	
	constructor()
	{
	}
	
	
	/**
	 * 
	 * 
	 */
	public static commandPacket(_source:string, _command:string, _collection:string, _query:Object, _database:string="TED") : string
	{
		let packet:string;
		let multi:boolean = false;
		let type:string;
		let item:string;
		
		// e.g. '{"source":"schoolview","command":"find","collection":"institutions","query":{}}'
		
		packet = '{"database":"' + _database + '","source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","query":{';
		
		for (item in _query)
		{
			if(multi) packet += ','; 
			
			packet += '"' + item + '":';
			
			type = CUtil.getQualifiedClassName(_query[item]);
			
			switch(type)
			{
				case "string":
					packet += '"' + _query[item] + '"';
					break;
				
				default:
					packet += _query[item];
					break;
			}
			
			multi= true;				
		}
		
		packet += '}}';
		
		return packet;
	}
	
	
	/**
	 * 
	 * 
	 */
	public static queryPacket(_source:string, _command:string, _collection:string, _query:Object, _limit:Object=null, _database:string="TED") : string
	{
		let packet:string;
		let multi:boolean = false;
		let multilimit:boolean = false;
		let type:string;
		let item:string;

		// e.g. '{"source":"schoolview","command":"find","collection":"institutions","query":{}}'

		packet = '{"database":"' + _database + '","source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","query":{';
		
		for (item in _query)
		{
			if(multi) packet += ','; 
			
			packet += '"' + item + '":';
			
			type = CUtil.getQualifiedClassName(_query[item]);
			
			switch(type)
			{
				case "string":
					packet += '"' + _query[item] + '"';
					break;
				
				default:
					packet += _query[item];
					break;
			}
			
			multi= true;				
		}
		
		packet += '}, "fields":{';
		
		for (item in _limit)
		{
			if(multilimit) packet += ','; 
			
			packet += '"' + item + '":';
			
			type = CUtil.getQualifiedClassName(_limit[item]);
			
			switch(type)
			{
				case "string":
					packet += '"' + _limit[item] + '"';
				break;
				
				default:
					packet += _limit[item];
				break;
			}
			
			multilimit= true;				
		}				
		
		packet += '}}';
		
		return packet;
	}
	
	
	/**
	 * 
	 * 
	 */
	public static recyclePacket(_source:string, _command:string, _collection:string, _query:Object, recover:string) : string
	{
		let packet:string;
		let multi:boolean = false;
		
		// e.g. '{"source":"schoolview","command":"find","collection":"institutions","query":{}}'
		
		packet = '{"source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","query":{';
		
		for (let item in _query)
		{
			//				trace(item);
			//				trace(_query[item]);
			//				trace(this[item].text);
			
			if(multi) packet += ','; 
			
			packet += '"' + item + '":"' + _query[item] + '"';
			
			multi= true;				
		}

		packet += '}, "document":{"\$set":{"isActive":' + recover + '}}}';
		
		return packet;
	}
	
	
	/**
	 * 
	 * 
	 */
	public static insertPacket(_source:string, _command:string, _collection:string, _objectDoc:Object ) : string
	{
		let packet:string;			
		let multi:boolean = false;
		
		// e.g. '{"source":"schoolview","command":"find","collection":"institutions","query":{}}'
		
		packet = '{"source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","document":';
		
		packet += JSON.stringify(_objectDoc);
		
		packet += '}';
		
		return packet;
	}
	
	
	/**
	 *  Note: We populate _updateObj sub-documents with CObjects to permit them to be readily identified 
	 *        in CMongo.parseUpdateFields - The goal is to permit the update of individual fields in subdocuments 
	 * 		  We use MObjects for documents that should be updated in their entirity 
	 * 
	 */
	public static updatePacket(_source:string, _command:string, _collection:string, _query:Object, _updateObj:Object ) : string
	{
		let packet:string;
		let multi:boolean = false;
		let item:string;
		
		// e.g. '{"source":"schoolview","command":"update","collection":"institutions","query":{"_id":"' + _notesEditItem._id + '"}, "document":{"\$set":{"Notes":"' + _notesEditItem.Notes + '"}}}'
		
		packet = '{"source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","query":{';
		
		for (item in _query)
		{
			if(multi) packet += ','; 
			
			packet += '"' + item + '":"' + _query[item] + '"';
			
			multi= true;				
		}
		
		// reset for the document scan
		multi = false;
		
		packet += '}, "document":{"\$set":{';
		
		packet += this.parseUpdateFields(_updateObj);
						
		packet += '}}}';
					
		return packet;
	}
	
	
	/**
	 *  Note: We populate _updateObj sub-documents with CObjects to permit them to be readily identified 
	 *        in CMongo.parseUpdateFields - The goal is to permit the update of individual fields in subdocuments 
	 * 		  We use MObjects for documents that should be updated in their entirity 
	 * 
	 */
	public static unsetFieldPacket(_source:string, _command:string, _collection:string, _query:Object, _updateObj:Object ) : string
	{
		let packet:string;
		let multi:boolean = false;
		let item:string;
		
		// e.g. '{"source":"schoolview","command":"update","collection":"institutions","query":{"_id":"' + _notesEditItem._id + '"}, "document":{"\$set":{"Notes":"' + _notesEditItem.Notes + '"}}}'
		
		packet = '{"source":"' + _source + '","command":' + _command + ',"collection":"' + _collection + '","query":{';
		
		for (item in _query)
		{
			if(multi) packet += ','; 
			
			packet += '"' + item + '":"' + _query[item] + '"';
			
			multi= true;				
		}
		
		// reset for the document scan
		multi = false;
		
		packet += '}, "document":{"\$unset":{';
		
		packet += this.parseUpdateFields(_updateObj);
		
		packet += '}}}';
		
		return packet;
	}
	
	
	/**
	 *  Note: We populate sub-documents with CObjects to permit them to be readily identified 
	 *        in CMongo.parseUpdateFields
	 * 
	 * 		db.<collection>.<command>({<query>}, { $set: { <field1>: <value>, <field2.subfield1>: <value>, ... } } }
	 * 
	 * 		db.products.update( { sku: "abc123" }, { $set: { quantity: 500, instock: true } } )
	 * 
	 */
	private static parseUpdateFields(node:Object, objPath:string="" ) : string
	{
		let objString:string ="";
		let className:string;
		let fieldMark:boolean = false;
		
		for(let value in node)
		{				
			// This is just to ensure we don't inadvertently use a regular "Object" which whould 
			// break the parse logic below
			
			className = CUtil.getQualifiedClassName(node[value]);
			
			if(className == "Object")
			{
				CUtil.trace("type Error: parseUpdateFields");
				
				throw(new Error("type Error: parseUpdateFields"));
			}
			
			
			// CObjects are parsable sub-objects - i.e. we don't want to replace the entire sub-document
			// but only to update fields within it.
			
			if(node[value] instanceof CObject)
			{
				if(fieldMark) objString += ',';
				fieldMark = false;
				
				objString += this.parseUpdateFields(node[value], objPath + value + '.');
			}
			
			// If it isn't a CObject it is either a value type (int,String, Bool) or an MObject
			// either of these is updated as a unit.
			
			else
			{
				if(objString.length > 0) objString += ',';
				
				// Add the key
				
				objString += '"' + objPath + value + '"' + ':';
				
				// Add the value - either an entire {object} or just a "field value"
				
				if(node[value] instanceof MObject)
					objString += JSON.stringify(node[value]);						
				else	
				{
					if(typeof node[value] === "string")
						objString += '"' + node[value] + '"';
					else
						objString += node[value];
				}
				
				fieldMark = true;
			}
		}
		
		return objString;
	}

	
	/**
	 * This builds a JSON expression of an associative array of key/value pairs which are structured as 
	 * 
	 * 		key		<form field id>				e.g. fm_1 | fm_2 ....
	 * 		value	<db document field id> 		e.g. "District"  "Address.City" etc
	 * 
	 * The "value" is used to construct a tempObj with a corresponding structure 
	 * The "key" is used to extract the value to be used from the Flex form component of the same name.		
	 * 
	 * We then JSON encode the resulting object and return it.
	 * 
	 */
	public static encodeAsJSON(_fields:Object, parent:Object) : string
	{			
		return JSON.stringify(this.encodeAsObject(null, _fields, parent));
	}
	
	
	/**
	 * This builds an Object from an associative array of key/value pairs structured as 
	 * 
	 * 		key		<control id>				e.g. fm_1 | fm_2 ....
	 * 		value	<db document field id> 		e.g. "District"  "Address.City" etc
	 * 
	 * The "value" is used to construct a tempObj with a corresponding structure 
	 * The "key" is used to extract the value to be used from the Flex form component of the same name.		
	 * 
	 * 
	 */
	public static encodeAsObject(host:Object, _fields:Object, parent:Object) : Object
	{
		let tempObj:Object = new Object;
		let leafObj:Object;
		let subDocName:string;
		let pathArray:Array<string>;
		
		if(host == null)
			tempObj = new Object;
		else
			tempObj = host;
		
		for (let formID in _fields)
		{				
			leafObj = tempObj;
			
			pathArray = _fields[formID].split(".");
			
			if(pathArray.length > 1)
			{
				subDocName = pathArray.shift();
				
				if(leafObj[subDocName] == undefined)
					leafObj[subDocName] = new Object;
				
				leafObj = this.objectBuilder(leafObj[subDocName], pathArray); 
			}	
			
			leafObj[pathArray[0]] = parent[formID].getItemData(); 
			
		}
		
		return tempObj;
	}
	
	
	public static objectBuilder(leafObj:Object, pathArray:Array<string>) : Object
	{
		let subDocName:string;
		
		if(pathArray.length > 1)
		{
			subDocName = pathArray.shift();
			
			if(leafObj[subDocName] == undefined)
				leafObj[subDocName] = new Object;
			
			leafObj = this.objectBuilder(leafObj, pathArray); 
		}	
		
		return leafObj;
	}
	

	/**
	 *  Note: We populate sub-documents with CObjects to permit them to be readily identified 
	 *        in CMongo.parseUpdateFields
	 */
	public static setValue(tarObj:Object, path:string, value:any) : void
	{
		let objPath:Array<string>;
		let dataObj:Object;
		let name:string;
		
		// support nested children
		
		dataObj = tarObj;
		
		objPath = path.split(".");
		
		while(objPath.length > 1)
		{
			name = objPath.shift();
			
			if(dataObj[name] == null)
				dataObj[name] = new CObject
			
			dataObj = dataObj[name];	
		}
		
		dataObj[objPath.shift()] = value;
	}
			
}

