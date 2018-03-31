////////////////////////////////////////////////////////////////////////////////
//
//  ADOBE SYSTEMS INCORPORATED
//  Copyright 2005-2006 Adobe Systems Incorporated
//  All Rights Reserved.
//
//  NOTICE: Adobe permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

namespace TutorEngineOne {

	//** Imports

import Event = createjs.Event;




/**
 *  The CEFPropertyChangeEventKind class defines the constant values 
 *  for the <code>kind</code> property of the CEFPropertyChangeEvent class.
 * 
 */
export class CEFPropertyChangeEventKind
{

	//--------------------------------------------------------------------------
	//
	//  Class constants
	//
	//--------------------------------------------------------------------------

    /**
	 *  Indicates that the value of the property changed.
	 *  
	 */
	public static readonly UPDATE:string = "update";

    /**
	 *  Indicates that the property was deleted from the object.
	 *  
	 */
	public static readonly DELETE:string = "delete";
}
}
